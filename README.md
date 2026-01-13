# AAR 課程復盤系統

線上課程復盤系統 - Online Course Review System

## 功能特色

- 課程管理：追蹤學習進度、管理線上課程
- 知識點記錄：支援 Markdown 的筆記功能
- 行動項目：可執行的待辦事項，優先級管理
- 復盤日誌：學習反思與情感追蹤
- 統計分析：視覺化學習數據

## 技術棧

### 前端
- React 18 + TypeScript
- Vite
- Tailwind CSS (OKLCH 色彩系統)
- shadcn/ui
- React Query
- Wouter (路由)
- Recharts (圖表)

### 後端
- FastAPI (Python)
- SQLAlchemy (ORM)
- PostgreSQL
- JWT 認證

## 快速開始

### 安裝依賴

```bash
# 前端
npm install

# 後端
uv sync
```

### 設定環境變數

```bash
cp .env.example .env
# 編輯 .env 填入資料庫連線資訊
```

### 啟動服務

```bash
# 後端 (終端機 1)
uv run uvicorn backend.main:app --reload --port 8000

# 前端 (終端機 2)
npm run dev
```

訪問 http://localhost:5173

## 部署

支援 Zeabur 一鍵部署，需要 PostgreSQL 服務。
