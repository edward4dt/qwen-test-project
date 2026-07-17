"""
任務管理器 - 管理非同步任務的狀態與進度
"""
from enum import Enum
from typing import Dict, Optional, Any
from datetime import datetime
import threading


class TaskStatus(str, Enum):
    """任務狀態列舉"""
    PENDING = "pending"
    PROCESSING = "processing"
    DONE = "done"
    FAILED = "failed"


class TaskResult:
    """任務結果模型"""
    def __init__(self, cards: list, count: int, completed_at: str):
        self.cards = cards
        self.count = count
        self.completed_at = completed_at


class TaskManager:
    """
    任務管理器
    執行緒安全地管理所有匯入任務的狀態
    """
    
    def __init__(self):
        self._tasks: Dict[str, Dict[str, Any]] = {}
        self._lock = threading.Lock()
    
    def create_task(self, task_id: str, url: str) -> None:
        """建立新任務"""
        with self._lock:
            self._tasks[task_id] = {
                "task_id": task_id,
                "url": url,
                "status": TaskStatus.PENDING,
                "progress": 0,
                "current_step": "等待開始",
                "created_at": datetime.utcnow().isoformat(),
                "error": None,
                "result": None
            }
    
    def get_task(self, task_id: str) -> Optional[Dict[str, Any]]:
        """取得任務資訊"""
        with self._lock:
            return self._tasks.get(task_id)
    
    def update_status(self, task_id: str, status: TaskStatus, 
                     current_step: Optional[str] = None,
                     progress: Optional[int] = None) -> None:
        """更新任務狀態"""
        with self._lock:
            if task_id not in self._tasks:
                raise ValueError(f"Task {task_id} not found")
            
            self._tasks[task_id]["status"] = status
            if current_step:
                self._tasks[task_id]["current_step"] = current_step
            if progress is not None:
                self._tasks[task_id]["progress"] = progress
    
    def complete_task(self, task_id: str, result: Dict[str, Any]) -> None:
        """標記任務完成"""
        with self._lock:
            if task_id not in self._tasks:
                raise ValueError(f"Task {task_id} not found")
            
            self._tasks[task_id]["status"] = TaskStatus.DONE
            self._tasks[task_id]["progress"] = 100
            self._tasks[task_id]["current_step"] = "完成"
            self._tasks[task_id]["result"] = result
    
    def fail_task(self, task_id: str, error: str) -> None:
        """標記任務失敗"""
        with self._lock:
            if task_id not in self._tasks:
                raise ValueError(f"Task {task_id} not found")
            
            self._tasks[task_id]["status"] = TaskStatus.FAILED
            self._tasks[task_id]["error"] = error
            self._tasks[task_id]["current_step"] = "失敗"
    
    def list_tasks(self) -> list:
        """列出所有任務"""
        with self._lock:
            return list(self._tasks.values())
