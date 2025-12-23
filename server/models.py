from datetime import datetime, date
from typing import Optional
from sqlalchemy import Integer, String, DateTime, Date, ForeignKey, UniqueConstraint, JSON, Boolean, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .db import db
# Import project models to ensure they are registered with SQLAlchemy
from .models_projects import Project, ActiveProject, CompletedProject, ProjectVote


class User(db.Model):
    __tablename__ = 'users'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    provider: Mapped[str] = mapped_column(String(50))
    provider_user_id: Mapped[str] = mapped_column(String(128), unique=True)
    display_name: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)


class Day(db.Model):
    __tablename__ = 'days'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    est_date: Mapped[date] = mapped_column(Date, unique=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    chosen_option: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    world_state: Mapped['WorldState'] = relationship(back_populates='day', uselist=False)
    event: Mapped['Event'] = relationship(back_populates='day', uselist=False)
    messages: Mapped[list['CommunityMessage']] = relationship(back_populates='day')


class WorldState(db.Model):
    __tablename__ = 'world_states'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    day_id: Mapped[int] = mapped_column(ForeignKey('days.id'), unique=True)
    morale: Mapped[int] = mapped_column(Integer)
    supplies: Mapped[int] = mapped_column(Integer)
    threat: Mapped[int] = mapped_column(Integer)
    last_event: Mapped[str] = mapped_column(String(200))
    population: Mapped[int] = mapped_column(Integer, default=20)  # Community size affects consumption/production

    day: Mapped[Day] = relationship(back_populates='world_state')


class Announcement(db.Model):
    __tablename__ = 'announcements'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    content: Mapped[str] = mapped_column(Text)
    html_content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    version: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    show_popup: Mapped[bool] = mapped_column(Boolean, default=True)
    send_notification: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    created_by: Mapped[int] = mapped_column(ForeignKey('users.id'))


class Event(db.Model):
    __tablename__ = 'events'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    day_id: Mapped[int] = mapped_column(ForeignKey('days.id'), unique=True)
    headline: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(String(500))
    options: Mapped[dict] = mapped_column(JSON)  # list of option keys

    day: Mapped[Day] = relationship(back_populates='event')


class Vote(db.Model):
    __tablename__ = 'votes'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    day_id: Mapped[int] = mapped_column(ForeignKey('days.id'))
    user_id: Mapped[Optional[int]] = mapped_column(ForeignKey('users.id'), nullable=True)
    anon_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    option: Mapped[str] = mapped_column(String(50))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint('day_id', 'user_id', name='uq_vote_user_per_day'),
        UniqueConstraint('day_id', 'anon_id', name='uq_vote_anon_per_day'),
    )


class Telemetry(db.Model):
    __tablename__ = 'telemetry'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    event_type: Mapped[str] = mapped_column(String(64))
    payload: Mapped[dict] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    user_id: Mapped[Optional[int]] = mapped_column(ForeignKey('users.id'), nullable=True)


class CustomEvent(db.Model):
    """Custom events created by admins"""
    __tablename__ = 'custom_events'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    event_id: Mapped[str] = mapped_column(String(100), unique=True)
    headline: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text)
    category: Mapped[str] = mapped_column(String(50), default='general')
    weight: Mapped[int] = mapped_column(Integer, default=1)
    
    min_morale: Mapped[int] = mapped_column(Integer, default=0)
    max_morale: Mapped[int] = mapped_column(Integer, default=100)
    min_supplies: Mapped[int] = mapped_column(Integer, default=0)
    max_supplies: Mapped[int] = mapped_column(Integer, default=100)
    min_threat: Mapped[int] = mapped_column(Integer, default=0)
    max_threat: Mapped[int] = mapped_column(Integer, default=100)
    requires_day: Mapped[int] = mapped_column(Integer, default=0)
    
    options: Mapped[dict] = mapped_column(JSON)
    
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    created_by: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class CommunityMessage(db.Model):
    __tablename__ = 'community_messages'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    day_id: Mapped[int] = mapped_column(ForeignKey('days.id'))
    author_name: Mapped[str] = mapped_column(String(64))
    avatar_seed: Mapped[str] = mapped_column(String(64))  # For deterministic avatars
    content: Mapped[str] = mapped_column(String(280))
    sentiment: Mapped[str] = mapped_column(String(20))  # positive, negative, neutral
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    # Replies support
    parent_id: Mapped[Optional[int]] = mapped_column(ForeignKey('community_messages.id'), nullable=True)
    replies: Mapped[list['CommunityMessage']] = relationship('CommunityMessage', backref=db.backref('parent', remote_side=[id]))

    day: Mapped[Day] = relationship(back_populates='messages')
