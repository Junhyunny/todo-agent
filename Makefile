RESUME_OPT = $(if $(RESUME),--resume=$(RESUME),)

.PHONY: start-copilot
start-copilot:
	copilot \
  		--allow-tool='shell(git:*)' \
		--allow-tool='shell(cat:*)' \
		--allow-tool='shell(find:*)' \
		--allow-tool='shell(grep:*)' \
		--allow-tool='shell(xargs:*)' \
		--allow-tool='tracker-boot-mcp(tb_get_story)' \
		--allow-tool='tracker-boot-mcp(tb_get_story_tasks)' \
		--allow-tool='tracker-boot-mcp(tb_get_story_comments)' \
		--allow-tool='tracker-boot-mcp(tb_batch_create_tasks)' \
		--allow-tool='tracker-boot-mcp(tb_update_story_status)' \
		--allow-tool='tracker-boot-mcp(tb_update_task)' \
		--deny-tool='shell(git push)' \
		$(RESUME_OPT)

.PHONY: start-claude
start-claude:
	claude \
  		--allowed-tools='Bash(git:*)' \
		--allowed-tools='Bash(cat:*)' \
		--allowed-tools='Bash(find:*)' \
		--allowed-tools='Bash(grep:*)' \
		--allowed-tools='Bash(xargs:*)' \
		--allowed-tools='Write Update' \
		--allowed-tools='mcp__tracker-boot-server__tb_get_projects:' \
		--allowed-tools='mcp__tracker-boot-server__tb_get_story' \
		--allowed-tools='mcp__tracker-boot-server__tb_get_story_tasks' \
		--allowed-tools='mcp__tracker-boot-server__tb_get_story_comments' \
		--allowed-tools='mcp__tracker-boot-server__tb_batch_create_tasks' \
		--allowed-tools='mcp__tracker-boot-server__tb_update_story_status' \
		--allowed-tools='mcp__tracker-boot-server__tb_update_task' \
		--disallowed-tools='Bash(git push)' \
		$(RESUME_OPT)

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