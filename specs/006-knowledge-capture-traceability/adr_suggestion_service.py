"""
ADR Suggestion Service

This service integrates decision detection heuristics with ADR template generation
to suggest Architectural Decision Records when architecturally significant decisions
are detected in development interactions.
"""

from typing import List, Optional, Dict, Any
from pathlib import Path
from datetime import datetime
import logging
from enum import Enum
from .decision_detection_heuristics import DecisionDetectionHeuristics, DecisionCandidate
from .adr_template_generator import ADRTemplateGenerator, ADR


class SuggestionSeverity(Enum):
    """Severity levels for ADR suggestions"""
    LOW = "low"      # Possible decision, low confidence
    MEDIUM = "medium"  # Likely decision, medium confidence
    HIGH = "high"    # Definite decision, high confidence


class ADRSuggestion:
    """Represents a suggested ADR with associated metadata"""

    def __init__(
        self,
        decision_candidate: DecisionCandidate,
        severity: SuggestionSeverity,
        suggestion_timestamp: datetime,
        phr_reference: Optional[str] = None,
        auto_generated_adr: Optional[ADR] = None
    ):
        self.decision_candidate = decision_candidate
        self.severity = severity
        self.suggestion_timestamp = suggestion_timestamp
        self.phr_reference = phr_reference
        self.auto_generated_adr = auto_generated_adr
        self.accepted = False
        self.rejected_reason = None


class ADRSuggestionService:
    """
    Service that monitors development interactions and suggests ADR creation
    when architecturally significant decisions are detected.
    """

    def __init__(
        self,
        adr_generator: ADRTemplateGenerator,
        decision_detector: DecisionDetectionHeuristics,
        min_confidence_threshold: float = 0.6,
        auto_generate_adrs: bool = True
    ):
        self.adr_generator = adr_generator
        self.decision_detector = decision_detector
        self.min_confidence_threshold = min_confidence_threshold
        self.auto_generate_adrs = auto_generate_adrs

        # Store suggestions
        self.suggestions: List[ADRSuggestion] = []

        # Setup logging
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(logging.INFO)

    def suggest_adr_from_text(
        self,
        text: str,
        context_metadata: Optional[Dict[str, Any]] = None,
        phr_reference: Optional[str] = None
    ) -> List[ADRSuggestion]:
        """
        Analyze text for architecturally significant decisions and suggest ADRs

        Args:
            text: Text to analyze for decision points
            context_metadata: Additional metadata about the context
            phr_reference: Reference to the PHR that triggered this suggestion

        Returns:
            List of ADR suggestions
        """
        # Detect potential decisions in the text
        decision_candidates = self.decision_detector.detect_decisions(text)

        suggestions = []
        for candidate in decision_candidates:
            # Determine severity based on confidence score
            if candidate.confidence_score >= 0.8:
                severity = SuggestionSeverity.HIGH
            elif candidate.confidence_score >= 0.6:
                severity = SuggestionSeverity.MEDIUM
            else:
                severity = SuggestionSeverity.LOW

            # Only create suggestions above the threshold if it's a high/medium severity
            if severity in [SuggestionSeverity.HIGH, SuggestionSeverity.MEDIUM]:
                # Optionally auto-generate an ADR template
                auto_generated_adr = None
                if self.auto_generate_adrs and severity != SuggestionSeverity.LOW:
                    auto_generated_adr = self._create_adr_from_candidate(
                        candidate, context_metadata
                    )

                suggestion = ADRSuggestion(
                    decision_candidate=candidate,
                    severity=severity,
                    suggestion_timestamp=datetime.now(),
                    phr_reference=phr_reference,
                    auto_generated_adr=auto_generated_adr
                )

                suggestions.append(suggestion)
                self.suggestions.append(suggestion)

                self.logger.info(
                    f"Suggested ADR for {candidate.category.value} "
                    f"(confidence: {candidate.confidence_score:.2f}): "
                    f"{candidate.text_snippet[:100]}..."
                )

        return suggestions

    def suggest_adr_from_phr(
        self,
        phr_content: Dict[str, Any],
        phr_metadata: Dict[str, Any]
    ) -> List[ADRSuggestion]:
        """
        Analyze a PHR for architecturally significant decisions and suggest ADRs

        Args:
            phr_content: Content of the PHR to analyze
            phr_metadata: Metadata of the PHR

        Returns:
            List of ADR suggestions
        """
        # Combine prompt and response for analysis
        combined_text = f"{phr_content.get('prompt', '')}\n\n{phr_content.get('ai_response', '')}"

        # Add context metadata
        context_metadata = {
            'phr_id': phr_metadata.get('record_id'),
            'timestamp': phr_metadata.get('timestamp'),
            'user_id': phr_metadata.get('user_id'),
            'project_context': phr_metadata.get('project_context'),
            'files_modified': phr_content.get('files_modified', []),
            'code_generated': phr_content.get('code_generated')
        }

        return self.suggest_adr_from_text(
            combined_text,
            context_metadata=context_metadata,
            phr_reference=phr_metadata.get('record_id')
        )

    def _create_adr_from_candidate(
        self,
        candidate: DecisionCandidate,
        context_metadata: Optional[Dict[str, Any]] = None
    ) -> Optional[ADR]:
        """
        Create an ADR template from a decision candidate

        Args:
            candidate: The decision candidate to create an ADR for
            context_metadata: Additional context metadata

        Returns:
            An ADR object or None if creation fails
        """
        try:
            # Create a title based on the decision category and context
            title = f"Architecture Decision: {candidate.category.value.replace('_', ' ').title()}"

            # Extract context from the text snippet
            context = f"Decision identified in development conversation:\n{candidate.text_snippet}"

            # If we have context metadata, enrich the ADR
            authors = []
            deciders = []
            drivers = []
            tags = [candidate.category.value]

            if context_metadata:
                if context_metadata.get('user_id'):
                    authors = [context_metadata['user_id']]

                # Add relevant tags based on context
                project_context = context_metadata.get('project_context', '')
                if project_context:
                    tags.append(project_context.replace(' ', '-'))

                # Add files modified as context
                files = context_metadata.get('files_modified', [])
                if files:
                    drivers.extend([f"Changes to {f}" for f in files[:3]])  # Limit to first 3

            # Create options if possible
            options_considered = self._extract_options_from_text(candidate.text_snippet)

            # Create the ADR
            adr = self.adr_generator.generate_template(
                title=title,
                context=context,
                options_considered=options_considered,
                chosen_solution="TBD - To be decided by the team",
                rationale="This decision was identified as architecturally significant and requires formal documentation and team review.",
                consequences="TBD - Will be determined during ADR review process.",
                authors=authors,
                deciders=deciders,
                drivers=drivers,
                tags=tags
            )

            return adr
        except Exception as e:
            self.logger.error(f"Failed to create ADR from candidate: {e}")
            return None

    def _extract_options_from_text(self, text: str) -> List[Dict[str, Any]]:
        """
        Extract options from text using the same logic as in ADR generator
        """
        import re

        # Look for patterns that indicate options
        option_patterns = [
            r'(?:^|\n)\s*(?:option\s+)?([a-z]|[0-9]+)[\.\)]\s*(.*?)(?=\n\s*(?:option\s+)?[a-z]|[0-9]+\.|\Z)',
            r'(?:^|\n)\s*-\s*([^:\n]+):\s*(.*?)(?=\n\s*-\s*[^:\n]+:|\Z)',
        ]

        options = []

        for pattern in option_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE | re.DOTALL)
            if matches:
                for match in matches:
                    if isinstance(match, tuple):
                        name, desc = match[0], match[1].strip()
                    else:
                        name, desc = f"Option {len(options)+1}", match.strip()

                    options.append({
                        'name': name.title(),
                        'description': desc,
                        'pros': [],
                        'cons': []
                    })

                if options:  # If we found options with this pattern, break
                    break

        return options

    def accept_suggestion(self, suggestion: ADRSuggestion, custom_adr: Optional[ADR] = None) -> Optional[Path]:
        """
        Accept a suggestion and optionally save the ADR

        Args:
            suggestion: The suggestion to accept
            custom_adr: Optional custom ADR to save instead of the auto-generated one

        Returns:
            Path to saved ADR file if saved, None otherwise
        """
        suggestion.accepted = True

        # Use the custom ADR if provided, otherwise use the auto-generated one
        adr_to_save = custom_adr or suggestion.auto_generated_adr

        if adr_to_save:
            try:
                filepath = self.adr_generator.save_adr(adr_to_save)
                self.logger.info(f"Accepted and saved ADR: {filepath}")
                return filepath
            except Exception as e:
                self.logger.error(f"Failed to save accepted ADR: {e}")
                return None

        return None

    def reject_suggestion(self, suggestion: ADRSuggestion, reason: str = ""):
        """
        Reject a suggestion

        Args:
            suggestion: The suggestion to reject
            reason: Reason for rejection
        """
        suggestion.rejected_reason = reason
        self.logger.info(f"Rejected ADR suggestion: {reason}")

    def get_pending_suggestions(self, severity: Optional[SuggestionSeverity] = None) -> List[ADRSuggestion]:
        """
        Get pending ADR suggestions

        Args:
            severity: Optional filter by severity level

        Returns:
            List of pending suggestions
        """
        pending = [s for s in self.suggestions if not s.accepted and not s.rejected_reason]

        if severity:
            pending = [s for s in pending if s.severity == severity]

        return pending

    def get_suggestions_summary(self) -> Dict[str, Any]:
        """
        Get a summary of all suggestions

        Returns:
            Dictionary with summary statistics
        """
        total = len(self.suggestions)
        accepted = len([s for s in self.suggestions if s.accepted])
        rejected = len([s for s in self.suggestions if s.rejected_reason])
        pending = total - accepted - rejected

        by_severity = {
            'high': len([s for s in self.suggestions if s.severity == SuggestionSeverity.HIGH]),
            'medium': len([s for s in self.suggestions if s.severity == SuggestionSeverity.MEDIUM]),
            'low': len([s for s in self.suggestions if s.severity == SuggestionSeverity.LOW])
        }

        return {
            'total_suggestions': total,
            'accepted': accepted,
            'rejected': rejected,
            'pending': pending,
            'by_severity': by_severity
        }


# Integration helper function
def create_integrated_knowledge_capture_service(
    storage_directory: Path,
    user_id: str = "default_user",
    min_adr_confidence: float = 0.6
) -> tuple:
    """
    Create an integrated knowledge capture service with PHR generation and ADR suggestions

    Args:
        storage_directory: Directory for storing PHRs and ADRs
        user_id: User identifier
        min_adr_confidence: Minimum confidence for ADR suggestions

    Returns:
        Tuple of (PHRGeneratorService, ADRTemplateGenerator, ADRSuggestionService)
    """
    from .phr_generator_service import PHRGeneratorService

    # Create PHR generator service
    phr_service = PHRGeneratorService(storage_directory, user_id)
    phr_service.start_async_processing()

    # Create ADR template generator
    adr_generator = ADRTemplateGenerator(storage_directory / "adrs")

    # Create decision detector
    decision_detector = DecisionDetectionHeuristics()

    # Create ADR suggestion service
    adr_suggestion_service = ADRSuggestionService(
        adr_generator=adr_generator,
        decision_detector=decision_detector,
        min_confidence_threshold=min_adr_confidence
    )

    return phr_service, adr_generator, adr_suggestion_service


# Example usage
if __name__ == "__main__":
    import tempfile
    from pathlib import Path

    # Create services in a temporary directory
    with tempfile.TemporaryDirectory() as temp_dir:
        storage_path = Path(temp_dir)

        phr_service, adr_generator, adr_suggestion_service = create_integrated_knowledge_capture_service(
            storage_path,
            user_id="demo_user"
        )

        # Simulate some development conversations that might trigger ADR suggestions
        conversations = [
            {
                "prompt": "We need to decide between PostgreSQL and MongoDB for our data storage solution. PostgreSQL offers ACID compliance while MongoDB provides flexibility.",
                "response": "For your use case with complex relationships and consistency requirements, I recommend PostgreSQL. It has excellent JSON support for flexible schemas while maintaining ACID properties."
            },
            {
                "prompt": "How should we implement user authentication?",
                "response": "JWT tokens with refresh rotation would be the most scalable approach for your distributed system. Consider using OAuth2 for third-party integrations."
            },
            {
                "prompt": "I'm debugging this performance issue",
                "response": "The issue appears to be with the N+1 query problem in your ORM. Consider adding proper select_related or join queries."
            }
        ]

        print("Analyzing conversations for ADR suggestions...")
        print("=" * 60)

        for i, conv in enumerate(conversations):
            print(f"\nConversation {i+1}:")
            print(f"Prompt: {conv['prompt'][:100]}...")
            print(f"Response: {conv['response'][:100]}...")

            # Create a PHR for the conversation
            phr_id = phr_service.capture_interaction(
                prompt=conv['prompt'],
                ai_response=conv['response'],
                project_context="demo_app"
            )

            # Analyze for ADR suggestions
            suggestions = adr_suggestion_service.suggest_adr_from_text(
                f"{conv['prompt']} {conv['response']}",
                phr_reference=phr_id
            )

            print(f"  Found {len(suggestions)} ADR suggestion(s)")

            for j, suggestion in enumerate(suggestions):
                print(f"    Suggestion {j+1}: {suggestion.decision_candidate.category.value}")
                print(f"    Confidence: {suggestion.decision_candidate.confidence_score:.2f}")
                print(f"    Severity: {suggestion.severity.value}")

                if suggestion.auto_generated_adr:
                    print(f"    Auto-generated ADR: {suggestion.auto_generated_adr.title}")

        # Show summary
        summary = adr_suggestion_service.get_suggestions_summary()
        print(f"\nSummary:")
        print(f"  Total suggestions: {summary['total_suggestions']}")
        print(f"  Accepted: {summary['accepted']}")
        print(f"  Rejected: {summary['rejected']}")
        print(f"  Pending: {summary['pending']}")
        print(f"  By severity: {summary['by_severity']}")

        # Clean up
        phr_service.stop_async_processing()