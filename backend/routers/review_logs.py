from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from backend.database import get_db
from backend.models import User, ReviewLog
from backend.schemas import (
    ReviewLogCreate, ReviewLogUpdate, ReviewLogResponse,
    ReviewLogWithCourse, SuccessResponse, CourseResponse
)
from backend.auth import get_current_user

router = APIRouter(prefix="/review-logs", tags=["review-logs"])


@router.get("/course/{course_id}", response_model=List[ReviewLogResponse])
async def list_review_logs_by_course(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ReviewLog)
        .where(ReviewLog.course_id == course_id, ReviewLog.user_id == current_user.id)
        .order_by(desc(ReviewLog.review_date))
    )
    return result.scalars().all()


@router.get("", response_model=List[ReviewLogWithCourse])
async def list_review_logs_by_user(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ReviewLog)
        .options(selectinload(ReviewLog.course))
        .where(ReviewLog.user_id == current_user.id)
        .order_by(desc(ReviewLog.review_date))
    )
    logs = result.scalars().all()

    return [
        ReviewLogWithCourse(
            review_log=ReviewLogResponse.model_validate(log),
            course=CourseResponse.model_validate(log.course) if log.course else None
        )
        for log in logs
    ]


@router.post("", response_model=ReviewLogResponse)
async def create_review_log(
    data: ReviewLogCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    log = ReviewLog(
        course_id=data.course_id,
        user_id=current_user.id,
        title=data.title,
        reflection=data.reflection,
        application_insights=data.application_insights,
        key_takeaways=data.key_takeaways,
        emotional_indicator=data.emotional_indicator or 3,
        review_date=data.review_date or datetime.utcnow(),
    )
    db.add(log)
    await db.flush()
    await db.refresh(log)
    return log


@router.patch("/{log_id}", response_model=ReviewLogResponse)
async def update_review_log(
    log_id: int,
    data: ReviewLogUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ReviewLog)
        .where(ReviewLog.id == log_id, ReviewLog.user_id == current_user.id)
    )
    log = result.scalar_one_or_none()
    if not log:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review log not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(log, key, value)

    await db.flush()
    await db.refresh(log)
    return log


@router.delete("/{log_id}", response_model=SuccessResponse)
async def delete_review_log(
    log_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ReviewLog)
        .where(ReviewLog.id == log_id, ReviewLog.user_id == current_user.id)
    )
    log = result.scalar_one_or_none()
    if not log:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review log not found")

    await db.delete(log)
    return SuccessResponse(success=True)
