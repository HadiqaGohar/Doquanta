"""
Search Service for PHRs and ADRs

This module provides search functionality to find Prompt History Records
and Architectural Decision Records by various criteria.
"""

from typing import List, Dict, Any, Optional, Union
from pathlib import Path
import json
import yaml
import re
from datetime import datetime
from dataclasses import dataclass
from enum import Enum
import fnmatch


class SearchResultType(Enum):
    """Type of search result"""
    PHR = "phr"
    ADR = "adr"


@dataclass
class SearchResult:
    """Represents a search result"""
    file_path: Path
    result_type: SearchResultType
    title: str
    snippet: str
    score: float  # Relevance score (0.0 to 1.0)
    metadata: Dict[str, Any]
    timestamp: datetime


class SearchIndex:
    """
    Maintains an index of PHRs and ADRs for efficient searching
    """

    def __init__(self, storage_directory: Path):
        self.storage_directory = storage_directory
        self.index: List[SearchResult] = []
        self.last_indexed = None

    def rebuild_index(self):
        """Rebuild the search index from all PHRs and ADRs in storage"""
        self.index = []

        # Index PHR files (JSON)
        for phr_file in self.storage_directory.rglob("*.json"):
            try:
                result = self._index_phr_file(phr_file)
                if result:
                    self.index.append(result)
            except Exception as e:
                print(f"Error indexing PHR {phr_file}: {e}")

        # Index ADR files (Markdown with YAML frontmatter)
        for adr_file in self.storage_directory.rglob("*.md"):
            try:
                result = self._index_adr_file(adr_file)
                if result:
                    self.index.append(result)
            except Exception as e:
                print(f"Error indexing ADR {adr_file}: {e}")

        self.last_indexed = datetime.now()

    def _index_phr_file(self, file_path: Path) -> Optional[SearchResult]:
        """Index a PHR file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = json.load(f)

            # Extract metadata
            metadata = content.get('metadata', {})
            content_data = content.get('content', {})

            # Create title and snippet
            prompt = content_data.get('prompt', '')[:100]
            ai_response = content_data.get('ai_response', '')[:100]

            title = f"PHR: {prompt[:50]}..." if len(prompt) > 50 else f"PHR: {prompt}"
            snippet = f"Prompt: {prompt} | Response: {ai_response}"

            # Parse timestamp
            timestamp_str = metadata.get('timestamp', '')
            timestamp = datetime.fromisoformat(timestamp_str) if timestamp_str else datetime.now()

            return SearchResult(
                file_path=file_path,
                result_type=SearchResultType.PHR,
                title=title,
                snippet=snippet,
                score=1.0,  # Initially full score, will be adjusted by search
                metadata=metadata,
                timestamp=timestamp
            )
        except Exception:
            return None

    def _index_adr_file(self, file_path: Path) -> Optional[SearchResult]:
        """Index an ADR file (Markdown with YAML frontmatter)"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            # Extract YAML frontmatter
            if content.startswith('---'):
                parts = content.split('---', 2)
                if len(parts) >= 3:
                    yaml_content = parts[1]
                    markdown_content = parts[2]

                    metadata = yaml.safe_load(yaml_content)

                    # Extract title from markdown content
                    lines = markdown_content.split('\n')
                    title = ""
                    for line in lines:
                        if line.startswith('# '):
                            title = line[2:].strip()
                            break

                    if not title and metadata:
                        title = metadata.get('title', f"ADR: {file_path.name}")

                    # Create snippet from first part of content
                    snippet = markdown_content[:200].replace('\n', ' ') + "..."

                    # Parse timestamp
                    date_str = metadata.get('date', '')
                    if date_str:
                        timestamp = datetime.fromisoformat(date_str) if 'T' in date_str else datetime.strptime(date_str, '%Y-%m-%d')
                    else:
                        timestamp = datetime.fromtimestamp(file_path.stat().st_mtime)

                    return SearchResult(
                        file_path=file_path,
                        result_type=SearchResultType.ADR,
                        title=title,
                        snippet=snippet,
                        score=1.0,  # Initially full score, will be adjusted by search
                        metadata=metadata or {},
                        timestamp=timestamp
                    )

        except Exception:
            pass  # Silently ignore files that aren't valid ADRs

        return None


class SearchService:
    """
    Provides search functionality for PHRs and ADRs
    """

    def __init__(self, storage_directory: Path):
        self.storage_directory = storage_directory
        self.search_index = SearchIndex(storage_directory)

    def ensure_fresh_index(self):
        """Ensure the search index is up to date"""
        # For simplicity, we'll rebuild the index each time
        # In production, you might want to implement incremental updates
        self.search_index.rebuild_index()

    def search(
        self,
        query: str,
        search_types: Optional[List[SearchResultType]] = None,
        user_id: Optional[str] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
        tags: Optional[List[str]] = None,
        project_context: Optional[str] = None,
        limit: int = 20
    ) -> List[SearchResult]:
        """
        Search for PHRs and ADRs matching the criteria

        Args:
            query: Text to search for
            search_types: Types of results to include (PHR, ADR, or both)
            user_id: Filter by user ID
            date_from: Filter by minimum date
            date_to: Filter by maximum date
            tags: Filter by tags
            project_context: Filter by project context
            limit: Maximum number of results to return

        Returns:
            List of search results ordered by relevance
        """
        # Ensure index is fresh
        self.ensure_fresh_index()

        # Apply filters to the index
        filtered_results = self.search_index.index.copy()

        # Filter by search types
        if search_types:
            filtered_results = [
                result for result in filtered_results
                if result.result_type in search_types
            ]

        # Filter by user
        if user_id:
            filtered_results = [
                result for result in filtered_results
                if result.metadata.get('user_id') == user_id
            ]

        # Filter by date range
        if date_from:
            filtered_results = [
                result for result in filtered_results
                if result.timestamp >= date_from
            ]

        if date_to:
            filtered_results = [
                result for result in filtered_results
                if result.timestamp <= date_to
            ]

        # Filter by tags
        if tags:
            filtered_results = [
                result for result in filtered_results
                if any(tag in result.metadata.get('tags', []) for tag in tags)
            ]

        # Filter by project context
        if project_context:
            filtered_results = [
                result for result in filtered_results
                if result.metadata.get('project_context') == project_context
            ]

        # Apply text search scoring
        scored_results = []
        query_lower = query.lower()

        for result in filtered_results:
            score = self._calculate_relevance_score(result, query_lower)
            if score > 0:  # Only include results with some relevance
                result.score = score
                scored_results.append(result)

        # Sort by score (descending) and return limited results
        scored_results.sort(key=lambda x: x.score, reverse=True)

        return scored_results[:limit]

    def _calculate_relevance_score(self, result: SearchResult, query: str) -> float:
        """
        Calculate relevance score for a search result based on the query

        Args:
            result: The search result to score
            query: The search query (lowercase)

        Returns:
            Relevance score between 0.0 and 1.0
        """
        score = 0.0

        # Score based on title match
        if query in result.title.lower():
            score += 0.4

        # Score based on content/snippet match
        if query in result.snippet.lower():
            score += 0.3

        # Score based on metadata match
        metadata_str = " ".join(str(v) for v in result.metadata.values()).lower()
        if query in metadata_str:
            score += 0.2

        # Boost score for exact phrase matches
        if query in result.title.lower() or query in result.snippet.lower():
            score += 0.1

        # Ensure score is between 0 and 1
        return min(score, 1.0)

    def search_by_tag(self, tag: str) -> List[SearchResult]:
        """
        Search for PHRs and ADRs by tag

        Args:
            tag: Tag to search for

        Returns:
            List of matching search results
        """
        return self.search("", tags=[tag])

    def search_by_date_range(
        self,
        date_from: datetime,
        date_to: datetime,
        limit: int = 20
    ) -> List[SearchResult]:
        """
        Search for PHRs and ADRs within a date range

        Args:
            date_from: Start date
            date_to: End date
            limit: Maximum number of results

        Returns:
            List of matching search results
        """
        return self.search("", date_from=date_from, date_to=date_to, limit=limit)

    def search_by_user(self, user_id: str, limit: int = 20) -> List[SearchResult]:
        """
        Search for PHRs and ADRs by user ID

        Args:
            user_id: User ID to search for
            limit: Maximum number of results

        Returns:
            List of matching search results
        """
        return self.search("", user_id=user_id, limit=limit)

    def get_statistics(self) -> Dict[str, Any]:
        """
        Get statistics about indexed PHRs and ADRs

        Returns:
            Dictionary with statistics
        """
        self.ensure_fresh_index()

        total_count = len(self.search_index.index)
        phr_count = sum(1 for r in self.search_index.index if r.result_type == SearchResultType.PHR)
        adr_count = sum(1 for r in self.search_index.index if r.result_type == SearchResultType.ADR)

        # Get date range
        if self.search_index.index:
            dates = [r.timestamp for r in self.search_index.index]
            min_date = min(dates)
            max_date = max(dates)
        else:
            min_date = max_date = None

        # Get unique users
        users = set(r.metadata.get('user_id') for r in self.search_index.index if r.metadata.get('user_id'))

        # Get common tags
        all_tags = []
        for result in self.search_index.index:
            tags = result.metadata.get('tags', [])
            all_tags.extend(tags)

        from collections import Counter
        tag_counts = Counter(all_tags)
        most_common_tags = dict(tag_counts.most_common(10))

        return {
            'total_records': total_count,
            'phr_count': phr_count,
            'adr_count': adr_count,
            'date_range': {'min': min_date, 'max': max_date},
            'unique_users': len(users),
            'most_common_tags': most_common_tags
        }


# Example usage
if __name__ == "__main__":
    import tempfile

    # This example assumes you have some PHR and ADR files to search
    with tempfile.TemporaryDirectory() as temp_dir:
        storage_path = Path(temp_dir)

        # Create a search service
        search_service = SearchService(storage_path)

        print("Search Service Initialized")
        print(f"Storage directory: {storage_path}")

        # Example search (won't find anything in empty temp dir, but shows usage)
        try:
            results = search_service.search("authentication")
            print(f"Found {len(results)} results for 'authentication'")
        except Exception as e:
            print(f"Search completed (expected no results in empty directory): {e}")

        # Show statistics
        stats = search_service.get_statistics()
        print(f"\nIndex Statistics:")
        print(f"  Total records: {stats['total_records']}")
        print(f"  PHRs: {stats['phr_count']}")
        print(f"  ADRs: {stats['adr_count']}")
        print(f"  Unique users: {stats['unique_users']}")
        print(f"  Most common tags: {list(stats['most_common_tags'].keys())}")