from sqlalchemy import Integer, String, Boolean, ForeignKey, JSON, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .db import db
from datetime import datetime

class Project(db.Model):
    """
    A blueprint for a constructible project.
    """
    __tablename__ = 'projects'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True)
    description: Mapped[str] = mapped_column(String(500))
    cost: Mapped[int] = mapped_column(Integer)  # Production cost to complete
    
    # Buff details
    buff_type: Mapped[str] = mapped_column(String(50))  # e.g., 'morale', 'supplies', 'threat_reduction'
    buff_value: Mapped[int] = mapped_column(Integer)
    
    # Visuals
    icon: Mapped[str] = mapped_column(String(50), default='default_project')
    
    # Tech tree requirements (optional for now, but good to have)
    required_project_id: Mapped[int] = mapped_column(ForeignKey('projects.id'), nullable=True)
    
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    hidden: Mapped[bool] = mapped_column(Boolean, default=False)

class ActiveProject(db.Model):
    """
    The project currently being built by the community.
    Only one active project at a time usually.
    """
    __tablename__ = 'active_projects'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey('projects.id'))
    
    progress: Mapped[int] = mapped_column(Integer, default=0)
    started_at: Mapped[datetime] = mapped_column(db.DateTime, default=datetime.utcnow)
    
    project: Mapped[Project] = relationship('Project')

class CompletedProject(db.Model):
    """
    Projects that have been finished.
    """
    __tablename__ = 'completed_projects'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey('projects.id'))
    
    completed_at: Mapped[datetime] = mapped_column(db.DateTime, default=datetime.utcnow)
    
    project: Mapped[Project] = relationship('Project')

class ProjectVote(db.Model):
    """
    Votes for which project to build next.
    """
    __tablename__ = 'project_votes'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'))
    project_id: Mapped[int] = mapped_column(ForeignKey('projects.id'))
    day_id: Mapped[int] = mapped_column(ForeignKey('days.id'))
    
    created_at: Mapped[datetime] = mapped_column(db.DateTime, default=datetime.utcnow)
