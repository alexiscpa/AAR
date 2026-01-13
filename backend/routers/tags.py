from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from backend.database import get_db
from backend.models import User, Tag, CourseTag
from backend.schemas import TagCreate, TagResponse, CourseTagCreate, CourseTagResponse, SuccessResponse
from backend.auth import get_current_user

router = APIRouter(prefix="/tags", tags=["tags"])


@router.get("", response_model=List[TagResponse])
async def list_tags(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Tag)
        .where(Tag.user_id == current_user.id)
        .order_by(Tag.name)
    )
    return result.scalars().all()


@router.post("", response_model=TagResponse)
async def create_tag(
    data: TagCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    tag = Tag(
        user_id=current_user.id,
        name=data.name,
        color=data.color,
        category=data.category,
    )
    db.add(tag)
    await db.flush()
    await db.refresh(tag)
    return tag


@router.delete("/{tag_id}", response_model=SuccessResponse)
async def delete_tag(
    tag_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Tag)
        .where(Tag.id == tag_id, Tag.user_id == current_user.id)
    )
    tag = result.scalar_one_or_none()
    if not tag:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tag not found")

    await db.delete(tag)
    return SuccessResponse(success=True)


# Course Tags
@router.get("/course/{course_id}", response_model=List[CourseTagResponse])
async def list_course_tags(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(CourseTag)
        .options(selectinload(CourseTag.tag))
        .where(CourseTag.course_id == course_id)
    )
    course_tags = result.scalars().all()

    return [
        CourseTagResponse(
            course_tag_id=ct.id,
            tag=TagResponse.model_validate(ct.tag)
        )
        for ct in course_tags
    ]


@router.post("/course", response_model=SuccessResponse)
async def add_tag_to_course(
    data: CourseTagCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Check if already exists
    result = await db.execute(
        select(CourseTag)
        .where(CourseTag.course_id == data.course_id, CourseTag.tag_id == data.tag_id)
    )
    if result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tag already added to course")

    course_tag = CourseTag(course_id=data.course_id, tag_id=data.tag_id)
    db.add(course_tag)
    return SuccessResponse(success=True)


@router.delete("/course/{course_id}/tag/{tag_id}", response_model=SuccessResponse)
async def remove_tag_from_course(
    course_id: int,
    tag_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(CourseTag)
        .where(CourseTag.course_id == course_id, CourseTag.tag_id == tag_id)
    )
    course_tag = result.scalar_one_or_none()
    if not course_tag:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course tag not found")

    await db.delete(course_tag)
    return SuccessResponse(success=True)
