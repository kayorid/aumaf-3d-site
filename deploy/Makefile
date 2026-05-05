.PHONY: help deploy logs status restart rollback backup-snapshot pull migrate up down restart-backend caddy-reload caddy-test

DEPLOY_DIR  := /srv/aumaf/compose
ENV_FILE    := /srv/aumaf/env/.env.production
COMPOSE_FILE := docker-compose.production.yml
COMPOSE     := docker compose -f $(COMPOSE_FILE) --env-file $(ENV_FILE)

help:
	@echo "AUMAF 3D — production make targets"
	@echo "  deploy          pull images + run migrations + up"
	@echo "  pull            pull latest images"
	@echo "  migrate         run prisma migrate deploy (one-shot job)"
	@echo "  up              start all services"
	@echo "  down            stop all services (preserves volumes)"
	@echo "  restart-backend restart only backend"
	@echo "  rollback TAG=X  pull & restart with explicit image tag"
	@echo "  logs            tail logs (last 100 lines, follow)"
	@echo "  status          docker compose ps + caddy status"
	@echo "  backup-snapshot pg_dump on demand to /srv/aumaf/backups/manual/"
	@echo "  caddy-test      validate Caddyfile syntax"
	@echo "  caddy-reload    reload Caddy config (preserves connections)"

deploy: pull migrate up

pull:
	cd $(DEPLOY_DIR) && $(COMPOSE) pull

migrate:
	cd $(DEPLOY_DIR) && $(COMPOSE) run --rm backend-migrate

up:
	cd $(DEPLOY_DIR) && $(COMPOSE) up -d --remove-orphans
	cd $(DEPLOY_DIR) && $(COMPOSE) ps

down:
	cd $(DEPLOY_DIR) && $(COMPOSE) down

restart-backend:
	cd $(DEPLOY_DIR) && $(COMPOSE) restart backend

logs:
	cd $(DEPLOY_DIR) && $(COMPOSE) logs -f --tail=100

status:
	cd $(DEPLOY_DIR) && $(COMPOSE) ps
	@echo "--- Caddy ---"
	systemctl status caddy --no-pager | head -8

rollback:
	@if [ -z "$(TAG)" ]; then echo "Usage: make rollback TAG=<sha-or-tag>"; exit 1; fi
	IMAGE_BACKEND=ghcr.io/kayorid/aumaf-3d-site/backend:$(TAG) \
	IMAGE_FRONTEND_PUBLIC=ghcr.io/kayorid/aumaf-3d-site/frontend-public:$(TAG) \
	IMAGE_FRONTEND_ADMIN=ghcr.io/kayorid/aumaf-3d-site/frontend-admin:$(TAG) \
		$(MAKE) pull up

backup-snapshot:
	@TS=$$(date +%Y%m%d-%H%M%S); \
	mkdir -p /srv/aumaf/backups/manual; \
	cd $(DEPLOY_DIR) && $(COMPOSE) exec -T postgres \
		pg_dump -Fc -U $${POSTGRES_USER:-aumaf} $${POSTGRES_DB:-aumaf_prod} \
		> /srv/aumaf/backups/manual/db-$$TS.dump; \
	ls -la /srv/aumaf/backups/manual/db-$$TS.dump

caddy-test:
	caddy validate --config /etc/caddy/Caddyfile

caddy-reload:
	systemctl reload caddy
	systemctl status caddy --no-pager | head -8
