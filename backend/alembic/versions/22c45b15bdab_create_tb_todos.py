"""create tb_todos table

Revision ID: 22c45b15bdab
Revises: 5c2ce09e0a10
Create Date: 2026-04-17 15:20:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "22c45b15bdab"
down_revision: Union[str, Sequence[str], None] = "5c2ce09e0a10"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
  """Upgrade schema."""
  op.create_table(
    "tb_todos",
    sa.Column("id", sa.String(), nullable=False),
    sa.Column("title", sa.String(), nullable=False),
    sa.Column("content", sa.String(), nullable=False),
    sa.Column("status", sa.String(), nullable=False),
    sa.PrimaryKeyConstraint("id"),
  )


def downgrade() -> None:
  """Downgrade schema."""
  op.drop_table("tb_todos")
