"""add_engine_used_to_analyses

Revision ID: c1a2b3c4d5e6
Revises: ebfc95ad285e
Create Date: 2026-09-12 11:30:00

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "c1a2b3c4d5e6"
down_revision: Union[str, Sequence[str], None] = "ebfc95ad285e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "analyses",
        sa.Column("engine_used", sa.String(length=50), server_default="ai", nullable=True),
    )


def downgrade() -> None:
    op.drop_column("analyses", "engine_used")
