#!/bin/bash
# Shared pre-commit check logic. Called by agent-specific hook scripts.
# Exits 0 on success, 1 on failure.

PROJECT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)

echo "=== pre-commit checks ==="

# ── Frontend ──────────────────────────────────────────────────────────
cd "$PROJECT_ROOT/frontend"

echo ""
echo "[frontend] lint"
npx biome check . || { echo "FAIL: frontend lint — run: cd frontend && npm run check"; exit 1; }

echo "[frontend] typecheck"
npm run typecheck || { echo "FAIL: frontend typecheck"; exit 1; }

echo "[frontend] coverage (threshold: 80%)"
npm run test:coverage || { echo "FAIL: frontend coverage below threshold"; exit 1; }

# ── Backend ───────────────────────────────────────────────────────────
cd "$PROJECT_ROOT/backend"

echo ""
echo "[backend] lint"
.venv-sbx/bin/ruff check . || { echo "FAIL: backend lint — run: cd backend && make check VENV=.venv-sbx"; exit 1; }

echo "[backend] coverage (threshold: 80%)"
.venv-sbx/bin/pytest --cov --cov-report=term-missing --cov-fail-under=80 || { echo "FAIL: backend coverage below threshold"; exit 1; }

echo ""
echo "=== all checks passed ==="
exit 0
