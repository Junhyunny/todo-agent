"""add_code_to_tools

Revision ID: 9f1df8c5a621
Revises: 2b43f59dae43
Create Date: 2026-04-29 11:12:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "9f1df8c5a621"
down_revision: Union[str, Sequence[str], None] = "2b43f59dae43"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
  """Upgrade schema."""
  op.add_column("tb_tools", sa.Column("code", sa.String(), nullable=True))
  op.execute("UPDATE tb_tools SET code = 'WEB_BROWSER_CONTROL' WHERE id = 'd4f3b2a1-1234-5678-abcd-ef0123456789'")
  op.execute("UPDATE tb_tools SET code = 'LEGACY_' || id WHERE code IS NULL")
  with op.batch_alter_table("tb_tools") as batch_op:
    batch_op.alter_column("code", existing_type=sa.String(), nullable=False)
    batch_op.create_unique_constraint("uq_tb_tools_code", ["code"])


def downgrade() -> None:
  """Downgrade schema."""
  with op.batch_alter_table("tb_tools") as batch_op:
    batch_op.drop_constraint("uq_tb_tools_code", type_="unique")
    batch_op.drop_column("code")
