.PHONY: dev frontend bot smee install install-frontend install-bot build-bot

# ── Run everything ────────────────────────────────────────────────────────────
# Opens 3 processes: smee proxy + gitbot (port 3000) + frontend (port 3001)
dev: install build-bot
	@echo "\n🚀 Starting BountyHub...\n"
	@echo "  Frontend  → http://localhost:3001"
	@echo "  Gitbot    → http://localhost:3000/api/webhook"
	@echo "  Smee      → https://smee.io/U9aYk12CX4xUIYz\n"
	@trap 'kill 0' SIGINT; \
		$(MAKE) smee & \
		$(MAKE) bot & \
		$(MAKE) frontend & \
		wait

# ── Individual targets ────────────────────────────────────────────────────────
frontend:
	cd frontend && yarn dev -p 3001

bot: build-bot
	cd gitbot && node ./dist/index.js

smee:
	npx --yes smee-client --url https://smee.io/U9aYk12CX4xUIYz --target http://localhost:3000/api/webhook

# ── Setup ─────────────────────────────────────────────────────────────────────
install: install-frontend install-bot

install-frontend:
	cd frontend && yarn install

install-bot:
	cd gitbot && npm install

build-bot:
	cd gitbot && npx tsc
