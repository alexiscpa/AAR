from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from backend.database import get_db
from backend.models import User, ActionItem, Course
from backend.schemas import (
    ActionItemCreate, ActionItemUpdate, ActionItemResponse,
    ActionItemWithCourse, ActionItemStats, SuccessResponse, CourseResponse
)
from backend.auth import get_current_user

router = APIRouter(prefix="/action-items", tags=["action-items"])


@router.get("/course/{course_id}", response_model=List[ActionItemResponse])
async def list_action_items_by_course(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ActionItem)
        .where(ActionItem.course_id == course_id, ActionItem.user_id == current_user.id)
        .order_by(desc(ActionItem.created_at))
    )
    return result.scalars().all()


@router.get("", response_model=List[ActionItemWithCourse])
async def list_action_items_by_user(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ActionItem)
        .options(selectinload(ActionItem.course))
        .where(ActionItem.user_id == current_user.id)
        .order_by(desc(ActionItem.created_at))
    )
    items = result.scalars().all()

    return [
        ActionItemWithCourse(
            action_item=ActionItemResponse.model_validate(item),
            course=CourseResponse.model_validate(item.course) if item.course else None
        )
        for item in items
    ]


@router.get("/stats", response_model=ActionItemStats)
async def get_action_item_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ActionItem).where(ActionItem.user_id == current_user.id)
    )
    items = result.scalars().all()

    return ActionItemStats(
        total=len(items),
        completed=len([i for i in items if i.completed]),
        pending=len([i for i in items if not i.completed]),
    )


@router.post("", response_model=ActionItemResponse)
async def create_action_item(
    data: ActionItemCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    item = ActionItem(
        course_id=data.course_id,
        knowledge_point_id=data.knowledge_point_id,
        user_id=current_user.id,
        title=data.title,
        description=data.description,
        priority=data.priority or "medium",
        due_date=data.due_date,
    )
    db.add(item)
    await db.flush()
    await db.refresh(item)
    return item


@router.patch("/{item_id}", response_model=ActionItemResponse)
async def update_action_item(
    item_id: int,
    data: ActionItemUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ActionItem)
        .where(ActionItem.id == item_id, ActionItem.user_id == current_user.id)
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Action item not found")

    update_data = data.model_dump(exclude_unset=True)

    # Handle completion status
    if "completed" in update_data:
        if update_data["completed"] and not item.completed:
            item.completed_at = datetime.utcnow()
        elif not update_data["completed"]:
            item.completed_at = None

    for key, value in update_data.items():
        setattr(item, key, value)

    await db.flush()
    await db.refresh(item)
    return item


@router.delete("/{item_id}", response_model=SuccessResponse)
async def delete_action_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ActionItem)
        .where(ActionItem.id == item_id, ActionItem.user_id == current_user.id)
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Action item not found")

    await db.delete(item)
    return SuccessResponse(success=True)
