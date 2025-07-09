from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from schemas.member import Member
from crud import reports as reports_crud
from db.database import get_db

router = APIRouter()

@router.get("/lapsed-attendees", response_model=List[Member])
def get_lapsed_attendees(
    present_event_id: UUID, 
    absent_event_id: UUID, 
    db: Session = Depends(get_db)
):
    """
    Get members who attended one event but missed another.
    """
    return reports_crud.get_lapsed_attendees(
        db, event_id_present=present_event_id, event_id_absent=absent_event_id
    )

@router.get("/filtered-members", response_model=List[Member])
def get_filtered_members(
    db: Session = Depends(get_db),
    department: Optional[str] = None,
    is_baptised: Optional[bool] = None,
    completed_membership: Optional[bool] = None,
    completed_new_believers: Optional[bool] = None,
    completed_spiritual_maturity: Optional[bool] = None
):
    """
    Get members based on a variety of filter criteria.
    """
    filters = {
        "department": department,
        "is_baptised": is_baptised,
        "completed_membership": completed_membership,
        "completed_new_believers": completed_new_believers,
        "completed_spiritual_maturity": completed_spiritual_maturity
    }
    # Remove filters that were not provided
    active_filters = {k: v for k, v in filters.items() if v is not None}
    
    return reports_crud.get_filtered_members(db, filters=active_filters)