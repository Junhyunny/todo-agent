RESUME_OPT = $(if $(RESUME),--resume=$(RESUME),)

.PHONY: start-copilot
start-copilot:
	copilot \
  		--allow-tool='shell(git:*)' \
		--allow-tool='shell(cat:*)' \
		--allow-tool='shell(find:*)' \
		--allow-tool='shell(grep:*)' \
		--allow-tool='shell(xargs:*)' \
		--allow-tool='tracker-boot(tb_get_story)' \
		--allow-tool='tracker-boot(tb_get_story_tasks)' \
		--allow-tool='tracker-boot(tb_get_story_comments)' \
		--allow-tool='tracker-boot(tb_batch_create_tasks)' \
		--allow-tool='tracker-boot(tb_update_story_status)' \
		--allow-tool='tracker-boot(tb_update_task)' \
		--deny-tool='shell(git push)' \
		$(RESUME_OPT)

.PHONY: start-claude
start-claude:
	claude \
  		--allowed-tools='shell(git:*)' \
		--allowed-tools='shell(cat:*)' \
		--allowed-tools='shell(find:*)' \
		--allowed-tools='shell(grep:*)' \
		--allowed-tools='shell(xargs:*)' \
		--allowed-tools='mcp__tracker-boot-server__tb_get_projects:' \
		--allowed-tools='mcp__tracker-boot-server__tb_get_story' \
		--allowed-tools='mcp__tracker-boot-server__tb_get_story_tasks' \
		--allowed-tools='mcp__tracker-boot-server__tb_get_story_comments' \
		--allowed-tools='mcp__tracker-boot-server__tb_batch_create_tasks' \
		--allowed-tools='mcp__tracker-boot-server__tb_update_story_status' \
		--allowed-tools='mcp__tracker-boot-server__tb_update_task' \
		--disallowed-tools='shell(git push)' \
		$(RESUME_OPT)