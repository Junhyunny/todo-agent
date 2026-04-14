"""rename agents table to todo_agent_db

Revision ID: a271ca618b00
Revises: 815a221c8986
Create Date: 2026-04-12 09:29:12.206432

"""
from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'a271ca618b00'
down_revision: Union[str, Sequence[str], None] = '815a221c8986'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.rename_table("agents", "todo_agent_db")


def downgrade() -> None:
    """Downgrade schema."""
    op.rename_table("todo_agent_db", "agents")
