#!/bin/bash
# Codex PreToolUse hook.
# Input (stdin): {"tool_input": {"command": "..."}, "hook_event_name": "...", ...}
# Block: exit 2 + JSON deny output to stdout

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | python3 -c "import json,sys; print(json.load(sys.stdin).get('tool_input',{}).get('command',''))" 2>/dev/null)

if ! echo "$COMMAND" | grep -qE "git\s+commit"; then
    exit 0
fi

PROJECT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
OUTPUT=$(bash "$PROJECT_ROOT/.claude/hooks/run-checks.sh" 2>&1)
EXIT_CODE=$?

echo "$OUTPUT"

if [ $EXIT_CODE -ne 0 ]; then
    REASON=$(echo "$OUTPUT" | grep "^FAIL:" | head -1)
    python3 -c "
import json, sys
print(json.dumps({
    'hookSpecificOutput': {
        'permissionDecision': 'deny',
        'permissionDecisionReason': sys.argv[1]
    }
}))
" "${REASON:-Pre-commit checks failed}"
    exit 2
fi
