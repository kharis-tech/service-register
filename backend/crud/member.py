from sqlalchemy.orm import Session
from uuid import UUID
from db.models import Member as MemberModel
from schemas.member import MemberCreate

def get_member(db: Session, member_id: UUID):
    return db.query(MemberModel).filter(MemberModel.id == member_id).first()

def get_members(db: Session, skip: int = 0, limit: int = 100):
    return db.query(MemberModel).offset(skip).limit(limit).all()

def create_member(db: Session, member: MemberCreate):
    db_member = MemberModel(**member.dict())
    db.add(db_member)
    db.commit()
    db.refresh(db_member)
    return db_member

def update_member(db: Session, member_id: UUID, member: MemberCreate):
    db_member = get_member(db, member_id)
    if db_member:
        update_data = member.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_member, key, value)
        db.commit()
        db.refresh(db_member)
    return db_member

def delete_member(db: Session, member_id: UUID):
    db_member = get_member(db, member_id)
    if db_member:
        db.delete(db_member)
        db.commit()
    return db_member