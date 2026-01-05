"""
Category Detection Service for Task Categorization

This module provides functionality to automatically detect and suggest categories
for tasks based on their title and description.
"""
import re
from typing import List, Dict, Optional
from enum import Enum



class Category(Enum):
    WORK = "work"
    PERSONAL = "personal"
    HEALTH = "health"
    FINANCE = "finance"
    EDUCATION = "education"
    SHOPPING = "shopping"
    HOME = "home"
    TRAVEL = "travel"
    ENTERTAINMENT = "entertainment"
    MEETING = "meeting"
    APPOINTMENT = "appointment"
    REMINDER = "reminder"
    OTHER = "other"


class CategoryDetectorService:
    """
    Service class to handle automatic category detection for tasks.
    """

    def __init__(self):
        # Define category patterns with keywords and regex patterns
        self.category_patterns = {
            Category.WORK: {
                "keywords": [
                    "meeting", "project", "report", "presentation", "deadline",
                    "work", "office", "client", "colleague", "boss", "team",
                    "conference", "presentation", "email", "task", "assignment",
                    "work", "professional", "career", "job", "career", "business"
                ],
                "patterns": [
                    r"\b(?:work|project|report|meeting|presentation|deadline|client|team|boss)\b",
                    r"\b(?:conference|presentation|email|task|assignment|professional)\b",
                    r"\b(?:career|job|business|office)\b"
                ]
            },
            Category.PERSONAL: {
                "keywords": [
                    "personal", "private", "family", "friend", "birthday",
                    "anniversary", "appointment", "doctor", "dentist", "lunch",
                    "dinner", "dinner", "hangout", "self", "me", "myself"
                ],
                "patterns": [
                    r"\b(?:personal|private|family|friend|birthday|anniversary)\b",
                    r"\b(?:doctor|dentist|lunch|dinner|hangout|self|me|myself)\b"
                ]
            },
            Category.HEALTH: {
                "keywords": [
                    "doctor", "dentist", "appointment", "medication", "exercise",
                    "workout", "gym", "yoga", "meditation", "therapy", "checkup",
                    "health", "wellness", "diet", "nutrition", "appointment"
                ],
                "patterns": [
                    r"\b(?:doctor|dentist|medication|exercise|workout|gym)\b",
                    r"\b(?:yoga|meditation|therapy|checkup|health|wellness)\b",
                    r"\b(?:diet|nutrition)\b"
                ]
            },
            Category.FINANCE: {
                "keywords": [
                    "pay", "bill", "payment", "bank", "account", "tax",
                    "budget", "expense", "income", "investment", "loan",
                    "financial", "money", "invoice", "receipt", "expense"
                ],
                "patterns": [
                    r"\b(?:pay|bill|payment|bank|account|tax)\b",
                    r"\b(?:budget|expense|income|investment|loan|financial)\b",
                    r"\b(?:money|invoice|receipt)\b"
                ]
            },
            Category.EDUCATION: {
                "keywords": [
                    "study", "learn", "course", "class", "lecture", "exam",
                    "test", "homework", "assignment", "school", "university",
                    "college", "education", "research", "book", "reading",
                    "training", "tutorial", "skill"
                ],
                "patterns": [
                    r"\b(?:study|learn|course|class|lecture|exam|test)\b",
                    r"\b(?:homework|assignment|school|university|college)\b",
                    r"\b(?:education|research|book|reading|training)\b",
                    r"\b(?:tutorial|skill)\b"
                ]
            },
            Category.SHOPPING: {
                "keywords": [
                    "buy", "purchase", "shop", "grocery", "store", "market",
                    "buy", "order", "delivery", "shopping", "list", "cart",
                    "amazon", "online", "retail", "buying", "purchase"
                ],
                "patterns": [
                    r"\b(?:buy|purchase|shop|grocery|store|market)\b",
                    r"\b(?:order|delivery|shopping|list|cart)\b",
                    r"\b(?:amazon|online|retail|buying)\b"
                ]
            },
            Category.HOME: {
                "keywords": [
                    "clean", "house", "home", "chores", "laundry", "wash",
                    "repair", "fix", "maintenance", "garden", "yard", "yardwork",
                    "renovation", "decor", "furniture", "cleaning", "tidy"
                ],
                "patterns": [
                    r"\b(?:clean|house|home|chores|laundry|wash)\b",
                    r"\b(?:repair|fix|maintenance|garden|yard|yardwork)\b",
                    r"\b(?:renovation|decor|furniture|cleaning|tidy)\b"
                ]
            },
            Category.TRAVEL: {
                "keywords": [
                    "travel", "trip", "vacation", "flight", "hotel", "booking",
                    "reservation", "destination", "journey", "explore", "visit",
                    "sightseeing", "tour", "adventure", "getaway", "plane",
                    "train", "bus", "car", "rental", "passport", "visa"
                ],
                "patterns": [
                    r"\b(?:travel|trip|vacation|flight|hotel|booking)\b",
                    r"\b(?:reservation|destination|journey|explore|visit)\b",
                    r"\b(?:sightseeing|tour|adventure|getaway)\b",
                    r"\b(?:plane|train|bus|car|rental|passport|visa)\b"
                ]
            },
            Category.ENTERTAINMENT: {
                "keywords": [
                    "movie", "cinema", "film", "show", "concert", "music",
                    "game", "play", "theater", "entertainment", "fun", "party",
                    "event", "concert", "sports", "match", "game", "watch",
                    "stream", "netflix", "hulu", "hobby", "leisure"
                ],
                "patterns": [
                    r"\b(?:movie|cinema|film|show|concert|music)\b",
                    r"\b(?:game|play|theater|entertainment|fun|party)\b",
                    r"\b(?:event|sports|match|watch|stream)\b",
                    r"\b(?:netflix|hulu|hobby|leisure)\b"
                ]
            },
            Category.MEETING: {
                "keywords": [
                    "meeting", "conference", "call", "zoom", "teams", "skype",
                    "discuss", "talk", "presentation", "agenda", "schedule",
                    "appointment", "appointment", "sync", "catchup", "review"
                ],
                "patterns": [
                    r"\b(?:meeting|conference|call|zoom|teams|skype)\b",
                    r"\b(?:discuss|talk|presentation|agenda|schedule)\b",
                    r"\b(?:appointment|sync|catchup|review)\b"
                ]
            },
            Category.APPOINTMENT: {
                "keywords": [
                    "appointment", "appointment", "scheduled", "booked", "reserved",
                    "time", "slot", "calendar", "schedule", "date", "time",
                    "reserved", "booked", "confirmed", "booking"
                ],
                "patterns": [
                    r"\b(?:appointment|scheduled|booked|reserved|time|slot)\b",
                    r"\b(?:calendar|schedule|date|time|confirmed|booking)\b"
                ]
            },
            Category.REMINDER: {
                "keywords": [
                    "remember", "remind", "reminder", "recall", "think",
                    "note", "note", "memo", "remember", "don't forget",
                    "recap", "summary", "reminder"
                ],
                "patterns": [
                    r"\b(?:remember|remind|reminder|recall|think)\b",
                    r"\b(?:note|memo|don't forget|recap|summary)\b"
                ]
            }
        }

    def detect_category(self, title: str, description: Optional[str] = None) -> str:
        """
        Detect the most likely category for a task based on its title and description.

        Args:
            title (str): The task title
            description (Optional[str]): The task description

        Returns:
            str: The detected category
        """
        if not title:
            return Category.OTHER.value

        # Combine title and description for analysis
        text = f"{title} {description or ''}".lower()

        # Score each category based on matches
        category_scores = {}
        for category, patterns in self.category_patterns.items():
            score = 0

            # Count keyword matches
            for keyword in patterns["keywords"]:
                if keyword in text:
                    score += 1

            # Count pattern matches
            for pattern in patterns["patterns"]:
                matches = re.findall(pattern, text, re.IGNORECASE)
                score += len(matches)

            category_scores[category.value] = score

        # Return the category with the highest score
        if category_scores:
            best_category = max(category_scores, key=category_scores.get)
            # Only return the category if it has a score > 0, otherwise return 'other'
            if category_scores[best_category] > 0:
                return best_category

        return Category.OTHER.value

    def suggest_categories(self, title: str, description: Optional[str] = None, top_n: int = 3) -> List[Dict[str, any]]:
        """
        Suggest multiple categories with their confidence scores.

        Args:
            title (str): The task title
            description (Optional[str]): The task description
            top_n (int): Number of top categories to return

        Returns:
            List[Dict[str, any]]: List of categories with their scores
        """
        if not title:
            return [{"category": Category.OTHER.value, "score": 1.0}]

        # Combine title and description for analysis
        text = f"{title} {description or ''}".lower()

        # Score each category based on matches
        category_scores = {}
        for category, patterns in self.category_patterns.items():
            score = 0

            # Count keyword matches
            for keyword in patterns["keywords"]:
                if keyword in text:
                    score += 1

            # Count pattern matches
            for pattern in patterns["patterns"]:
                matches = re.findall(pattern, text, re.IGNORECASE)
                score += len(matches)

            category_scores[category.value] = score

        # Sort categories by score and return top N
        sorted_categories = sorted(category_scores.items(), key=lambda x: x[1], reverse=True)
        total_score = sum(score for _, score in sorted_categories)

        # Calculate confidence scores and return top N
        result = []
        for category, score in sorted_categories[:top_n]:
            confidence = score / total_score if total_score > 0 else 0
            result.append({
                "category": category,
                "score": score,
                "confidence": round(confidence, 2)
            })

        return result if result else [{"category": Category.OTHER.value, "score": 0, "confidence": 0.0}]

    def get_all_categories(self) -> List[str]:
        """
        Get all available categories.

        Returns:
            List[str]: List of all category names
        """
        return [category.value for category in Category]


# Create a singleton instance
category_detector_service = CategoryDetectorService()