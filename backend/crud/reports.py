from sqlalchemy.orm import Session
from sqlalchemy import and_, not_
from uuid import UUID
from db.models import Member, Attendance

def get_lapsed_attendees(db: Session, event_id_present: UUID, event_id_absent: UUID):
    """
    Returns members who were present at event_id_present but absent from event_id_absent.
    """
    present_members = db.query(Attendance.user_id).filter(Attendance.event_id == event_id_present)
    absent_members = db.query(Attendance.user_id).filter(Attendance.event_id == event_id_absent)

    lapsed_member_ids = db.query(Member.id).filter(
        and_(
            Member.id.in_(present_members),
            not_(Member.id.in_(absent_members))
        )
    ).all()
    
    lapsed_member_ids = [m[0] for m in lapsed_member_ids]
    return db.query(Member).filter(Member.id.in_(lapsed_member_ids)).all()

def get_filtered_members(db: Session, filters: dict):
    """
    Returns members based on a dictionary of filter criteria.
    """
    query = db.query(Member)
    for key, value in filters.items():
        if hasattr(Member, key):
            query = query.filter(getattr(Member, key) == value)
    return query.all()