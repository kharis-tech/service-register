from sqlalchemy.orm import Session
from uuid import UUID
from db.models import ServiceEvent as ServiceEventModel
from schemas.service_event import ServiceEventCreate

def get_service_event(db: Session, event_id: UUID):
    return db.query(ServiceEventModel).filter(ServiceEventModel.id == event_id).first()

def get_service_events(db: Session, skip: int = 0, limit: int = 100):
    return db.query(ServiceEventModel).offset(skip).limit(limit).all()

def create_service_event(db: Session, service_event: ServiceEventCreate):
    db_service_event = ServiceEventModel(**service_event.dict())
    db.add(db_service_event)
    db.commit()
    db.refresh(db_service_event)
    return db_service_event