"""
YouTube Import Service - Main Entry Point
非同步匯入端點：接收 YouTube 網址後立即回傳任務識別碼
"""
from fastapi import FastAPI, BackgroundTasks, HTTPException
from pydantic import BaseModel, HttpUrl
from typing import Optional, Dict, Any
import uuid
import asyncio
from datetime import datetime

from importer import YouTubeImporter
from task_manager import TaskManager, TaskStatus, TaskResult

app = FastAPI(title="YouTube Import Service", version="1.0.0")

# 全域任務管理器
task_manager = TaskManager()


class ImportRequest(BaseModel):
    """匯入請求模型"""
    url: HttpUrl
    language: str = "ja"  # 預設日語
    

class ImportResponse(BaseModel):
    """匯入回應模型"""
    task_id: str
    status: str
    message: str


class TaskProgress(BaseModel):
    """任務進度模型"""
    task_id: str
    status: str
    progress: Optional[int] = None  # 0-100
    current_step: Optional[str] = None
    error: Optional[str] = None
    result: Optional[Dict[str, Any]] = None


async def process_import_task(task_id: str, url: str, language: str):
    """背景處理匯入任務"""
    try:
        task_manager.update_status(task_id, TaskStatus.PROCESSING, "初始化中...")
        
        importer = YouTubeImporter(task_manager, task_id)
        
        # 執行完整匯入流程
        cards = await importer.process(url, language)
        
        # 完成任務
        task_manager.complete_task(task_id, {
            "cards": cards,
            "count": len(cards),
            "completed_at": datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        task_manager.fail_task(task_id, str(e))


@app.post("/api/import", response_model=ImportResponse)
async def create_import_task(request: ImportRequest, background_tasks: BackgroundTasks):
    """
    建立新的匯入任務
    立即回傳 task_id，背景執行下載、辨識、斷詞、裁切、組裝流程
    """
    task_id = str(uuid.uuid4())
    
    # 建立任務記錄
    task_manager.create_task(task_id, str(request.url))
    
    # 加入背景任務
    background_tasks.add_task(process_import_task, task_id, str(request.url), request.language)
    
    return ImportResponse(
        task_id=task_id,
        status="pending",
        message="任務已建立，請使用 /api/task/{task_id} 查詢進度"
    )


@app.get("/api/task/{task_id}", response_model=TaskProgress)
async def get_task_progress(task_id: str):
    """
    查詢任務進度與結果
    回傳狀態：pending/processing/done/failed
    """
    task = task_manager.get_task(task_id)
    
    if not task:
        raise HTTPException(status_code=404, detail="找不到該任務")
    
    return TaskProgress(
        task_id=task_id,
        status=task["status"].value,
        progress=task.get("progress"),
        current_step=task.get("current_step"),
        error=task.get("error"),
        result=task.get("result")
    )


@app.get("/health")
async def health_check():
    """健康檢查端點"""
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
