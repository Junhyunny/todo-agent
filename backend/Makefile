VENV ?= .venv

format:
	$(VENV)/bin/ruff format .

check:
	$(VENV)/bin/ruff check --fix .

generate-spec:
	cd src && PYTHONPATH=. ../$(VENV)/bin/python export_spec.py

migrate:
	$(VENV)/bin/alembic upgrade head

test:
	$(VENV)/bin/pytest -v

run:
	PYTHONPATH=src uvicorn app:app --host 127.0.0.1 --port 8000
