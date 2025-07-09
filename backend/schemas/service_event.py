from datetime import datetime
from pydantic import BaseModel
from uuid import UUID
from typing import Literal

class ServiceEventBase(BaseModel):
    type: Literal["sunday", "midweek", "special"]
    date: datetime
    location: str
    branch_id: UUID

class ServiceEventCreate(ServiceEventBase):
    pass

class ServiceEvent(ServiceEventBase):
    id: UUID

    class Config:
        from_attributes = True