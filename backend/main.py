import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.database import engine, Base
from backend.routers import auth, courses, knowledge_points, action_items, review_logs, tags


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create database tables on startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(
    title="AAR 課程復盤系統",
    description="線上課程復盤系統 API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware - 支援本地開發和 Zeabur 部署
allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]
# 從環境變數讀取額外的允許來源
if os.getenv("FRONTEND_URL"):
    allowed_origins.append(os.getenv("FRONTEND_URL"))
# Zeabur 部署時允許所有 zeabur.app 子網域
if os.getenv("ZEABUR_ENVIRONMENT"):
    allowed_origins.append("https://*.zeabur.app")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.zeabur\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/api/health")
async def health_check():
    return {"status": "ok"}


# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(courses.router, prefix="/api")
app.include_router(knowledge_points.router, prefix="/api")
app.include_router(action_items.router, prefix="/api")
app.include_router(review_logs.router, prefix="/api")
app.include_router(tags.router, prefix="/api")
