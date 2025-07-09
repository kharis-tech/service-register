import logging
from sqlalchemy.orm import Session
from db.database import SessionLocal
from crud import branch as branch_crud, member as member_crud, service_event as service_event_crud
from schemas.branch import BranchCreate
from schemas.member import MemberCreate
from schemas.service_event import ServiceEventCreate
from datetime import datetime, timedelta

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def seed_data(db: Session):
    logger.info("Seeding data...")

    # --- Create Branches ---
    branch1_data = BranchCreate(name="Main Campus", region="North", location="123 Main St")
    branch2_data = BranchCreate(name="Westside", region="West", location="456 West Ave")
    
    branch1 = branch_crud.create_branch(db, branch=branch1_data)
    branch2 = branch_crud.create_branch(db, branch=branch2_data)
    logger.info("Created 2 branches.")

    # --- Create Members ---
    member1 = member_crud.create_member(db, member=MemberCreate(first_name="John", last_name="Doe", phone_number="111-222-3333", email="john.doe@example.com", soul_type="contact", evangelism_type="Street", department="Ushering", completed_membership=True, completed_new_believers=True, is_baptised=True, completed_spiritual_maturity=False, first_attendance_date=datetime.utcnow(), last_attendance_date=datetime.utcnow(), soul_winner="Jane Smith", address="10 Pine Ln", point_of_contact="Pastor Mike", branch_id=branch1.id))
    member2 = member_crud.create_member(db, member=MemberCreate(first_name="Jane", last_name="Smith", phone_number="444-555-6666", email="jane.smith@example.com", soul_type="new believer", evangelism_type="Friend", department="Choir", completed_membership=True, completed_new_believers=True, is_baptised=True, completed_spiritual_maturity=True, first_attendance_date=datetime.utcnow(), last_attendance_date=datetime.utcnow(), soul_winner="John Doe", address="20 Oak Rd", point_of_contact="Deaconess Sarah", branch_id=branch1.id))
    member3 = member_crud.create_member(db, member=MemberCreate(first_name="Peter", last_name="Jones", phone_number="777-888-9999", email="peter.jones@example.com", soul_type="contact", evangelism_type="Outreach", department="None", completed_membership=False, completed_new_believers=False, is_baptised=False, completed_spiritual_maturity=False, first_attendance_date=datetime.utcnow(), last_attendance_date=datetime.utcnow(), soul_winner="Jane Smith", address="30 Maple Ave", point_of_contact="Follow-up Team", branch_id=branch2.id))
    logger.info("Created 3 members.")

    # --- Create Service Events ---
    event1 = service_event_crud.create_service_event(db, service_event=ServiceEventCreate(type="sunday", date=datetime.utcnow() - timedelta(days=7), location="Main Campus", branch_id=branch1.id))
    event2 = service_event_crud.create_service_event(db, service_event=ServiceEventCreate(type="sunday", date=datetime.utcnow(), location="Main Campus", branch_id=branch1.id))
    event3 = service_event_crud.create_service_event(db, service_event=ServiceEventCreate(type="midweek", date=datetime.utcnow() - timedelta(days=3), location="Westside", branch_id=branch2.id))
    logger.info("Created 3 service events.")

    # --- Mark Attendance ---
    from crud import attendance as attendance_crud
    from schemas.attendance import AttendanceCreate
    # Last week's service
    attendance_crud.create_attendance(db, attendance=AttendanceCreate(user_id=member1.id, event_id=event1.id, status=True))
    attendance_crud.create_attendance(db, attendance=AttendanceCreate(user_id=member2.id, event_id=event1.id, status=True))
    # This week's service (John Doe is absent)
    attendance_crud.create_attendance(db, attendance=AttendanceCreate(user_id=member2.id, event_id=event2.id, status=True))
    # Westside service
    attendance_crud.create_attendance(db, attendance=AttendanceCreate(user_id=member3.id, event_id=event3.id, status=True))
    logger.info("Marked attendance for events.")

    logger.info("Data seeding complete.")

if __name__ == "__main__":
    db = SessionLocal()
    # A simple check to prevent re-seeding
    if branch_crud.get_branches(db):
        logger.info("Database already seeded.")
    else:
        seed_data(db)
    db.close()