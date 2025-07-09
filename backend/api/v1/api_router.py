from fastapi import APIRouter
from api.v1.endpoints import branch, member, service_event, attendance, reports

router = APIRouter()

router.include_router(branch.router, prefix="/branches", tags=["branches"])
router.include_router(member.router, prefix="/members", tags=["members"])
router.include_router(service_event.router, prefix="/service-events", tags=["service-events"])
router.include_router(attendance.router, prefix="/attendance", tags=["attendance"])
router.include_router(reports.router, prefix="/reports", tags=["reports"])