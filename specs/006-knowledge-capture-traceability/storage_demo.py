"""
Demonstration of the PHR storage system

This script shows how PHRs are stored in an organized directory structure
by date/user/topic as required by the specification.
"""

from datetime import datetime
from pathlib import Path
import tempfile
import os
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent))

from phr_model import (
    PromptHistoryRecord, PHRMetadata, PHRContent,
    InteractionType
)
from phr_generator_service import PHRGeneratorService


def demonstrate_storage_organization():
    """
    Demonstrate how PHRs are stored in organized directory structure
    """
    print("Demonstrating PHR Storage Organization")
    print("=" * 50)

    # Create a temporary directory for demonstration
    with tempfile.TemporaryDirectory() as temp_dir:
        storage_path = Path(temp_dir) / "phr_storage"

        print(f"Storage directory: {storage_path}")

        # Initialize the PHR service
        service = PHRGeneratorService(
            storage_directory=storage_path,
            user_id="developer_john"
        )
        service.start_async_processing()

        # Create sample PHRs with different contexts
        sample_interactions = [
            {
                "prompt": "How do I implement user authentication?",
                "response": "You should use JWT tokens with refresh rotation.",
                "context": "auth_module_development",
                "type": InteractionType.CODE_GENERATION
            },
            {
                "prompt": "What's the best way to structure the database?",
                "response": "Use a normalized schema with proper indexing.",
                "context": "database_design",
                "type": InteractionType.ARCHITECTURAL_DISCUSSION
            },
            {
                "prompt": "Fix this error in my code",
                "response": "The issue is with the null pointer exception.",
                "context": "bug_fixing",
                "type": InteractionType.DEBUGGING_SESSION
            }
        ]

        print("\nCreating sample PHRs...")
        for i, interaction in enumerate(sample_interactions):
            record_id = service.capture_interaction(
                prompt=interaction["prompt"],
                ai_response=interaction["response"],
                interaction_type=interaction["type"],
                project_context=interaction["context"],
                tags=["demo", "sample"]
            )
            print(f"  Created PHR {i+1}: {record_id}")

        # Stop the service to ensure all PHRs are saved
        service.stop_async_processing()

        # Show the directory structure created
        print(f"\nDirectory structure created:")
        for root, dirs, files in os.walk(storage_path):
            level = root.replace(str(storage_path), '').count(os.sep)
            indent = ' ' * 2 * level
            print(f"{indent}{os.path.basename(root)}/")
            subindent = ' ' * 2 * (level + 1)
            for file in files:
                print(f"{subindent}{file}")

        # Verify the organization
        print(f"\nVerifying storage organization:")
        date_dirs = [d for d in storage_path.iterdir() if d.is_dir()]
        print(f"  Date directories: {[d.name for d in date_dirs]}")

        for date_dir in date_dirs:
            user_dirs = [d for d in date_dir.iterdir() if d.is_dir()]
            print(f"    User directories in {date_dir.name}: {[d.name for d in user_dirs]}")

            for user_dir in user_dirs:
                topic_dirs = [d for d in user_dir.iterdir() if d.is_dir()]
                print(f"      Topic directories in {user_dir.name}: {[d.name for d in topic_dirs]}")

                for topic_dir in topic_dirs:
                    phr_files = list(topic_dir.glob("*.json"))
                    print(f"        PHR files in {topic_dir.name}: {len(phr_files)}")


def demonstrate_search_capability():
    """
    Demonstrate how PHRs can be searched by various criteria
    """
    print("\n\nDemonstrating Search Capability")
    print("=" * 50)

    with tempfile.TemporaryDirectory() as temp_dir:
        storage_path = Path(temp_dir) / "search_demo"
        service = PHRGeneratorService(
            storage_directory=storage_path,
            user_id="search_tester"
        )
        service.start_async_processing()

        # Create PHRs with different tags and contexts for search testing
        contexts_and_tags = [
            ("authentication", ["auth", "security"]),
            ("database", ["db", "performance"]),
            ("ui_component", ["frontend", "react"]),
        ]

        for context, tags in contexts_and_tags:
            service.capture_interaction(
                prompt=f"Working on {context}",
                ai_response=f"Completed {context} implementation",
                interaction_type=InteractionType.CODE_GENERATION,
                project_context=context,
                tags=tags
            )

        service.stop_async_processing()

        print(f"Created PHRs in: {storage_path}")

        # Count PHRs by context
        for date_dir in storage_path.iterdir():
            if date_dir.is_dir():
                for user_dir in date_dir.iterdir():
                    if user_dir.is_dir():
                        for topic_dir in user_dir.iterdir():
                            if topic_dir.is_dir():
                                phr_count = len(list(topic_dir.glob("*.json")))
                                print(f"  Found {phr_count} PHR(s) in topic: {topic_dir.name}")


if __name__ == "__main__":
    demonstrate_storage_organization()
    demonstrate_search_capability()