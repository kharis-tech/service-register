from sqlalchemy import Column, String, ForeignKey, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .database import Base
import uuid

class Branch(Base):
    __tablename__ = "branches"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    region = Column(String, nullable=False)
    location = Column(String, nullable=False)

    members = relationship("Member", back_populates="branch")
    service_events = relationship("ServiceEvent", back_populates="branch")


class Member(Base):
    __tablename__ = "members"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    phone_number = Column(String, nullable=False)
    email = Column(String, nullable=False)
    soul_type = Column(String, nullable=False)
    evangelism_type = Column(String, nullable=False)
    department = Column(String, nullable=False)
    completed_membership = Column(Boolean, default=False)
    completed_new_believers = Column(Boolean, default=False)
    is_baptised = Column(Boolean, default=False)
    completed_spiritual_maturity = Column(Boolean, default=False)
    first_attendance_date = Column(DateTime)
    last_attendance_date = Column(DateTime)
    soul_winner = Column(String)
    address = Column(String)
    point_of_contact = Column(String, nullable=False)
    branch_id = Column(UUID(as_uuid=True), ForeignKey("branches.id"))

    branch = relationship("Branch", back_populates="members")


class ServiceEvent(Base):
    __tablename__ = "service_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    type = Column(String, nullable=False)
    date = Column(DateTime, nullable=False)
    location = Column(String, nullable=False)
    branch_id = Column(UUID(as_uuid=True), ForeignKey("branches.id"))

    branch = relationship("Branch", back_populates="service_events")
    attendance_records = relationship("Attendance", back_populates="service_event")


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("members.id"))
    event_id = Column(UUID(as_uuid=True), ForeignKey("service_events.id"))
    status = Column(Boolean, nullable=False)
    timestamp = Column(DateTime, nullable=False)

    member = relationship("Member")
    service_event = relationship("ServiceEvent", back_populates="attendance_records")