from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from schemas.branch import Branch, BranchCreate
from crud import branch as branch_crud
from db.database import get_db

router = APIRouter()

@router.post("/", response_model=Branch)
def create_branch(branch: BranchCreate, db: Session = Depends(get_db)):
    return branch_crud.create_branch(db=db, branch=branch)

@router.get("/", response_model=List[Branch])
def get_branches(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    branches = branch_crud.get_branches(db, skip=skip, limit=limit)
    return branches

@router.get("/{branch_id}", response_model=Branch)
def get_branch(branch_id: UUID, db: Session = Depends(get_db)):
    db_branch = branch_crud.get_branch(db, branch_id=branch_id)
    if db_branch is None:
        raise HTTPException(status_code=404, detail="Branch not found")
    return db_branch

@router.put("/{branch_id}", response_model=Branch)
def update_branch(branch_id: UUID, branch: BranchCreate, db: Session = Depends(get_db)):
    db_branch = branch_crud.update_branch(db, branch_id=branch_id, branch=branch)
    if db_branch is None:
        raise HTTPException(status_code=404, detail="Branch not found")
    return db_branch

@router.delete("/{branch_id}", response_model=Branch)
def delete_branch(branch_id: UUID, db: Session = Depends(get_db)):
    db_branch = branch_crud.delete_branch(db, branch_id=branch_id)
    if db_branch is None:
        raise HTTPException(status_code=404, detail="Branch not found")
    return db_branch