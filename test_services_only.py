#!/usr/bin/env python3
"""
Simple test for the enhanced services without requiring the full backend setup.
"""


import sys
import os

# Add the backend directory to the path so we can import modules
sys.path.append(os.path.join(os.path.dirname(__file__), 'todo-backend'))

from src.services.date_time_parser import date_time_parser_service
from src.services.category_detector import category_detector_service
from src.services.priority_analyzer import priority_analyzer_service


def test_date_time_parsing():
    """Test the date/time parsing functionality."""
    print("Testing Date/Time Parsing...")

    test_cases = [
        "tomorrow",
        "next Monday",
        "in 2 hours",
        "March 15th",
        "2024-03-15",
        "today",
        "next week",
        "in 3 days"
    ]

    for case in test_cases:
        parsed = date_time_parser_service.parse_datetime(case)
        print(f"  '{case}' -> {parsed}")

    print("Date/Time parsing tests completed.\n")


def test_category_detection():
    """Test the category detection functionality."""
    print("Testing Category Detection...")

    test_cases = [
        ("Finish the project report", "work"),
        ("Buy groceries for dinner", "shopping"),
        ("Doctor appointment", "health"),
        ("Pay electricity bill", "finance"),
        ("Study for exam", "education"),
        ("Watch movie tonight", "entertainment"),
        ("Call mom", "personal")
    ]

    for title, expected_category in test_cases:
        detected = category_detector_service.detect_category(title)
        suggested = category_detector_service.suggest_categories(title, top_n=2)
        print(f"  '{title}' -> detected: {detected}, expected: {expected_category}, suggestions: {suggested}")

    print("Category detection tests completed.\n")


def test_priority_analysis():
    """Test the priority analysis functionality."""
    print("Testing Priority Analysis...")

    test_cases = [
        ("URGENT: Submit the report ASAP", "high"),
        ("Call mom later this week", "medium"),
        ("Maybe organize desk someday", "low")
    ]

    for title, expected_priority in test_cases:
        priority, confidence = priority_analyzer_service.analyze_priority(title)
        analysis = priority_analyzer_service.suggest_priority_with_reasoning(title)
        print(f"  '{title}' -> priority: {priority} (confidence: {confidence:.2f}), expected: {expected_priority}")
        print(f"    Reasoning: {analysis['reasoning']}")

    print("Priority analysis tests completed.\n")


def main():
    """Run all tests."""
    print("Starting tests for enhanced chatbot services...\n")

    test_date_time_parsing()
    test_category_detection()
    test_priority_analysis()

    print("All service tests completed successfully!")


if __name__ == "__main__":
    main()