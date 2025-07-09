from pydantic import BaseModel
from uuid import UUID

class BranchBase(BaseModel):
    name: str
    region: str
    location: str

class BranchCreate(BranchBase):
    pass

class Branch(BranchBase):
    id: UUID

    class Config:
        from_attributes = True