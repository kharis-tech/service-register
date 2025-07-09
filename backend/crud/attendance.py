from sqlalchemy.orm import Session
from uuid import UUID
from db.models import Attendance as AttendanceModel
from schemas.attendance import AttendanceCreate
import datetime

def get_attendance_for_event(db: Session, event_id: UUID, skip: int = 0, limit: int = 100):
    return db.query(AttendanceModel).filter(AttendanceModel.event_id == event_id).offset(skip).limit(limit).all()

def create_attendance(db: Session, attendance: AttendanceCreate):
    db_attendance = AttendanceModel(
        **attendance.dict(),
        timestamp=datetime.datetime.utcnow()
    )
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    return db_attendance