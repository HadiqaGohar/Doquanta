"""
Data model for Prompt History Records (PHRs)

This module defines the structure and schema for recording
interactions between users and AI assistants during development.
"""

from datetime import datetime
from typing import Optional, Dict, Any, List
from enum import Enum
import uuid
import json
from pathlib import Path


class InteractionType(Enum):
    """Type of interaction being recorded"""
    PROMPT_RESPONSE = "prompt_response"
    DECISION_MADE = "decision_made"
    CODE_GENERATION = "code_generation"
    DEBUGGING_SESSION = "debugging_session"
    ARCHITECTURAL_DISCUSSION = "architectural_discussion"


class PHRMetadata:
    """
    Metadata for Prompt History Records

    Contains essential information for traceability and searchability
    """

    def __init__(
        self,
        timestamp: datetime,
        user_id: str,
        session_id: str,
        interaction_type: InteractionType,
        project_context: str,
        tags: Optional[List[str]] = None,
        related_records: Optional[List[str]] = None
    ):
        self.timestamp = timestamp
        self.user_id = user_id
        self.session_id = session_id
        self.interaction_type = interaction_type
        self.project_context = project_context
        self.tags = tags or []
        self.related_records = related_records or []
        self.record_id = str(uuid.uuid4())


class PHRContent:
    """
    Content of the Prompt History Record

    Contains the actual prompt, response, and any decisions made
    """

    def __init__(
        self,
        prompt: str,
        ai_response: str,
        decision_made: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
        code_generated: Optional[str] = None,
        files_modified: Optional[List[str]] = None
    ):
        self.prompt = prompt
        self.ai_response = ai_response
        self.decision_made = decision_made
        self.context = context or {}
        self.code_generated = code_generated
        self.files_modified = files_modified or []


class PromptHistoryRecord:
    """
    Complete Prompt History Record

    Combines metadata and content for a complete interaction record
    """

    def __init__(
        self,
        metadata: PHRMetadata,
        content: PHRContent,
        privacy_filtered: bool = False
    ):
        self.metadata = metadata
        self.content = content
        self.privacy_filtered = privacy_filtered
        self.version = "1.0"

    def to_dict(self) -> Dict[str, Any]:
        """Convert the PHR to a dictionary for serialization"""
        return {
            "version": self.version,
            "metadata": {
                "record_id": self.metadata.record_id,
                "timestamp": self.metadata.timestamp.isoformat(),
                "user_id": self.metadata.user_id,
                "session_id": self.metadata.session_id,
                "interaction_type": self.metadata.interaction_type.value,
                "project_context": self.metadata.project_context,
                "tags": self.metadata.tags,
                "related_records": self.metadata.related_records
            },
            "content": {
                "prompt": self.content.prompt,
                "ai_response": self.content.ai_response,
                "decision_made": self.content.decision_made,
                "context": self.content.context,
                "code_generated": self.content.code_generated,
                "files_modified": self.content.files_modified
            },
            "privacy_filtered": self.privacy_filtered
        }

    def to_json(self) -> str:
        """Convert the PHR to a JSON string"""
        return json.dumps(self.to_dict(), indent=2)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'PromptHistoryRecord':
        """Create a PHR from a dictionary"""
        metadata_data = data['metadata']
        content_data = data['content']

        metadata = PHRMetadata(
            timestamp=datetime.fromisoformat(metadata_data['timestamp']),
            user_id=metadata_data['user_id'],
            session_id=metadata_data['session_id'],
            interaction_type=InteractionType(metadata_data['interaction_type']),
            project_context=metadata_data['project_context'],
            tags=metadata_data.get('tags', []),
            related_records=metadata_data.get('related_records', [])
        )

        content = PHRContent(
            prompt=content_data['prompt'],
            ai_response=content_data['ai_response'],
            decision_made=content_data.get('decision_made'),
            context=content_data.get('context', {}),
            code_generated=content_data.get('code_generated'),
            files_modified=content_data.get('files_modified', [])
        )

        phr = cls(metadata, content, data.get('privacy_filtered', False))
        return phr


def save_phr_to_file(phr: PromptHistoryRecord, directory: Path) -> Path:
    """
    Save a PHR to a file in the specified directory

    Organizes files by date/user/topic as specified in the requirements
    """
    # Create directory structure: {directory}/{date}/{user}/{topic}/
    date_dir = directory / phr.metadata.timestamp.strftime("%Y-%m-%d")
    user_dir = date_dir / phr.metadata.user_id
    topic_dir = user_dir / phr.metadata.project_context.replace(" ", "_").lower()

    topic_dir.mkdir(parents=True, exist_ok=True)

    # Create filename with timestamp and record ID
    filename = f"phr_{phr.metadata.timestamp.strftime('%H%M%S')}_{phr.metadata.record_id[:8]}.json"
    filepath = topic_dir / filename

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(phr.to_json())

    return filepath