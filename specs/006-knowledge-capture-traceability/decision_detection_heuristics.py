"""
Decision Detection Heuristics

This module implements algorithms to identify architecturally significant decisions
in development conversations and code interactions.
"""

from typing import List, Tuple, Dict, Any, Optional
from enum import Enum
import re
from dataclasses import dataclass


class DecisionCategory(Enum):
    """Categories of architecturally significant decisions"""
    DATABASE_CHOICE = "database_choice"
    AUTHENTICATION_METHOD = "authentication_method"
    DEPLOYMENT_STRATEGY = "deployment_strategy"
    TECH_STACK_SELECTION = "tech_stack_selection"
    DATA_ARCHITECTURE = "data_architecture"
    SECURITY_IMPLEMENTATION = "security_implementation"
    SCALABILITY_PATTERN = "scalability_pattern"
    MONITORING_STRATEGY = "monitoring_strategy"
    COMMUNICATION_PROTOCOL = "communication_protocol"
    OTHER_ARCHITECTURAL = "other_architectural"


@dataclass
class DecisionCandidate:
    """Represents a potential decision point identified by heuristics"""
    text_snippet: str
    category: DecisionCategory
    confidence_score: float  # 0.0 to 1.0
    reason: str
    context_keywords: List[str]


class DecisionDetectionHeuristics:
    """
    Implements heuristics to detect architecturally significant decisions
    in text (prompts, responses, code comments, etc.)
    """

    def __init__(self):
        # Define patterns that indicate architecturally significant decisions
        self.architectural_keywords = {
            DecisionCategory.DATABASE_CHOICE: [
                r'database.*choice', r'choose.*database', r'which.*database', r'postgresql.*vs.*mysql',
                r'sql.*vs.*nosql', r'orm.*selection', r'data.*storage.*solution'
            ],
            DecisionCategory.AUTHENTICATION_METHOD: [
                r'authentication.*method', r'login.*system', r'jwt.*vs.*sessions',
                r'oauth', r'sso.*implementation', r'user.*management.*strategy'
            ],
            DecisionCategory.DEPLOYMENT_STRATEGY: [
                r'deployment.*strategy', r'kubernetes', r'docker.*orchestration',
                r'ci/cd.*pipeline', r'cloud.*provider', r'aws.*vs.*azure', r'container.*strategy'
            ],
            DecisionCategory.TECH_STACK_SELECTION: [
                r'tech.*stack', r'framework.*choice', r'language.*selection',
                r'react.*vs.*vue', r'node.*vs.*python', r'frontend.*backend.*choice'
            ],
            DecisionCategory.DATA_ARCHITECTURE: [
                r'microservices.*vs.*monolith', r'event.*sourcing', r'cqrs',
                r'message.*queue', r'pub/sub', r'api.*design.*pattern', r'graphql.*vs.*rest'
            ],
            DecisionCategory.SECURITY_IMPLEMENTATION: [
                r'security.*consideration', r'encryption.*strategy', r'vulnerability.*mitigation',
                r'penetration.*testing', r'compliance.*requirement', r'audit.*trail'
            ],
            DecisionCategory.SCALABILITY_PATTERN: [
                r'load.*balancing', r'horizontal.*scaling', r'caching.*strategy',
                r'performance.*optimization', r'concurrent.*processing', r'rate.*limiting'
            ],
            DecisionCategory.MONITORING_STRATEGY: [
                r'logging.*strategy', r'monitoring.*solution', r'observability.*tool',
                r'apm.*solution', r'alerting.*system', r'health.*check'
            ],
            DecisionCategory.COMMUNICATION_PROTOCOL: [
                r'protocol.*choice', r'http.*vs.*grpc', r'websocket', r'messaging.*protocol',
                r'rpc.*framework', r'inter.*service.*communication'
            ],
            DecisionCategory.OTHER_ARCHITECTURAL: [
                r'architecture.*decision', r'architectural.*choice', r'design.*decision',
                r'system.*design', r'high.*level.*design', r'tradeoff.*analysis',
                r'alternative.*considered', r'options.*evaluated', r'pros.*and.*cons'
            ]
        }

        # Phrases that indicate decision-making context
        self.decision_context_indicators = [
            r'should we', r'we should', r'we could', r'alternatively',
            r'on the other hand', r'compared to', r'instead of',
            r'option a', r'option b', r'approach 1', r'approach 2',
            r'first approach', r'second approach', r'another option',
            r'based on', r'considering', r'given that', r'taking into account',
            r'after evaluating', r'following analysis', r'decided to',
            r'we chose', r'the decision was', r'decision factors'
        ]

        # Confidence boosters - phrases that increase confidence in decision detection
        self.confidence_boosters = [
            r'after careful consideration',
            r'following extensive research',
            r'based on performance requirements',
            r'for security reasons',
            r'to improve scalability',
            r'to ensure maintainability',
            r'according to best practices',
            r'as recommended by industry standards'
        ]

    def detect_decisions(self, text: str) -> List[DecisionCandidate]:
        """
        Detect potential architecturally significant decisions in the given text

        Args:
            text: Text to analyze for decision points

        Returns:
            List of DecisionCandidate objects representing potential decisions
        """
        candidates = []

        # Normalize the text
        normalized_text = text.lower()

        # Check for each category of decisions
        for category, patterns in self.architectural_keywords.items():
            for pattern in patterns:
                matches = re.finditer(pattern, normalized_text, re.IGNORECASE)
                for match in matches:
                    # Extract context around the match
                    start = max(0, match.start() - 100)
                    end = min(len(text), match.end() + 100)
                    context = text[start:end]

                    # Calculate confidence score
                    confidence = self._calculate_confidence(text, context, category)

                    # Check if this is in a decision-making context
                    if self._has_decision_context(context):
                        candidate = DecisionCandidate(
                            text_snippet=context,
                            category=category,
                            confidence_score=confidence,
                            reason=f"Matched pattern '{pattern}' in {category.value}",
                            context_keywords=self._extract_context_keywords(context)
                        )
                        candidates.append(candidate)

        # Sort by confidence score (highest first)
        candidates.sort(key=lambda x: x.confidence_score, reverse=True)

        # Remove duplicates
        candidates = self._remove_duplicates(candidates)

        return candidates

    def _calculate_confidence(self, full_text: str, context: str, category: DecisionCategory) -> float:
        """
        Calculate confidence score for a potential decision

        Args:
            full_text: Full text being analyzed
            context: Context around the matched pattern
            category: Category of the potential decision

        Returns:
            Confidence score between 0.0 and 1.0
        """
        base_score = 0.5  # Base score for any match

        # Boost confidence if decision context indicators are present
        for indicator in self.decision_context_indicators:
            if re.search(indicator, context, re.IGNORECASE):
                base_score += 0.2
                break

        # Boost confidence if confidence boosters are present
        for booster in self.confidence_boosters:
            if re.search(booster, context, re.IGNORECASE):
                base_score += 0.15
                break

        # Adjust for category importance
        if category in [
            DecisionCategory.DATABASE_CHOICE,
            DecisionCategory.AUTHENTICATION_METHOD,
            DecisionCategory.DATA_ARCHITECTURE,
            DecisionCategory.SECURITY_IMPLEMENTATION
        ]:
            base_score += 0.1

        # Cap at 1.0
        return min(base_score, 1.0)

    def _has_decision_context(self, text: str) -> bool:
        """
        Check if the text contains decision-making context indicators

        Args:
            text: Text to check for decision context

        Returns:
            True if decision context is detected, False otherwise
        """
        for indicator in self.decision_context_indicators:
            if re.search(indicator, text, re.IGNORECASE):
                return True
        return False

    def _extract_context_keywords(self, text: str) -> List[str]:
        """
        Extract relevant keywords from the text that provide context

        Args:
            text: Text to extract keywords from

        Returns:
            List of relevant keywords
        """
        # Simple keyword extraction - could be enhanced with NLP techniques
        words = re.findall(r'\b[a-zA-Z]{4,}\b', text.lower())
        # Remove common words and return unique keywords
        common_words = {'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'the', 'that', 'have', 'was', 'with', 'use', 'this', 'they', 'she', 'will', 'one', 'have', 'from', 'had', 'were', 'been', 'has', 'also', 'would', 'more', 'about', 'after', 'before', 'between', 'into', 'through', 'during', 'until', 'against', 'among', 'throughout', 'despite', 'toward', 'upon', 'within', 'without', 'through', 'whether', 'across', 'behind', 'beyond', 'except', 'excepting', 'excluding', 'failing', 'following', 'given', 'including', 'inside', 'like', 'minus', 'onto', 'outside', 'over', 'pace', 'per', 'plus', 'regarding', 'round', 'save', 'since', 'than', 'times', 'under', 'up', 'upon', 'versus', 'via', 'with', 'within', 'without'}

        keywords = [word for word in set(words) if word not in common_words and len(word) > 3]
        return keywords[:10]  # Limit to top 10 keywords

    def _remove_duplicates(self, candidates: List[DecisionCandidate]) -> List[DecisionCandidate]:
        """
        Remove duplicate decision candidates based on text similarity

        Args:
            candidates: List of decision candidates to deduplicate

        Returns:
            Deduplicated list of decision candidates
        """
        if not candidates:
            return []

        unique_candidates = [candidates[0]]

        for candidate in candidates[1:]:
            is_duplicate = False
            for unique_candidate in unique_candidates:
                # Simple overlap check - could be enhanced with more sophisticated similarity
                if self._texts_overlap(candidate.text_snippet, unique_candidate.text_snippet):
                    # Keep the one with higher confidence
                    if candidate.confidence_score > unique_candidate.confidence_score:
                        unique_candidates.remove(unique_candidate)
                        unique_candidates.append(candidate)
                    is_duplicate = True
                    break

            if not is_duplicate:
                unique_candidates.append(candidate)

        return unique_candidates

    def _texts_overlap(self, text1: str, text2: str) -> bool:
        """
        Check if two texts have significant overlap

        Args:
            text1: First text
            text2: Second text

        Returns:
            True if texts overlap significantly, False otherwise
        """
        # Convert to sets of words for comparison
        words1 = set(re.findall(r'\b\w{4,}\b', text1.lower()))
        words2 = set(re.findall(r'\b\w{4,}\b', text2.lower()))

        if not words1 or not words2:
            return False

        # Calculate Jaccard similarity
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        similarity = len(intersection) / len(union)

        # Consider texts overlapping if similarity is above threshold
        return similarity > 0.3


# Example usage and testing
if __name__ == "__main__":
    detector = DecisionDetectionHeuristics()

    # Test texts
    test_texts = [
        "We need to decide between PostgreSQL and MongoDB for our data storage solution. PostgreSQL offers ACID compliance while MongoDB provides flexibility.",
        "After careful consideration and performance testing, we decided to use JWT tokens for authentication instead of traditional sessions.",
        "The team evaluated multiple deployment strategies and chose Kubernetes for orchestration due to its scalability features.",
        "I'm just asking for help with a simple bug fix, nothing architectural here.",
        "Should we use React or Vue for the frontend? React has a larger ecosystem but Vue might be easier to learn."
    ]

    for i, text in enumerate(test_texts):
        print(f"\nTest {i+1}: {text[:50]}...")
        candidates = detector.detect_decisions(text)
        print(f"Detected {len(candidates)} decision{'s' if len(candidates) != 1 else ''}:")
        for candidate in candidates:
            print(f"  - {candidate.category.value}: {candidate.confidence_score:.2f} ({candidate.reason})")