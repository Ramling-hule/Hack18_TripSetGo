"""Trips API — Interactive LLM Planning."""
from datetime import date
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user
from app.models.user import User
from app.database.session import get_db
from app.services.subscription_service import check_and_increment_usage
from app.planning_engine.llm_planner import generate_interactive_plan

router = APIRouter()


class TripPlanRequest(BaseModel):
    source: str = Field(..., min_length=2)
    destination: str = Field(..., min_length=2)
    start_date: date
    end_date: date
    budget: float = Field(..., gt=0)
    num_travelers: int = Field(default=1, ge=1, le=20)
    group_type: str = Field(default="friends")
    preferences: Optional[List[str]] = Field(default=[])


@router.post("", response_model=Dict[str, Any])
async def plan_trip(
    payload: TripPlanRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
) -> Dict[str, Any]:
    """Generate an interactive AI trip plan with multiple selectable options."""
    check_and_increment_usage(db, current_user)

    if payload.end_date <= payload.start_date:
        raise HTTPException(status_code=422, detail="end_date must be after start_date")

    try:
        return await generate_interactive_plan(
            source=payload.source.strip(),
            destination=payload.destination.strip(),
            start_date=payload.start_date,
            end_date=payload.end_date,
            budget=payload.budget,
            num_travelers=payload.num_travelers,
            group_type=payload.group_type,
            preferences=payload.preferences or [],
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Planning failed: {str(exc)}")
