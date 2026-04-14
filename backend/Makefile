format:
	ruff format .

check:
	ruff check --fix .

generate-spec:
	cd src && PYTHONPATH=. ../.venv/bin/python export_spec.py

migrate:
	.venv/bin/alembic upgrade head

test:
	.venv/bin/pytest -v

run:
	PYTHONPATH=src uvicorn app:app --host 127.0.0.1 --port 8000