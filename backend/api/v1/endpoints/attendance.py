from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from schemas.attendance import Attendance, AttendanceCreate
from crud import attendance as attendance_crud
from db.database import get_db

router = APIRouter()

@router.post("/", response_model=Attendance)
def create_attendance(user_id: UUID, event_id: UUID, db: Session = Depends(get_db)):
    # In a real app, you might want to check if the user and event exist first
    # and that the user isn't already marked as present.
    attendance_to_create = AttendanceCreate(user_id=user_id, event_id=event_id, status=True)
    return attendance_crud.create_attendance(db=db, attendance=attendance_to_create)

@router.get("/{event_id}", response_model=List[Attendance])
def get_attendance_for_event(event_id: UUID, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    attendance = attendance_crud.get_attendance_for_event(db, event_id=event_id, skip=skip, limit=limit)
    if not attendance:
        raise HTTPException(status_code=404, detail="No attendance records found for this event")
    return attendance