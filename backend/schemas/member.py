from datetime import datetime
from pydantic import BaseModel, EmailStr
from typing import Literal
from uuid import UUID

class MemberBase(BaseModel):
    first_name: str
    last_name: str
    phone_number: str
    email: EmailStr
    soul_type: Literal["contact", "new believer"]
    evangelism_type: str
    department: str
    completed_membership: bool
    completed_new_believers: bool
    is_baptised: bool
    completed_spiritual_maturity: bool
    first_attendance_date: datetime
    last_attendance_date: datetime
    soul_winner: str
    address: str
    point_of_contact: str  # This will vary based on the assimilation stage
    branch_id: UUID

class MemberCreate(MemberBase):
    pass

class Member(MemberBase):
    id: UUID

    class Config:
        from_attributes = True
