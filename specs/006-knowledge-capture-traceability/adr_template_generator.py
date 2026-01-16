"""
ADR Template Generator

This module generates standardized Architectural Decision Records (ADRs)
with required sections and structure based on established ADR standards.
"""

from datetime import datetime
from typing import Optional, Dict, Any, List
from pathlib import Path
import json
import yaml
from enum import Enum


class DecisionStatus(Enum):
    """Status of the architectural decision"""
    PROPOSED = "proposed"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    SUPERSEDED = "superseded"
    DEPRECATED = "deprecated"


class ADR:
    """
    Architectural Decision Record

    Represents a standardized ADR with all required sections
    """

    def __init__(
        self,
        title: str,
        status: DecisionStatus = DecisionStatus.PROPOSED,
        date: Optional[datetime] = None,
        authors: Optional[List[str]] = None,
        deciders: Optional[List[str]] = None,
        drivers: Optional[List[str]] = None,
        context: str = "",
        options_considered: Optional[List[Dict[str, Any]]] = None,
        chosen_solution: str = "",
        rationale: str = "",
        consequences: str = "",
        implementation_notes: Optional[str] = None,
        links: Optional[List[str]] = None,
        tags: Optional[List[str]] = None
    ):
        self.title = title
        self.status = status
        self.date = date or datetime.now()
        self.authors = authors or []
        self.deciders = deciders or []
        self.drivers = drivers or []  # Forces or drivers that led to the decision
        self.context = context
        self.options_considered = options_considered or []
        self.chosen_solution = chosen_solution
        self.rationale = rationale
        self.consequences = consequences
        self.implementation_notes = implementation_notes
        self.links = links or []
        self.tags = tags or []

        # Auto-generated fields
        self.id = f"adr-{self.date.strftime('%Y%m%d-%H%M%S')}-{abs(hash(title)) % 10000:04d}"

    def to_dict(self) -> Dict[str, Any]:
        """Convert ADR to dictionary for serialization"""
        return {
            "id": self.id,
            "title": self.title,
            "status": self.status.value,
            "date": self.date.isoformat(),
            "authors": self.authors,
            "deciders": self.deciders,
            "drivers": self.drivers,
            "context": self.context,
            "options_considered": self.options_considered,
            "chosen_solution": self.chosen_solution,
            "rationale": self.rationale,
            "consequences": self.consequences,
            "implementation_notes": self.implementation_notes,
            "links": self.links,
            "tags": self.tags
        }

    def to_markdown(self) -> str:
        """Convert ADR to Markdown format with YAML frontmatter"""
        yaml_frontmatter = yaml.dump(self.to_dict(), default_flow_style=False)

        markdown_content = f"""---
{yaml_frontmatter}---
# {self.id}: {self.title}

**Status**: {self.status.value.title()}
**Date**: {self.date.strftime('%Y-%m-%d')}
**Authors**: {', '.join(self.authors) if self.authors else 'TBD'}
**Deciders**: {', '.join(self.deciders) if self.deciders else 'TBD'}

## Context and Problem Statement

{self.context}

## Decision Drivers

{chr(10).join(f'- {driver}' for driver in self.drivers)}

## Considered Options

{self._format_options()}

## Decision Outcome

**Chosen Solution**: {self.chosen_solution}

### Rationale

{self.rationale}

### Consequences

{self.consequences}

## Implementation Notes

{self.implementation_notes or 'TBD'}

## Links

{chr(10).join(f'- {link}' for link in self.links)}
"""
        return markdown_content

    def _format_options(self) -> str:
        """Format the options considered in a readable format"""
        if not self.options_considered:
            return "None documented."

        formatted = []
        for i, option in enumerate(self.options_considered, 1):
            name = option.get('name', f'Option {i}')
            description = option.get('description', 'No description provided.')
            pros = option.get('pros', [])
            cons = option.get('cons', [])

            option_str = f"### {name}\n\n{description}\n\n"

            if pros:
                option_str += "**Pros:**\n" + "".join([f"- {pro}\n" for pro in pros]) + "\n"

            if cons:
                option_str += "**Cons:**\n" + "".join([f"- {con}\n" for con in cons]) + "\n"

            formatted.append(option_str)

        return "".join(formatted)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'ADR':
        """Create an ADR from a dictionary"""
        return cls(
            title=data['title'],
            status=DecisionStatus(data['status']),
            date=datetime.fromisoformat(data['date']),
            authors=data.get('authors', []),
            deciders=data.get('deciders', []),
            drivers=data.get('drivers', []),
            context=data['context'],
            options_considered=data.get('options_considered', []),
            chosen_solution=data['chosen_solution'],
            rationale=data['rationale'],
            consequences=data['consequences'],
            implementation_notes=data.get('implementation_notes'),
            links=data.get('links', []),
            tags=data.get('tags', [])
        )


class ADRTemplateGenerator:
    """
    Generates standardized ADR templates with required sections and structure
    """

    def __init__(self, base_directory: Optional[Path] = None):
        self.base_directory = base_directory or Path("./adrs")

        # Create base directory if it doesn't exist
        if self.base_directory:
            self.base_directory.mkdir(parents=True, exist_ok=True)

    def generate_template(
        self,
        title: str,
        context: str = "",
        options_considered: Optional[List[Dict[str, Any]]] = None,
        chosen_solution: str = "",
        rationale: str = "",
        consequences: str = "",
        status: DecisionStatus = DecisionStatus.PROPOSED,
        authors: Optional[List[str]] = None,
        deciders: Optional[List[str]] = None,
        drivers: Optional[List[str]] = None,
        implementation_notes: Optional[str] = None,
        links: Optional[List[str]] = None,
        tags: Optional[List[str]] = None
    ) -> ADR:
        """
        Generate a new ADR with the provided information

        Args:
            title: Title of the architectural decision
            context: Background context for the decision
            options_considered: List of options evaluated
            chosen_solution: The solution that was chosen
            rationale: Reasoning behind the chosen solution
            consequences: Expected consequences of the decision
            status: Status of the decision
            authors: Authors of the ADR
            deciders: People who made the decision
            drivers: Factors that drove the decision
            implementation_notes: Implementation details
            links: Related links or references
            tags: Tags for categorization

        Returns:
            An ADR object
        """
        adr = ADR(
            title=title,
            status=status,
            context=context,
            options_considered=options_considered or [],
            chosen_solution=chosen_solution,
            rationale=rationale,
            consequences=consequences,
            authors=authors or [],
            deciders=deciders or [],
            drivers=drivers or [],
            implementation_notes=implementation_notes,
            links=links or [],
            tags=tags or []
        )

        return adr

    def generate_from_phr_content(self, phr_content: Dict[str, Any]) -> Optional[ADR]:
        """
        Generate an ADR template from PHR content that indicates a decision was made

        Args:
            phr_content: Dictionary containing PHR content that may indicate a decision

        Returns:
            An ADR object if a decision can be identified, None otherwise
        """
        decision_made = phr_content.get('decision_made')
        if not decision_made:
            return None

        prompt = phr_content.get('prompt', '')
        ai_response = phr_content.get('ai_response', '')
        context_data = phr_content.get('context', {})

        # Try to extract decision information from the PHR content
        title = f"Architecture Decision: {decision_made[:50]}..." if len(decision_made) > 50 else f"Architecture Decision: {decision_made}"

        # Extract context from prompt/response
        context = f"Decision prompted by: {prompt}\n\nAI Recommendation: {ai_response}"

        # Extract options if available in context
        options_considered = context_data.get('alternatives_considered', [])
        if options_considered:
            formatted_options = []
            for i, option in enumerate(options_considered):
                formatted_options.append({
                    'name': f'Option {i+1}',
                    'description': str(option),
                    'pros': [],
                    'cons': []
                })
        else:
            # If we can extract options from the AI response
            formatted_options = self._extract_options_from_text(ai_response)

        chosen_solution = context_data.get('chosen_option', decision_made)
        rationale = f"Selected based on evaluation of available alternatives and project requirements."
        consequences = "TBD - To be evaluated during implementation."

        return self.generate_template(
            title=title,
            context=context,
            options_considered=formatted_options,
            chosen_solution=chosen_solution,
            rationale=rationale,
            consequences=consequences,
            tags=['auto-generated', 'architectural-decision']
        )

    def _extract_options_from_text(self, text: str) -> List[Dict[str, Any]]:
        """
        Extract options from text using heuristics

        Args:
            text: Text to extract options from

        Returns:
            List of options in the expected format
        """
        import re

        # Look for patterns that indicate options (Option A, Option B, etc.)
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

    def save_adr(self, adr: ADR, directory: Optional[Path] = None) -> Path:
        """
        Save an ADR to file in the specified directory

        Args:
            adr: ADR object to save
            directory: Directory to save to (defaults to base directory)

        Returns:
            Path to the saved file
        """
        save_dir = directory or self.base_directory

        # Create directory structure: adrs/YYYY-MM-DD/
        date_dir = save_dir / adr.date.strftime("%Y-%m-%d")
        date_dir.mkdir(parents=True, exist_ok=True)

        # Create filename
        safe_title = "".join(c for c in adr.title if c.isalnum() or c in (' ', '-', '_')).rstrip()
        safe_title = safe_title.replace(' ', '_').lower()[:50]  # Limit length
        filename = f"{adr.id}_{safe_title}.md"
        filepath = date_dir / filename

        # Write the ADR content
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(adr.to_markdown())

        return filepath


# Example usage
if __name__ == "__main__":
    # Create an ADR template generator
    generator = ADRTemplateGenerator()

    # Example: Generate an ADR for a database choice decision
    adr = generator.generate_template(
        title="Choose Database Technology",
        context="Our application requires a database solution that can handle both relational data and flexible schemas for future growth. We need to evaluate SQL vs NoSQL options.",
        options_considered=[
            {
                'name': 'PostgreSQL',
                'description': 'Robust SQL database with JSON support',
                'pros': ['ACID compliance', 'Strong consistency', 'JSON support for flexible schemas', 'Excellent tooling'],
                'cons': ['Complexity for simple use cases', 'Potentially overkill for small datasets']
            },
            {
                'name': 'MongoDB',
                'description': 'Flexible NoSQL document database',
                'pros': ['Schema flexibility', 'Horizontal scaling', 'Agile development'],
                'cons': ['Eventual consistency', 'Larger memory footprint', 'No ACID transactions across documents']
            },
            {
                'name': 'SQLite',
                'description': 'Lightweight embedded SQL database',
                'pros': ['Zero configuration', 'Low resource usage', 'Simple deployment'],
                'cons': ['Not suitable for high concurrency', 'Limited scaling options', 'No network access']
            }
        ],
        chosen_solution="PostgreSQL",
        rationale="We chose PostgreSQL because it provides the best balance of reliability, feature richness, and scalability for our anticipated growth. Its JSON support allows us to maintain flexibility for evolving schema needs while ensuring data integrity through ACID compliance.",
        consequences="PostgreSQL will require more initial setup and administration compared to simpler solutions. However, it provides a solid foundation for long-term growth and reliability.",
        authors=["Team Lead", "Principal Engineer"],
        deciders=["CTO", "Engineering Manager"],
        drivers=["Reliability requirements", "Future scalability", "Team expertise"],
        tags=["database", "persistence", "backend"]
    )

    # Save the ADR
    filepath = generator.save_adr(adr)
    print(f"ADR saved to: {filepath}")

    # Print the ADR content
    print("\nADR Content:")
    print("="*50)
    print(adr.to_markdown())