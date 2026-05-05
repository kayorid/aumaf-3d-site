# Runbook — Backup & Restore AUMAF 3D

## Estratégia atual

Backup primário: **snapshot da Hostinger** (VPS inteira, diário, gerenciado pelo provedor — ver painel `hpanel.hostinger.com`).

Backup adicional opcional: `pg_dump` manual via `make backup-snapshot` antes de migrations destrutivas (gera `.dump` em `/srv/aumaf/backups/manual/`).

**Decisão consciente** (Q-5 da spec): sem off-site externo (R2/B2). Risco de corrupção lenta capturada em snapshot de 24h é assumido.

## Restore — VPS completa (Hostinger snapshot)

1. Acessar painel Hostinger → VPS `srv1643738` → **"Backups e snapshots"**
2. Selecionar snapshot por data
3. Clicar **"Restaurar"** — VPS é desligada, disco substituído, religada
4. Tempo: 5–15 min (VPS fica fora durante o processo)
5. Após restaurar:
   - Verificar `ssh deploy@2.24.72.8` funciona (chave SSH preservada)
   - `sudo systemctl status caddy docker fail2ban ufw`
   - `sudo make -C /srv/aumaf/compose status`
   - Smoke `https://api-aumaf.kayoridolfi.ai/health`

## Restore — apenas o banco (pg_dump manual)

Pré-requisito: snapshot manual em `/srv/aumaf/backups/manual/db-YYYYMMDD-HHMMSS.dump`

### Listar dumps disponíveis

```bash
ssh deploy@2.24.72.8
ls -lh /srv/aumaf/backups/manual/
```

### Restaurar (DESTRUTIVO)

```bash
sudo bash /srv/aumaf/compose/scripts/restore-snapshot.sh \
  /srv/aumaf/backups/manual/db-20260504-120000.dump
```

O script vai:
1. Pedir confirmação interativa (digitar `DESTRUIR`)
2. Parar o backend
3. `DROP DATABASE` + `CREATE DATABASE`
4. `pg_restore` do dump
5. Rodar migrations Prisma para garantir schema atual
6. Subir backend de volta

Tempo: 1–3 min para banco de até 100 MB.

## Antes de migrations destrutivas

Sempre rodar manual:

```bash
sudo make -C /srv/aumaf/compose backup-snapshot
```

Salva em `/srv/aumaf/backups/manual/db-<timestamp>.dump`.

## Inspecionar dump sem restaurar

```bash
docker run --rm -v /srv/aumaf/backups/manual:/backups postgres:16-alpine \
  pg_restore --list /backups/db-<timestamp>.dump | head -50
```

## Backup de mídia (MinIO)

MinIO está em volume nomeado `minio_data`. O snapshot Hostinger captura tudo.

Se precisar exportar manualmente:

```bash
docker run --rm -v aumaf-prod_minio_data:/source -v /srv/aumaf/backups/manual:/dest alpine \
  tar -czf /dest/minio-$(date +%Y%m%d).tar.gz -C /source .
```

## Validação pré-go-live (recomendação)

Pelo menos uma vez antes do anúncio ao cliente:

1. Tirar `make backup-snapshot`
2. Importar em ambiente local Docker (`pg_restore` em postgres local)
3. Validar contagem de tabelas/registros
4. Confirmar restore funciona
5. Documentar tempo gasto

## Limpeza periódica

```bash
# Snapshots manuais > 30 dias
find /srv/aumaf/backups/manual -name 'db-*.dump' -mtime +30 -delete
```
