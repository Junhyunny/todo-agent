#!/bin/bash
# Claude Code PreToolUse hook.
# Input (stdin): {"command": "..."}
# Block: exit non-zero

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | python3 -c "import json,sys; print(json.load(sys.stdin).get('command',''))" 2>/dev/null)

if ! echo "$COMMAND" | grep -qE "git\s+commit"; then
    exit 0
fi

PROJECT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
bash "$PROJECT_ROOT/.claude/hooks/run-checks.sh"
