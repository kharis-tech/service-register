from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from schemas.service_event import ServiceEvent, ServiceEventCreate
from crud import service_event as service_event_crud
from db.database import get_db

router = APIRouter()

@router.post("/", response_model=ServiceEvent)
def create_service_event(service_event: ServiceEventCreate, db: Session = Depends(get_db)):
    return service_event_crud.create_service_event(db=db, service_event=service_event)

@router.get("/", response_model=List[ServiceEvent])
def get_service_events(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    service_events = service_event_crud.get_service_events(db, skip=skip, limit=limit)
    return service_events

@router.get("/{event_id}", response_model=ServiceEvent)
def get_service_event(event_id: UUID, db: Session = Depends(get_db)):
    db_service_event = service_event_crud.get_service_event(db, event_id=event_id)
    if db_service_event is None:
        raise HTTPException(status_code=404, detail="Service event not found")
    return db_service_event