"""
任務管理器測試
"""
import pytest
from task_manager import TaskManager, TaskStatus


class TestTaskManager:
    """TaskManager 單元測試"""
    
    def setup_method(self):
        """每個測試前建立新的 TaskManager"""
        self.manager = TaskManager()
    
    def test_create_task(self):
        """測試建立任務"""
        task_id = "test-123"
        url = "https://youtube.com/watch?v=test"
        
        self.manager.create_task(task_id, url)
        task = self.manager.get_task(task_id)
        
        assert task is not None
        assert task["task_id"] == task_id
        assert task["url"] == url
        assert task["status"] == TaskStatus.PENDING
        assert task["progress"] == 0
    
    def test_get_nonexistent_task(self):
        """測試取得不存在的任務"""
        task = self.manager.get_task("nonexistent")
        assert task is None
    
    def test_update_status(self):
        """測試更新任務狀態"""
        task_id = "test-456"
        self.manager.create_task(task_id, "https://example.com")
        
        self.manager.update_status(
            task_id, 
            TaskStatus.PROCESSING,
            current_step="下載中",
            progress=50
        )
        
        task = self.manager.get_task(task_id)
        assert task["status"] == TaskStatus.PROCESSING
        assert task["current_step"] == "下載中"
        assert task["progress"] == 50
    
    def test_complete_task(self):
        """測試完成任務"""
        task_id = "test-789"
        self.manager.create_task(task_id, "https://example.com")
        
        result = {"cards": [], "count": 0}
        self.manager.complete_task(task_id, result)
        
        task = self.manager.get_task(task_id)
        assert task["status"] == TaskStatus.DONE
        assert task["progress"] == 100
        assert task["result"] == result
    
    def test_fail_task(self):
        """測試失敗任務"""
        task_id = "test-fail"
        self.manager.create_task(task_id, "https://example.com")
        
        error_msg = "Test error"
        self.manager.fail_task(task_id, error_msg)
        
        task = self.manager.get_task(task_id)
        assert task["status"] == TaskStatus.FAILED
        assert task["error"] == error_msg
    
    def test_list_tasks(self):
        """測試列出所有任務"""
        self.manager.create_task("task-1", "https://example1.com")
        self.manager.create_task("task-2", "https://example2.com")
        
        tasks = self.manager.list_tasks()
        assert len(tasks) == 2
    
    def test_update_nonexistent_task_raises(self):
        """測試更新不存在的任務應拋出異常"""
        with pytest.raises(ValueError):
            self.manager.update_status("nonexistent", TaskStatus.PROCESSING)
    
    def test_complete_nonexistent_task_raises(self):
        """測試完成不存在的任務應拋出異常"""
        with pytest.raises(ValueError):
            self.manager.complete_task("nonexistent", {})
    
    def test_fail_nonexistent_task_raises(self):
        """測試失敗不存在的任務應拋出異常"""
        with pytest.raises(ValueError):
            self.manager.fail_task("nonexistent", "error")
