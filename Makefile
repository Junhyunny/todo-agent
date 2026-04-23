RESUME_OPT = $(if $(RESUME),--resume=$(RESUME),)

.PHONY: start-copilot
start-copilot:
	copilot \
  		--allow-tool='shell(git:*)' \
  		--allow-tool='write' \
		--allow-tool='tracker-boot-server(tb_get_story)' \
		--allow-tool='tracker-boot-server(tb_get_story_tasks)' \
		--allow-tool='tracker-boot-server(tb_get_story_comments)' \
		--allow-tool='tracker-boot-server(tb_batch_create_tasks)' \
		--allow-tool='tracker-boot-server(tb_update_story_status)' \
		--allow-tool='tracker-boot-server(tb_update_task)' \
		--deny-tool='shell(git push)' \
  		--deny-tool='shell(sudo)'
		$(RESUME_OPT)

start-claude:
	claude \
  		--allowedTools 'Bash(git *)' \
  		'Bash(find *)' \
  		'Bash(grep *)' \
  		'Read' \
  		'Write(./*)' \
  		'Update' \
		'mcp__tracker-boot-server__tb_get_projects:' \
		'mcp__tracker-boot-server__tb_get_story' \
		'mcp__tracker-boot-server__tb_get_story_tasks' \
		'mcp__tracker-boot-server__tb_get_story_comments' \
		'mcp__tracker-boot-server__tb_batch_create_tasks' \
		'mcp__tracker-boot-server__tb_update_story_status' \
		'mcp__tracker-boot-server__tb_update_task' \
		--disallowedTools 'Bash(git push *)' \
		'Read(.env*)' \
		'Bash(sudo *)' \
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