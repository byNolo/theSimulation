"""
Event management model for storing custom events in the database.
Admins can create, edit, and manage events dynamically.
"""
from datetime import datetime
from typing import Optional
from sqlalchemy import Integer, String, DateTime, JSON, Boolean, Text
from sqlalchemy.orm import Mapped, mapped_column
from .db import db


class CustomEvent(db.Model):
    """Custom events created by admins"""
    __tablename__ = 'custom_events'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    event_id: Mapped[str] = mapped_column(String(100), unique=True)
    headline: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text)
    category: Mapped[str] = mapped_column(String(50), default='general')  # general, crisis, opportunity, narrative
    weight: Mapped[int] = mapped_column(Integer, default=1)
    
    # Conditions for event to appear
    min_morale: Mapped[int] = mapped_column(Integer, default=0)
    max_morale: Mapped[int] = mapped_column(Integer, default=100)
    min_supplies: Mapped[int] = mapped_column(Integer, default=0)
    max_supplies: Mapped[int] = mapped_column(Integer, default=100)
    min_threat: Mapped[int] = mapped_column(Integer, default=0)
    max_threat: Mapped[int] = mapped_column(Integer, default=100)
    requires_day: Mapped[int] = mapped_column(Integer, default=0)
    
    # Options stored as JSON array
    options: Mapped[dict] = mapped_column(JSON)  # [{"key": "...", "label": "...", "description": "...", "deltas": {...}}]
    
    # Meta
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    created_by: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)  # user_id of admin who created it
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
