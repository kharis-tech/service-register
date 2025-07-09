from sqlalchemy.orm import Session
from uuid import UUID
from db.models import Branch as BranchModel
from schemas.branch import BranchCreate

def get_branch(db: Session, branch_id: UUID):
    return db.query(BranchModel).filter(BranchModel.id == branch_id).first()

def get_branches(db: Session, skip: int = 0, limit: int = 100):
    return db.query(BranchModel).offset(skip).limit(limit).all()

def create_branch(db: Session, branch: BranchCreate):
    db_branch = BranchModel(**branch.dict())
    db.add(db_branch)
    db.commit()
    db.refresh(db_branch)
    return db_branch

def update_branch(db: Session, branch_id: UUID, branch: BranchCreate):
    db_branch = get_branch(db, branch_id)
    if db_branch:
        update_data = branch.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_branch, key, value)
        db.commit()
        db.refresh(db_branch)
    return db_branch

def delete_branch(db: Session, branch_id: UUID):
    db_branch = get_branch(db, branch_id)
    if db_branch:
        db.delete(db_branch)
        db.commit()
    return db_branch