from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from backend.database import get_db
from backend.models import User, KnowledgePoint
from backend.schemas import KnowledgePointCreate, KnowledgePointUpdate, KnowledgePointResponse, SuccessResponse
from backend.auth import get_current_user

router = APIRouter(prefix="/knowledge-points", tags=["knowledge-points"])


@router.get("/course/{course_id}", response_model=List[KnowledgePointResponse])
async def list_knowledge_points_by_course(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(KnowledgePoint)
        .where(KnowledgePoint.course_id == course_id)
        .order_by(desc(KnowledgePoint.created_at))
    )
    return result.scalars().all()


@router.post("", response_model=KnowledgePointResponse)
async def create_knowledge_point(
    data: KnowledgePointCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    point = KnowledgePoint(
        course_id=data.course_id,
        title=data.title,
        content=data.content,
        summary=data.summary,
        personal_notes=data.personal_notes,
    )
    db.add(point)
    await db.flush()
    await db.refresh(point)
    return point


@router.patch("/{point_id}", response_model=KnowledgePointResponse)
async def update_knowledge_point(
    point_id: int,
    data: KnowledgePointUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(KnowledgePoint).where(KnowledgePoint.id == point_id)
    )
    point = result.scalar_one_or_none()
    if not point:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Knowledge point not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(point, key, value)

    await db.flush()
    await db.refresh(point)
    return point


@router.delete("/{point_id}", response_model=SuccessResponse)
async def delete_knowledge_point(
    point_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(KnowledgePoint).where(KnowledgePoint.id == point_id)
    )
    point = result.scalar_one_or_none()
    if not point:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Knowledge point not found")

    await db.delete(point)
    return SuccessResponse(success=True)
