"""create_analyses_table

Revision ID: ebfc95ad285e
Revises: 1f7bcae14b59
Create Date: 2026-09-11 18:41:20

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "ebfc95ad285e"
down_revision: Union[str, Sequence[str], None] = "1f7bcae14b59"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "analyses",
        sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("user_id", sa.Uuid(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("resume_id", sa.Uuid(as_uuid=True), sa.ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False),
        sa.Column("job_description", sa.Text(), nullable=False),
        sa.Column("match_score", sa.Integer(), nullable=True),
        sa.Column(
            "missing_keywords",
            sa.JSON().with_variant(postgresql.JSONB(astext_type=sa.Text()), "postgresql"),
            nullable=True,
        ),
        sa.Column("suggestions", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=20), server_default="completed", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index(op.f("ix_analyses_id"), "analyses", ["id"], unique=False)
    op.create_index(op.f("ix_analyses_user_id"), "analyses", ["user_id"], unique=False)
    op.create_index(op.f("ix_analyses_resume_id"), "analyses", ["resume_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_analyses_resume_id"), table_name="analyses")
    op.drop_index(op.f("ix_analyses_user_id"), table_name="analyses")
    op.drop_index(op.f("ix_analyses_id"), table_name="analyses")
    op.drop_table("analyses")
