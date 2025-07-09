from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from schemas.member import Member, MemberCreate
from crud import member as member_crud
from db.database import get_db

router = APIRouter()

@router.post("/", response_model=Member)
def create_member(member: MemberCreate, db: Session = Depends(get_db)):
    # In a real app, you'd check if a member with this email already exists
    return member_crud.create_member(db=db, member=member)

@router.get("/", response_model=List[Member])
def get_members(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    members = member_crud.get_members(db, skip=skip, limit=limit)
    return members

@router.get("/{member_id}", response_model=Member)
def get_member(member_id: UUID, db: Session = Depends(get_db)):
    db_member = member_crud.get_member(db, member_id=member_id)
    if db_member is None:
        raise HTTPException(status_code=404, detail="Member not found")
    return db_member

@router.put("/{member_id}", response_model=Member)
def update_member(member_id: UUID, member: MemberCreate, db: Session = Depends(get_db)):
    db_member = member_crud.update_member(db, member_id=member_id, member=member)
    if db_member is None:
        raise HTTPException(status_code=404, detail="Member not found")
    return db_member

@router.delete("/{member_id}", response_model=Member)
def delete_member(member_id: UUID, db: Session = Depends(get_db)):
    db_member = member_crud.delete_member(db, member_id=member_id)
    if db_member is None:
        raise HTTPException(status_code=404, detail="Member not found")
    return db_member