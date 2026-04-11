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
  		--allowTools='shell(git:*)' \
		--allowTools='shell(cat:*)' \
		--allowTools='shell(find:*)' \
		--allowTools='shell(grep:*)' \
		--allowTools='shell(xargs:*)' \
		--allowTools='tracker-boot(tb_get_story)' \
		--allowTools='tracker-boot(tb_get_story_tasks)' \
		--allowTools='tracker-boot(tb_get_story_comments)' \
		--allowTools='tracker-boot(tb_batch_create_tasks)' \
		--allowTools='tracker-boot(tb_update_story_status)' \
		--allowTools='tracker-boot(tb_update_task)' \
		--deniedTools='shell(git push)' \
		$(RESUME_OPT)