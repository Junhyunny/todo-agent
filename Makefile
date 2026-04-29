.PHONY: start-copilot
start-copilot:
	sbx run copilot-todo-agent

.PHONY: stop-copilot
start-copilot:
	sbx stop copilot-todo-agent

.PHONY: start-claude
start-claude:
	sbx run claude-todo-agent

.PHONY: stop-claude
stop-claude:
	sbx stop claude-todo-agent

.PHONY: start-codex
start-codex:
	sbx run codex-todo-agent

.PHONY: stop-codex
start-codex:
	sbx stop codex-todo-agent

.PHONY: add-allowed-network-policy
add-allowed-network-policy:
	sbx policy allow network d5l0dvt14r5h8.cloudfront.net

.PHONY: typecheck-frontend
typecheck-frontend:
	cd frontend && npm run typecheck

.PHONY: format-lint
format-lint:
	cd backend && make check
	cd frontend && npm run check

.PHONY: test-all
test-all:
	cd backend && make test
	cd frontend && npm run test

.PHONY: start-frontend
start-frontend:
	cd frontend && npm run start

.PHONY: start-backend
start-backend:
	cd backend && make run