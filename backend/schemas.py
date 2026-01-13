from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field


# Auth Schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = Field(min_length=1)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    name: str

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    user: UserResponse
    token: str


# Course Schemas
class CourseCreate(BaseModel):
    title: str = Field(min_length=1)
    platform: Optional[str] = None
    instructor: Optional[str] = None
    purchase_date: Optional[datetime] = None
    course_url: Optional[str] = None
    description: Optional[str] = None
    total_chapters: Optional[int] = 0


class CourseUpdate(BaseModel):
    title: Optional[str] = None
    platform: Optional[str] = None
    instructor: Optional[str] = None
    status: Optional[str] = None
    progress_percentage: Optional[float] = None
    completed_chapters: Optional[int] = None
    total_chapters: Optional[int] = None
    priority: Optional[str] = None
    description: Optional[str] = None
    course_url: Optional[str] = None


class CourseResponse(BaseModel):
    id: int
    user_id: int
    title: str
    platform: Optional[str]
    instructor: Optional[str]
    description: Optional[str]
    course_url: Optional[str]
    purchase_date: Optional[datetime]
    status: str
    progress_percentage: Decimal
    completed_chapters: int
    total_chapters: int
    priority: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CourseStats(BaseModel):
    total: int
    completed: int
    in_progress: int
    not_started: int


# Knowledge Point Schemas
class KnowledgePointCreate(BaseModel):
    course_id: int
    title: str = Field(min_length=1)
    content: Optional[str] = None
    summary: Optional[str] = None
    personal_notes: Optional[str] = None


class KnowledgePointUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    summary: Optional[str] = None
    personal_notes: Optional[str] = None


class KnowledgePointResponse(BaseModel):
    id: int
    course_id: int
    title: str
    content: Optional[str]
    summary: Optional[str]
    personal_notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Action Item Schemas
class ActionItemCreate(BaseModel):
    course_id: int
    knowledge_point_id: Optional[int] = None
    title: str = Field(min_length=1)
    description: Optional[str] = None
    priority: Optional[str] = "medium"
    due_date: Optional[datetime] = None


class ActionItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    completed: Optional[bool] = None
    due_date: Optional[datetime] = None


class ActionItemResponse(BaseModel):
    id: int
    course_id: int
    knowledge_point_id: Optional[int]
    user_id: int
    title: str
    description: Optional[str]
    priority: str
    completed: bool
    due_date: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ActionItemWithCourse(BaseModel):
    action_item: ActionItemResponse
    course: Optional[CourseResponse]


class ActionItemStats(BaseModel):
    total: int
    completed: int
    pending: int


# Review Log Schemas
class ReviewLogCreate(BaseModel):
    course_id: int
    title: str = Field(min_length=1)
    reflection: Optional[str] = None
    application_insights: Optional[str] = None
    key_takeaways: Optional[str] = None
    emotional_indicator: Optional[int] = Field(default=3, ge=1, le=5)
    review_date: Optional[datetime] = None


class ReviewLogUpdate(BaseModel):
    title: Optional[str] = None
    reflection: Optional[str] = None
    application_insights: Optional[str] = None
    key_takeaways: Optional[str] = None
    emotional_indicator: Optional[int] = Field(default=None, ge=1, le=5)


class ReviewLogResponse(BaseModel):
    id: int
    course_id: int
    user_id: int
    title: str
    reflection: Optional[str]
    application_insights: Optional[str]
    key_takeaways: Optional[str]
    emotional_indicator: int
    review_date: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ReviewLogWithCourse(BaseModel):
    review_log: ReviewLogResponse
    course: Optional[CourseResponse]


# Tag Schemas
class TagCreate(BaseModel):
    name: str = Field(min_length=1)
    color: Optional[str] = None
    category: Optional[str] = None


class TagResponse(BaseModel):
    id: int
    user_id: int
    name: str
    color: Optional[str]
    category: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# Course Tag Schemas
class CourseTagCreate(BaseModel):
    course_id: int
    tag_id: int


class CourseTagResponse(BaseModel):
    course_tag_id: int
    tag: TagResponse

    class Config:
        from_attributes = True


class SuccessResponse(BaseModel):
    success: bool = True
