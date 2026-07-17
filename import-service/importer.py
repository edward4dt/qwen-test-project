"""
YouTube Importer - 核心匯入流程
負責下載、辨識、斷詞、裁切、組裝卡片
"""
from typing import List, Dict, Any, Optional
import os
import tempfile
import subprocess
import json
from pathlib import Path

from task_manager import TaskManager, TaskStatus


class YouTubeImporter:
    """
    YouTube 影片匯入器
    執行完整流程：下載→字幕/語音辨識→斷詞→裁切→組裝卡片
    """
    
    def __init__(self, task_manager: TaskManager, task_id: str):
        self.task_manager = task_manager
        self.task_id = task_id
        self.temp_dir = tempfile.mkdtemp()
    
    async def process(self, url: str, language: str = "ja") -> List[Dict[str, Any]]:
        """
        執行完整匯入流程
        回傳卡片列表
        """
        try:
            # Step 1: 下載音訊與字幕 (T101)
            self._update_progress("下載音訊與字幕...", 10)
            audio_file, subtitle_file = await self._download_media(url)
            
            # Step 2: 取得逐字稿 (T102)
            self._update_progress("處理逐字稿...", 30)
            transcript = await self._get_transcript(subtitle_file, audio_file)
            
            # Step 3: 斷詞與篩選 (T103, T104)
            self._update_progress("斷詞與篩選詞彙...", 50)
            candidates = self._extract_candidates(transcript, language)
            
            # Step 4: 查詢解釋 (T105)
            self._update_progress("查詢詞彙解釋...", 65)
            enriched_candidates = await self._enrich_candidates(candidates)
            
            # Step 5: 裁切音檔 (T106)
            self._update_progress("裁切發音片段...", 80)
            cards_with_audio = await self._cut_audio_segments(
                enriched_candidates, audio_file, transcript
            )
            
            # Step 6: 組裝卡片 (T107)
            self._update_progress("組裝卡片...", 95)
            cards = self._assemble_cards(cards_with_audio)
            
            self._update_progress("完成", 100)
            return cards
            
        finally:
            # 清理暫存檔案
            self._cleanup()
    
    async def _download_media(self, url: str) -> tuple:
        """
        T101: 使用 yt-dlp 下載音訊與內建字幕
        回傳：(audio_path, subtitle_path)
        """
        audio_path = os.path.join(self.temp_dir, "audio.m4a")
        subtitle_path = os.path.join(self.temp_dir, "subtitle.json")
        
        # 下載音訊
        cmd_audio = [
            "yt-dlp",
            "-x",  # 提取音訊
            "--audio-format", "m4a",
            "-o", audio_path,
            url
        ]
        
        # 嘗試下載字幕（優先日語）
        cmd_sub = [
            "yt-dlp",
            "--skip-download",
            "--write-sub",
            "--sub-lang", "ja",
            "--sub-format", "json",
            "-o", subtitle_path.replace(".json", ".%(ext)s"),
            url
        ]
        
        # 執行下載（簡化：實際應非同步執行）
        subprocess.run(cmd_audio, check=True, capture_output=True)
        subprocess.run(cmd_sub, check=False, capture_output=True)  # 字幕可選
        
        subtitle_path = subtitle_path if os.path.exists(subtitle_path) else None
        
        return audio_path, subtitle_path
    
    async def _get_transcript(self, subtitle_file: Optional[str], 
                             audio_file: str) -> List[Dict]:
        """
        T102: 取得逐字稿與時間戳
        若有字幕則直接使用，否則用 whisper.cpp 產生
        """
        if subtitle_file and os.path.exists(subtitle_file):
            # 使用現有字幕
            with open(subtitle_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                # 解析 YouTube 字幕格式
                return self._parse_youtube_subtitle(data)
        else:
            # 使用 whisper.cpp 產生逐字稿
            return await self._run_whisper(audio_file)
    
    def _parse_youtube_subtitle(self, data: Dict) -> List[Dict]:
        """解析 YouTube 字幕 JSON 格式"""
        transcript = []
        for event in data.get('events', []):
            if 'segs' in event:
                text = ''.join(seg.get('utf8', '') for seg in event['segs'])
                start = event.get('tStartMs', 0) / 1000.0
                duration = event.get('dDurationMs', 0) / 1000.0
                if text.strip():
                    transcript.append({
                        "text": text.strip(),
                        "start": start,
                        "duration": duration
                    })
        return transcript
    
    async def _run_whisper(self, audio_file: str) -> List[Dict]:
        """使用 whisper.cpp 產生逐字稿"""
        # 簡化實作：實際需呼叫 whisper.cpp
        self.task_manager.update_status(
            self.task_id, TaskStatus.PROCESSING,
            "使用 whisper.cpp 進行語音辨識..."
        )
        # TODO: 實作 whisper.cpp 呼叫
        return []
    
    def _extract_candidates(self, transcript: List[Dict], 
                           language: str) -> List[Dict]:
        """
        T103, T104: 斷詞並篩選候選詞彙
        使用 fugashi 進行日語斷詞
        """
        candidates = []
        
        for segment in transcript:
            text = segment["text"]
            
            # 使用 fugashi 斷詞
            import fugashi
            tokens = list(fugashi.Tokenizer()(text))
            
            for token in tokens:
                word = token.surface
                # 過濾規則：長度、詞性等
                if self._is_valid_candidate(word, token):
                    candidates.append({
                        "text": word,
                        "start": segment["start"],
                        "duration": segment["duration"],
                        "pos": token.pos_feature if hasattr(token, 'pos_feature') else None
                    })
        
        # 去重與排序
        seen = set()
        unique_candidates = []
        for c in candidates:
            if c["text"] not in seen:
                seen.add(c["text"])
                unique_candidates.append(c)
        
        return unique_candidates
    
    def _is_valid_candidate(self, word: str, token) -> bool:
        """檢查是否為有效的候選詞彙"""
        # 過濾規則
        if len(word) < 2 or len(word) > 15:
            return False
        
        # 過濾標點符號
        if not any(c.isalnum() for c in word):
            return False
        
        # TODO: 加入更多過濾規則（詞性、頻率等）
        return True
    
    async def _enrich_candidates(self, candidates: List[Dict]) -> List[Dict]:
        """
        T105: 為每個候選詞彙查詢中文/英文解釋
        使用 JMdict 離線字典或 Jisho API
        """
        enriched = []
        
        for candidate in candidates:
            word = candidate["text"]
            
            # 查詢解釋（簡化：實際需呼叫字典 API）
            meaning = await self._lookup_meaning(word)
            
            if meaning:
                candidate["meaning_zh"] = meaning.get("zh")
                candidate["meaning_en"] = meaning.get("en")
                candidate["reading"] = meaning.get("reading", word)
                enriched.append(candidate)
            else:
                # 標記為待人工校對
                candidate["needs_review"] = True
        
        return enriched
    
    async def _lookup_meaning(self, word: str) -> Optional[Dict]:
        """查詢詞彙解釋"""
        # TODO: 實作 JMdict 或 Jisho API 查詢
        # 簡化：返回假資料供測試
        return {
            "zh": f"[{word}] 的中文解釋",
            "en": f"Meaning of {word}",
            "reading": word
        }
    
    async def _cut_audio_segments(self, candidates: List[Dict], 
                                  audio_file: str,
                                  transcript: List[Dict]) -> List[Dict]:
        """
        T106: 依時間戳裁切音檔
        使用 ffmpeg 從原始音訊切出單詞/例句發音片段
        """
        for candidate in candidates:
            start = candidate["start"]
            duration = candidate["duration"]
            
            # 裁切音檔
            output_path = os.path.join(
                self.temp_dir, 
                f"audio_{candidate['text']}.m4a"
            )
            
            cmd = [
                "ffmpeg",
                "-i", audio_file,
                "-ss", str(start),
                "-t", str(duration),
                "-c", "copy",
                output_path
            ]
            
            subprocess.run(cmd, check=False, capture_output=True)
            candidate["audio_path"] = output_path
        
        return candidates
    
    def _assemble_cards(self, candidates: List[Dict]) -> List[Dict[str, Any]]:
        """
        T107: 整合文字、讀音、意思、音檔，輸出 Card 介面
        """
        cards = []
        
        for candidate in candidates:
            if candidate.get("needs_review"):
                continue  # 跳過待校對的卡片
            
            card = {
                "id": f"card_{candidate['text']}_{candidate['start']}",
                "text": candidate["text"],
                "reading": candidate.get("reading", candidate["text"]),
                "meaning": candidate.get("meaning_zh") or candidate.get("meaning_en"),
                "meaning_en": candidate.get("meaning_en"),
                "meaning_zh": candidate.get("meaning_zh"),
                "audio_path": candidate.get("audio_path"),
                "source": "youtube",
                "created_at": None,  # 由資料庫填充
                "srs_data": None
            }
            cards.append(card)
        
        return cards
    
    def _update_progress(self, step: str, progress: int):
        """更新任務進度"""
        self.task_manager.update_status(
            self.task_id, TaskStatus.PROCESSING,
            current_step=step,
            progress=progress
        )
    
    def _cleanup(self):
        """清理暫存目錄"""
        import shutil
        try:
            shutil.rmtree(self.temp_dir)
        except Exception:
            pass
