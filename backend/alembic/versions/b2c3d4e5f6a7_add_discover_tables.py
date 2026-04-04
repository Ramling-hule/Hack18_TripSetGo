"""add_discover_tables

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-04-04 12:00:00.000000

Adds:
  - trips table (full social travel model)
  - trip_likes table
  - trip_saves table
  - trip_comments table
  - user_follows table
  - Extend users table: username, profile_image, bio, followers_count, following_count
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

# revision identifiers, used by Alembic.
revision: str = 'b2c3d4e5f6a7'
down_revision: Union[str, Sequence[str], None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── Extend users table with social/profile columns ──────────────
    op.add_column('users', sa.Column('username', sa.String(50), nullable=True, unique=True))
    op.add_column('users', sa.Column('profile_image', sa.String(500), nullable=True))
    op.add_column('users', sa.Column('bio', sa.String(500), nullable=True))
    op.add_column('users', sa.Column('followers_count', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('users', sa.Column('following_count', sa.Integer(), nullable=False, server_default='0'))
    op.create_index('ix_users_username', 'users', ['username'], unique=True)

    # ── Create trips table ──────────────────────────────────────────
    op.create_table(
        'trips',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('destination', sa.String(255), nullable=False),
        sa.Column('source', sa.String(255), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('start_date', sa.String(50), nullable=True),
        sa.Column('end_date', sa.String(50), nullable=True),
        sa.Column('duration_days', sa.Integer(), nullable=True),
        sa.Column('budget', sa.Float(), nullable=True),
        sa.Column('cost_per_person', sa.Float(), nullable=True),
        sa.Column('num_travelers', sa.Integer(), nullable=True, server_default='1'),
        sa.Column('group_type', sa.String(50), nullable=True, server_default='solo'),
        sa.Column('itinerary', sa.JSON(), nullable=True),
        sa.Column('transport', sa.JSON(), nullable=True),
        sa.Column('stay', sa.JSON(), nullable=True),
        sa.Column('budget_summary', sa.JSON(), nullable=True),
        sa.Column('cover_image', sa.Text(), nullable=True),
        sa.Column('images', sa.JSON(), nullable=True),
        sa.Column('is_public', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('likes_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('saves_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('views_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('comments_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('tags', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_trips_user_id', 'trips', ['user_id'])
    op.create_index('ix_trips_destination', 'trips', ['destination'])
    op.create_index('ix_trips_is_public', 'trips', ['is_public'])

    # ── Create trip_likes table ──────────────────────────────────────
    op.create_table(
        'trip_likes',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('trip_id', UUID(as_uuid=True), sa.ForeignKey('trips.id', ondelete='CASCADE'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'trip_id', name='uq_trip_likes_user_trip'),
    )
    op.create_index('ix_trip_likes_trip_id', 'trip_likes', ['trip_id'])
    op.create_index('ix_trip_likes_user_id', 'trip_likes', ['user_id'])

    # ── Create trip_saves table ──────────────────────────────────────
    op.create_table(
        'trip_saves',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('trip_id', UUID(as_uuid=True), sa.ForeignKey('trips.id', ondelete='CASCADE'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'trip_id', name='uq_trip_saves_user_trip'),
    )
    op.create_index('ix_trip_saves_trip_id', 'trip_saves', ['trip_id'])
    op.create_index('ix_trip_saves_user_id', 'trip_saves', ['user_id'])

    # ── Create trip_comments table ───────────────────────────────────
    op.create_table(
        'trip_comments',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('trip_id', UUID(as_uuid=True), sa.ForeignKey('trips.id', ondelete='CASCADE'), nullable=False),
        sa.Column('comment', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_trip_comments_trip_id', 'trip_comments', ['trip_id'])

    # ── Create user_follows table ────────────────────────────────────
    op.create_table(
        'user_follows',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('follower_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('following_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('follower_id', 'following_id', name='uq_user_follows'),
    )
    op.create_index('ix_user_follows_follower_id', 'user_follows', ['follower_id'])
    op.create_index('ix_user_follows_following_id', 'user_follows', ['following_id'])


def downgrade() -> None:
    op.drop_index('ix_user_follows_following_id', table_name='user_follows')
    op.drop_index('ix_user_follows_follower_id', table_name='user_follows')
    op.drop_table('user_follows')

    op.drop_index('ix_trip_comments_trip_id', table_name='trip_comments')
    op.drop_table('trip_comments')

    op.drop_index('ix_trip_saves_user_id', table_name='trip_saves')
    op.drop_index('ix_trip_saves_trip_id', table_name='trip_saves')
    op.drop_table('trip_saves')

    op.drop_index('ix_trip_likes_user_id', table_name='trip_likes')
    op.drop_index('ix_trip_likes_trip_id', table_name='trip_likes')
    op.drop_table('trip_likes')

    op.drop_index('ix_trips_is_public', table_name='trips')
    op.drop_index('ix_trips_destination', table_name='trips')
    op.drop_index('ix_trips_user_id', table_name='trips')
    op.drop_table('trips')

    op.drop_index('ix_users_username', table_name='users')
    op.drop_column('users', 'following_count')
    op.drop_column('users', 'followers_count')
    op.drop_column('users', 'bio')
    op.drop_column('users', 'profile_image')
    op.drop_column('users', 'username')
