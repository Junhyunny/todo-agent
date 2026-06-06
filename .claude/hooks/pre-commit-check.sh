#!/bin/bash

INPUT=$(cat)

# Detect agent format and extract command:
#   Claude Code: {"command": "..."}
#   Codex:       {"tool_input": {"command": "..."}, "hook_event_name": "...", ...}
COMMAND=$(echo "$INPUT" | python3 -c "
import json, sys
data = json.load(sys.stdin)
if 'tool_input' in data:
    print(data.get('tool_input', {}).get('command', ''))
else:
    print(data.get('command', ''))
" 2>/dev/null)

if ! echo "$COMMAND" | grep -qE "git\s+commit"; then
    exit 0
fi

PROJECT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)

echo "=== pre-commit checks ==="

# ── Frontend ──────────────────────────────────────────────────────────
cd "$PROJECT_ROOT/frontend"

echo ""
echo "[frontend] lint"
npx biome check . || { echo "FAIL: frontend lint — run: cd frontend && npm run check" >&2; exit 2; }

echo "[frontend] typecheck"
npm run typecheck || { echo "FAIL: frontend typecheck" >&2; exit 2; }

echo "[frontend] coverage (threshold: 80%)"
npm run test:coverage || { echo "FAIL: frontend coverage below threshold" >&2; exit 2; }

# ── Backend ───────────────────────────────────────────────────────────
cd "$PROJECT_ROOT/backend"

echo ""
echo "[backend] lint"
.venv-sbx/bin/ruff check . || { echo "FAIL: backend lint — run: cd backend && make check VENV=.venv-sbx" >&2; exit 2; }

echo "[backend] coverage (threshold: 80%)"
.venv-sbx/bin/pytest --cov --cov-report=term-missing --cov-fail-under=80 || { echo "FAIL: backend coverage below threshold" >&2; exit 2; }

echo ""
echo "=== all checks passed ==="
exit 0
