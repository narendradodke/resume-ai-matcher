"""add_oauth_columns_to_users

Revision ID: f2e1d0c9b8a7
Revises: c1a2b3c4d5e6
Create Date: 2026-09-12 14:05:00

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = "f2e1d0c9b8a7"
down_revision: Union[str, Sequence[str], None] = "c1a2b3c4d5e6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("oauth_provider", sa.String(length=50), nullable=True))
    op.add_column("users", sa.Column("oauth_id", sa.String(length=255), nullable=True))
    op.create_index(op.f("ix_users_oauth_id"), "users", ["oauth_id"], unique=False)
    op.alter_column("users", "password_hash", existing_type=sa.String(length=255), nullable=True)


def downgrade() -> None:
    op.alter_column("users", "password_hash", existing_type=sa.String(length=255), nullable=False)
    op.drop_index(op.f("ix_users_oauth_id"), table_name="users")
    op.drop_column("users", "oauth_id")
    op.drop_column("users", "oauth_provider")
