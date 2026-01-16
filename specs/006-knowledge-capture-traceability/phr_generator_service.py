"""
PHR Generator Service

This service automatically captures user prompts and AI responses
during development interactions and creates Prompt History Records.
"""

from datetime import datetime
from typing import Optional, Dict, Any, List
from pathlib import Path
import logging
from contextlib import contextmanager
import threading
import queue
from .phr_model import (
    PromptHistoryRecord, PHRMetadata, PHRContent,
    InteractionType, save_phr_to_file
)


class PHRGeneratorService:
    """
    Service to automatically capture and record AI interactions
    """

    def __init__(self, storage_directory: Path, user_id: str = "default_user"):
        self.storage_directory = storage_directory
        self.user_id = user_id
        self.session_id = f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{id(self)}"

        # Thread-safe queue for async processing
        self.phr_queue = queue.Queue()
        self.processing_thread = None
        self._stop_processing = False

        # Privacy filtering patterns
        self.privacy_patterns = [
            "password",
            "secret",
            "token",
            "key",
            "credential",
            "api_key",
            "auth_token"
        ]

        # Setup logging
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(logging.INFO)

        # Create storage directory if it doesn't exist
        self.storage_directory.mkdir(parents=True, exist_ok=True)

    def start_async_processing(self):
        """Start background processing of PHRs"""
        if self.processing_thread is None or not self.processing_thread.is_alive():
            self._stop_processing = False
            self.processing_thread = threading.Thread(target=self._process_phrs, daemon=True)
            self.processing_thread.start()

    def stop_async_processing(self):
        """Stop background processing of PHRs"""
        self._stop_processing = True
        if self.processing_thread:
            self.processing_thread.join(timeout=5.0)  # Wait up to 5 seconds

    def _process_phrs(self):
        """Background thread to process PHRs from the queue"""
        while not self._stop_processing:
            try:
                # Get PHR from queue with timeout
                phr_task = self.phr_queue.get(timeout=1.0)

                if phr_task == "STOP":
                    break

                phr, privacy_filtered = phr_task
                try:
                    # Save the PHR to file
                    filepath = save_phr_to_file(phr, self.storage_directory)
                    self.logger.info(f"Saved PHR to {filepath}")
                except Exception as e:
                    self.logger.error(f"Failed to save PHR: {e}")

                self.phr_queue.task_done()
            except queue.Empty:
                continue
            except Exception as e:
                self.logger.error(f"Error in PHR processing: {e}")

    def _filter_privacy_content(self, content: str) -> tuple[str, bool]:
        """
        Filter potentially sensitive information from content

        Returns:
            - Filtered content
            - Boolean indicating if content was filtered
        """
        original_content = content
        filtered = False

        for pattern in self.privacy_patterns:
            if pattern.lower() in content.lower():
                # Replace the sensitive content with a placeholder
                content = content.replace(pattern, "[FILTERED]", 1)
                filtered = True

        return content, filtered

    def capture_interaction(
        self,
        prompt: str,
        ai_response: str,
        interaction_type: InteractionType = InteractionType.PROMPT_RESPONSE,
        project_context: str = "default_project",
        decision_made: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
        code_generated: Optional[str] = None,
        files_modified: Optional[List[str]] = None,
        tags: Optional[List[str]] = None
    ) -> str:
        """
        Capture an interaction between user and AI assistant

        Args:
            prompt: The user's prompt to the AI
            ai_response: The AI's response
            interaction_type: Type of interaction
            project_context: Current project or context
            decision_made: Any decision made during the interaction
            context: Additional context information
            code_generated: Code that was generated during interaction
            files_modified: Files that were modified during interaction
            tags: Tags for categorizing the PHR

        Returns:
            Record ID of the created PHR
        """
        # Filter privacy-sensitive content
        filtered_prompt, prompt_filtered = self._filter_privacy_content(prompt)
        filtered_response, response_filtered = self._filter_privacy_content(ai_response)
        privacy_filtered = prompt_filtered or response_filtered

        # Create metadata
        metadata = PHRMetadata(
            timestamp=datetime.now(),
            user_id=self.user_id,
            session_id=self.session_id,
            interaction_type=interaction_type,
            project_context=project_context,
            tags=tags or [],
        )

        # Create content
        content = PHRContent(
            prompt=filtered_prompt,
            ai_response=filtered_response,
            decision_made=decision_made,
            context=context or {},
            code_generated=code_generated,
            files_modified=files_modified or []
        )

        # Create PHR
        phr = PromptHistoryRecord(
            metadata=metadata,
            content=content,
            privacy_filtered=privacy_filtered
        )

        # Add to processing queue
        self.phr_queue.put((phr, privacy_filtered))

        return phr.metadata.record_id

    def capture_decision(
        self,
        decision_description: str,
        decision_context: str,
        alternatives_considered: List[str],
        chosen_option: str,
        project_context: str = "default_project",
        tags: Optional[List[str]] = None
    ) -> str:
        """
        Capture an architectural or significant decision

        Args:
            decision_description: Description of the decision made
            decision_context: Context in which the decision was made
            alternatives_considered: List of alternatives considered
            chosen_option: The option that was chosen
            project_context: Current project or context
            tags: Tags for categorizing the PHR

        Returns:
            Record ID of the created PHR
        """
        prompt = f"Decision needed: {decision_description}\nContext: {decision_context}"
        response = f"Alternatives considered: {alternatives_considered}\nChosen: {chosen_option}"
        decision_text = f"{decision_description} - Chosen: {chosen_option}"

        return self.capture_interaction(
            prompt=prompt,
            ai_response=response,
            interaction_type=InteractionType.DECISION_MADE,
            project_context=project_context,
            decision_made=decision_text,
            context={
                "decision_description": decision_description,
                "decision_context": decision_context,
                "alternatives_considered": alternatives_considered,
                "chosen_option": chosen_option
            },
            tags=tags or ["decision", "architecture"] if "architecture" in decision_description.lower() else tags or ["decision"]
        )

    @contextmanager
    def capture_session(self, session_context: str = "default_session"):
        """
        Context manager for capturing an entire session of interactions

        Usage:
            with phr_service.capture_session("implementing_auth"):
                # Perform multiple interactions
                phr_service.capture_interaction(prompt1, response1)
                phr_service.capture_interaction(prompt2, response2)
        """
        original_context = self.session_id
        new_session_id = f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{session_context}"
        self.session_id = new_session_id

        try:
            yield self
        finally:
            self.session_id = original_context

    def get_statistics(self) -> Dict[str, Any]:
        """Get statistics about captured interactions"""
        stats = {
            "total_interactions": 0,
            "interactions_by_type": {},
            "interactions_by_date": {},
            "interactions_by_user": {},
            "queued_for_processing": self.phr_queue.qsize()
        }

        # This would typically query the stored PHRs to get actual statistics
        # For now, we return the basic structure
        return stats


# Global instance for easy access
_default_phr_service: Optional[PHRGeneratorService] = None


def get_phr_service() -> PHRGeneratorService:
    """Get the global PHR service instance"""
    global _default_phr_service
    if _default_phr_service is None:
        raise RuntimeError("PHR service not initialized. Call init_phr_service first.")
    return _default_phr_service


def init_phr_service(storage_directory: Path, user_id: str = "default_user") -> PHRGeneratorService:
    """Initialize the global PHR service instance"""
    global _default_phr_service
    _default_phr_service = PHRGeneratorService(
        storage_directory=storage_directory,
        user_id=user_id
    )
    _default_phr_service.start_async_processing()
    return _default_phr_service


def shutdown_phr_service():
    """Shutdown the global PHR service instance"""
    global _default_phr_service
    if _default_phr_service:
        _default_phr_service.stop_async_processing()
        _default_phr_service = None