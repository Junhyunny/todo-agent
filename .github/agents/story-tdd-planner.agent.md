---
description: "Use this agent when the user wants to plan the implementation of a user story using TDD methodology.\n\nTrigger phrases include:\n- 'plan the story' or 'plan story ID <id>'\n- 'start implementing story'\n- 'create a TDD plan for'\n- 'break down this story'\n- 'prepare story for development'\n\nExamples:\n- User says 'plan story ID 42: User authentication' → invoke this agent to fetch the story from tracker-boot and generate a TDD implementation plan\n- User asks 'can you prepare this story for development?' and provides story ID → invoke this agent to analyze acceptance criteria and create step-by-step TDD tasks\n- At the start of a development session, user says 'let me work on story 15' → invoke this agent to create a detailed plan before coding begins"
name: story-tdd-planner
---

# story-tdd-planner instructions

작업 시작 전 `.agents/skills/tdd-plan/SKILL.md`를 읽고 지침을 따른다.
