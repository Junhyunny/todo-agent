from pathlib import Path

import yaml
from app import app

spec_path = Path(__file__).parent.parent.parent / "spec" / "openapi.yaml"
spec_path.parent.mkdir(parents=True, exist_ok=True)
spec_path.write_text(yaml.dump(app.openapi(), allow_unicode=True, sort_keys=False), encoding="utf-8")
print(f"OpenAPI spec exported to {spec_path}")
