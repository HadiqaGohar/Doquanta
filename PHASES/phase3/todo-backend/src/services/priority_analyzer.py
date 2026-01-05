"""
Priority Analysis Service for Task Prioritization

This module provides functionality to analyze and suggest task priorities
based on multiple factors including keywords, due dates, and task content.
"""
import re
from typing import Dict, Optional, Tuple
from datetime import datetime, timedelta


class PriorityAnalyzerService:
    """
    Service class to handle intelligent priority analysis for tasks.
    """

    def __init__(self):
        # Define priority keywords with their impact scores
        self.high_priority_keywords = [
            "urgent", "asap", "immediately", "critical", "emergency",
            "deadline", "today", "now", "important", "priority",
            "crucial", "vital", "essential", "required", "needed",
            "due", "urgent", "time-sensitive", "expedited", "rush"
        ]

        self.medium_priority_keywords = [
            "soon", "later", "this week", "this month", "upcoming",
            "should", "would like", "plan to", "consider", "might",
            "optional", "nice to have", "eventually", "someday"
        ]

        self.low_priority_keywords = [
            "someday", "maybe", "possibly", "when possible", "whenever",
            "eventually", "not urgent", "low priority", "not important",
            "just for reference", "not critical", "not essential"
        ]

    def analyze_priority(self, title: str, description: Optional[str] = None, due_date: Optional[datetime] = None) -> Tuple[str, float]:
        """
        Analyze the priority of a task based on multiple factors.

        Args:
            title (str): The task title
            description (Optional[str]): The task description
            due_date (Optional[datetime]): The task due date

        Returns:
            Tuple[str, float]: The suggested priority level ('high', 'medium', 'low') and confidence score (0-1)
        """
        if not title:
            return "medium", 0.5

        # Combine title and description for analysis
        text = f"{title} {description or ''}".lower()

        # Calculate priority scores based on different factors
        keyword_score = self._calculate_keyword_score(text)
        time_score = self._calculate_time_score(due_date)

        # Combine scores (keyword_score: 70%, time_score: 30%)
        combined_score = (keyword_score * 0.7) + (time_score * 0.3)

        # Determine priority level based on combined score
        if combined_score >= 0.7:
            priority = "high"
        elif combined_score >= 0.3:
            priority = "medium"
        else:
            priority = "low"

        # Calculate confidence based on how strongly indicators point to a priority
        confidence = min(1.0, max(0.0, combined_score))

        return priority, confidence

    def _calculate_keyword_score(self, text: str) -> float:
        """
        Calculate a priority score based on keywords in the text.

        Args:
            text (str): The text to analyze

        Returns:
            float: Priority score (0-1)
        """
        high_count = sum(1 for keyword in self.high_priority_keywords if keyword in text)
        medium_count = sum(1 for keyword in self.medium_priority_keywords if keyword in text)
        low_count = sum(1 for keyword in self.low_priority_keywords if keyword in text)

        # If there are conflicting keywords, prioritize higher ones
        if high_count > 0:
            # High priority keywords get higher scores
            return min(1.0, high_count * 0.4)  # Each high keyword contributes 0.4 to the score
        elif medium_count > 0:
            # Medium priority keywords
            return min(0.6, 0.3 + (medium_count * 0.1))  # Base 0.3 + 0.1 per medium keyword
        elif low_count > 0:
            # Low priority keywords
            return max(0.0, 0.2 - (low_count * 0.05))  # Base 0.2 - 0.05 per low keyword
        else:
            # No priority keywords found, return medium priority
            return 0.5

    def _calculate_time_score(self, due_date: Optional[datetime]) -> float:
        """
        Calculate a priority score based on the due date.

        Args:
            due_date (Optional[datetime]): The due date

        Returns:
            float: Priority score (0-1)
        """
        if not due_date:
            # No due date specified, return medium priority
            return 0.5

        now = datetime.now()
        time_diff = due_date - now

        if time_diff.total_seconds() < 0:
            # Task is overdue, high priority
            return 1.0
        elif time_diff <= timedelta(hours=24):
            # Due within 24 hours, high priority
            return 0.9
        elif time_diff <= timedelta(days=3):
            # Due within 3 days, medium-high priority
            return 0.7
        elif time_diff <= timedelta(weeks=1):
            # Due within a week, medium priority
            return 0.5
        elif time_diff <= timedelta(weeks=4):
            # Due within a month, medium-low priority
            return 0.3
        else:
            # Due later, low priority
            return 0.1

    def suggest_priority_with_reasoning(self, title: str, description: Optional[str] = None, due_date: Optional[datetime] = None) -> Dict[str, any]:
        """
        Suggest priority with detailed reasoning.

        Args:
            title (str): The task title
            description (Optional[str]): The task description
            due_date (Optional[datetime]): The task due date

        Returns:
            Dict[str, any]: Priority suggestion with reasoning
        """
        priority, confidence = self.analyze_priority(title, description, due_date)

        text = f"{title} {description or ''}".lower()
        detected_keywords = [kw for kw in self.high_priority_keywords + self.medium_priority_keywords + self.low_priority_keywords if kw in text]

        return {
            "priority": priority,
            "confidence": round(confidence, 2),
            "reasoning": {
                "keywords_found": detected_keywords,
                "due_date_factor": "Based on due date" if due_date else "No due date specified",
                "time_until_due": str(due_date - datetime.now()) if due_date else None
            }
        }


# Create a singleton instance
priority_analyzer_service = PriorityAnalyzerService()