# Runbook — Master Key para Integration Secrets

**Contexto:** A partir da feature `botyio-config-ui` (ADR-002), as credenciais de integração (Botyio API key, webhook secret, etc.) vivem criptografadas em `integration_secrets` (AES-256-GCM). A master key fica fora do banco e fora do `.env`, em arquivo separado.

**Escopo:** provisionamento inicial, rotação, restauração e recuperação de desastre.

---

## 1. Provisionamento inicial (uma vez por VPS)

> ⚠️ **Owner crítico**: o container backend roda como user não-root `app` (uid 100, gid 101). A master key precisa ser legível por esse uid — não basta `chown deploy:deploy`. Use `chown 100:101`.

```bash
# Como deploy@vps:
sudo install -d -m 0755 -o deploy -g deploy /etc/aumaf
sudo openssl rand -out /etc/aumaf/master.key 32
# Owner = uid:gid do user 'app' DENTRO do container backend (não do host).
sudo chown 100:101 /etc/aumaf/master.key
sudo chmod 400 /etc/aumaf/master.key

# Verificação
ls -la /etc/aumaf/master.key  # esperado: -r-------- 1 100 101 32 ...
file /etc/aumaf/master.key    # esperado: data (binário)

# Se ainda não souber qual uid:gid o container usa, descubra com:
sudo docker run --rm --entrypoint=id <imagem-backend>
# ou inspecione: sudo docker inspect aumaf-prod-backend-1 --format '{{.Config.User}}'
```

**Por que não `chown deploy:deploy`**: o uid `deploy` (1001 no host) NÃO existe dentro do container. Quando o backend (rodando como uid 100) tenta abrir o arquivo, recebe `EACCES: permission denied` mesmo com `chmod 400`, e o processo encerra com `[FATAL] master key indisponível em produção` (R11). Aprendido na hard way no PR #15.

> ⚠️ **Backup off-server obrigatório.** Salve uma cópia criptografada em local seguro (1Password, Bitwarden, ou arquivo GPG-encrypted em outro server). Sem essa key, **todos os secrets em `integration_secrets` ficam inacessíveis** — recuperação só por re-cadastro manual.

```bash
# Backup recomendado (cifrado com GPG):
gpg --symmetric --cipher-algo AES256 --output ~/master-aumaf.key.gpg /etc/aumaf/master.key
# Depois mova ~/master-aumaf.key.gpg para fora da VPS (1Password attachment, etc.)
```

## 2. Verificar montagem no Docker Compose

`deploy/docker-compose.production.yml` deve conter no serviço `backend`:

```yaml
environment:
  MASTER_KEY_PATH: /etc/aumaf/master.key
volumes:
  - /etc/aumaf/master.key:/etc/aumaf/master.key:ro
```

Após editar:

```bash
cd /srv/aumaf/compose
docker compose -f docker-compose.production.yml up -d backend
docker compose logs --tail=30 backend
# Esperado: log "Bootstrap de integration secrets concluído" ou similar
# Se ver "[FATAL] master key indisponível em produção" → backend recusou subir
```

## 3. Rotação da master key

⚠️ **Não-trivial.** Rotacionar exige **re-cifrar todas as rows** de `integration_secrets` com a key nova. Hoje não há job automático — requer manutenção dirigida.

Procedimento manual (downtime ~1min):

```bash
# 1) Pare o backend
docker compose stop backend

# 2) Gere a key NOVA em paralelo (não sobrescreva ainda)
sudo openssl rand -out /etc/aumaf/master.key.new 32
sudo chmod 400 /etc/aumaf/master.key.new && sudo chown 100:101 /etc/aumaf/master.key.new

# 3) Rode um script de migração (a escrever quando for necessário) que:
#    - decifra com a key antiga (/etc/aumaf/master.key)
#    - re-cifra com a key nova (/etc/aumaf/master.key.new)
#    - faz UPDATE em integration_secrets row a row dentro de uma transação

# 4) Após migração bem sucedida, troque os arquivos:
sudo mv /etc/aumaf/master.key /etc/aumaf/master.key.old.$(date +%s)
sudo mv /etc/aumaf/master.key.new /etc/aumaf/master.key

# 5) Suba o backend
docker compose start backend
docker compose logs --tail=20 backend  # validar que decifragem ok
```

## 4. Recuperação de desastre

### Cenário A — VPS perdida, mas tem backup criptografado da master key

```bash
# Na VPS nova:
gpg --decrypt master-aumaf.key.gpg | sudo tee /etc/aumaf/master.key > /dev/null
sudo chmod 400 /etc/aumaf/master.key && sudo chown 100:101 /etc/aumaf/master.key
# Restaure também o backup do Postgres (já contém o ciphertext)
# Backend deve voltar a operar normalmente
```

### Cenário B — Master key perdida, sem backup

Os valores em `integration_secrets` ficam **inacessíveis**. Procedimento:

1. Acesse `/admin/integrations/botyio` (a UI mostrará "credencial pendente")
2. Re-cadastre as credenciais Botyio (gere novas no painel se necessário)
3. Os valores antigos são sobrescritos pelos novos no upsert

> Esse cenário é **uma das razões** pelas quais não existe botão "revelar" no admin: se o admin tivesse acesso ao plaintext, poderia anotar fora do sistema; sem isso, a única recuperação válida é rotação na origem.

## 5. Validação rápida

Após qualquer mudança:

```bash
# 1) Health check
curl -fsS http://localhost:3000/health | jq

# 2) Tente um teste de conexão pela UI (/admin/integrations/botyio → "Testar conexão")
#    Se retornar OK 200ms-ish, decifragem está funcional.

# 3) Logs estruturados não devem conter plaintext:
docker compose logs --tail=200 backend | grep -i "bty_lds_\|whsec_"  # esperado: 0 matches
```

## 6. Anti-padrões absolutos

🚫 **Nunca**:

- Commitar o conteúdo de `master.key`
- Colocar a key em `.env.production` ou em variável Docker
- Usar `chmod 644` ou expor a key fora da VM
- Compartilhar a key por chat/email
- Reusar a mesma key entre staging e produção
- Pular a etapa de backup off-server

## 7. Dicas operacionais

- Monitore o boot do backend após qualquer deploy: o log `Bootstrap de integration secrets concluído` confirma que o flow está saudável
- Se ver `[FATAL] master key indisponível em produção` no log: investigue **antes** de tentar restartar. Pode ser permissão, montagem do volume errada, ou arquivo realmente ausente
- Auditoria: filtre logs estruturados por `tag=audit:integration-secret` para ver toda mudança de credencial
