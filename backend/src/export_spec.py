import json
from pathlib import Path

from app import app

spec_path = Path(__file__).parent.parent.parent / "spec" / "openapi.json"
spec_path.parent.mkdir(parents=True, exist_ok=True)
spec_path.write_text(json.dumps(app.openapi(), indent=2, ensure_ascii=False), encoding="utf-8")
print(f"OpenAPI spec exported to {spec_path}")
