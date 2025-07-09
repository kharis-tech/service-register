from datetime import datetime
from pydantic import BaseModel
from uuid import UUID

class AttendanceBase(BaseModel):
    user_id: UUID
    event_id: UUID
    status: bool

class AttendanceCreate(AttendanceBase):
    pass

class Attendance(AttendanceBase):
    id: UUID
    timestamp: datetime

    class Config:
        from_attributes = True