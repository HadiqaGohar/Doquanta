"""
Date and Time Parser Service for Natural Language Processing

This module provides functionality to parse natural language date/time expressions
into ISO format datetime objects for task scheduling and reminders.
"""
import re
from datetime import datetime, timedelta
from typing import Optional, Union
import parsedatetime
from dateutil import parser as dateutil_parser
from dateutil.parser import ParserError
import pytz



class DateTimeParserService:
    """
    Service class to handle natural language date/time parsing for tasks and reminders.
    """

    def __init__(self):
        self.cal = parsedatetime.Calendar()
        self.timezone = pytz.timezone('UTC')  # Default to UTC, can be configured per user

    def parse_datetime(self, text: str) -> Optional[datetime]:
        """
        Parse a natural language string into a datetime object.

        Args:
            text (str): Natural language date/time string (e.g., "tomorrow", "next Monday", "in 2 hours", "March 15th")

        Returns:
            Optional[datetime]: Parsed datetime object or None if parsing fails
        """
        if not text or not isinstance(text, str):
            return None

        text = text.strip()
        if not text:
            return None

        # Try direct parsing first (ISO format, common formats)
        parsed_dt = self._try_direct_parsing(text)
        if parsed_dt:
            return parsed_dt

        # Try parsedatetime for natural language
        parsed_dt = self._try_parsedatetime_parsing(text)
        if parsed_dt:
            return parsed_dt

        # Try common relative expressions
        parsed_dt = self._try_relative_parsing(text)
        if parsed_dt:
            return parsed_dt

        return None

    def _try_direct_parsing(self, text: str) -> Optional[datetime]:
        """
        Try to parse the text using dateutil.parser which handles ISO formats and common formats.
        """
        try:
            # Handle ISO format and other standard formats
            dt = dateutil_parser.parse(text)
            # Ensure timezone awareness
            if dt.tzinfo is None:
                dt = self.timezone.localize(dt)
            return dt
        except (ParserError, ValueError, OverflowError):
            return None

    def _try_parsedatetime_parsing(self, text: str) -> Optional[datetime]:
        """
        Use parsedatetime library to parse natural language expressions.
        """
        try:
            time_struct, parse_status = self.cal.parse(text)
            if parse_status != 0:  # 0 means no parsing was done
                return datetime(*time_struct[:6]).replace(tzinfo=self.timezone)
        except Exception:
            pass
        return None

    def _try_relative_parsing(self, text: str) -> Optional[datetime]:
        """
        Handle common relative time expressions that parsedatetime might miss.
        """
        text_lower = text.lower().strip()
        now = datetime.now(self.timezone)

        # Handle "today" variations
        if 'today' in text_lower:
            return now.replace(hour=23, minute=59, second=59, microsecond=999999)

        # Handle "tomorrow" variations
        if 'tomorrow' in text_lower:
            tomorrow = now + timedelta(days=1)
            return tomorrow.replace(hour=23, minute=59, second=59, microsecond=999999)

        # Handle "in X hours/days/weeks" patterns
        time_match = re.search(r'in\s+(\d+)\s+(hour|day|week|month|year)s?', text_lower)
        if time_match:
            amount = int(time_match.group(1))
            unit = time_match.group(2)

            if 'hour' in unit:
                return now + timedelta(hours=amount)
            elif 'day' in unit:
                return now + timedelta(days=amount)
            elif 'week' in unit:
                return now + timedelta(weeks=amount)
            elif 'month' in unit:  # Approximate month as 30 days
                return now + timedelta(days=amount * 30)
            elif 'year' in unit:  # Approximate year as 365 days
                return now + timedelta(days=amount * 365)

        # Handle "X hours/days/weeks from now" patterns
        from_now_match = re.search(r'(\d+)\s+(hour|day|week|month|year)s?\s+from\s+now', text_lower)
        if from_now_match:
            amount = int(from_now_match.group(1))
            unit = from_now_match.group(2)

            if 'hour' in unit:
                return now + timedelta(hours=amount)
            elif 'day' in unit:
                return now + timedelta(days=amount)
            elif 'week' in unit:
                return now + timedelta(weeks=amount)
            elif 'month' in unit:  # Approximate month as 30 days
                return now + timedelta(days=amount * 30)
            elif 'year' in unit:  # Approximate year as 365 days
                return now + timedelta(days=amount * 365)

        return None

    def parse_recurrence_pattern(self, text: str) -> Optional[dict]:
        """
        Parse recurrence pattern from natural language.

        Args:
            text (str): Natural language recurrence pattern (e.g., "every day", "weekly", "monthly")

        Returns:
            Optional[dict]: Dictionary with recurrence parameters or None if parsing fails
        """
        if not text or not isinstance(text, str):
            return None

        text_lower = text.lower().strip()

        # Define recurrence patterns
        patterns = {
            'daily': [r'every\s+day', r'daily', r'each\s+day'],
            'weekly': [r'every\s+week', r'weekly', r'each\s+week', r'every\s+monday', r'every\s+tuesday',
                      r'every\s+wednesday', r'every\s+thursday', r'every\s+friday',
                      r'every\s+saturday', r'every\s+sunday'],
            'monthly': [r'every\s+month', r'monthly', r'each\s+month'],
            'yearly': [r'every\s+year', r'yearly', r'each\s+year']
        }

        for pattern_type, regex_list in patterns.items():
            for regex in regex_list:
                if re.search(regex, text_lower):
                    return {
                        'pattern': pattern_type,
                        'interval': 1
                    }

        # Handle patterns like "every 2 days", "every 3 weeks", etc.
        interval_match = re.search(r'every\s+(\d+)\s+(day|week|month|year)', text_lower)
        if interval_match:
            interval = int(interval_match.group(1))
            unit = interval_match.group(2)

            unit_mapping = {
                'day': 'daily',
                'week': 'weekly',
                'month': 'monthly',
                'year': 'yearly'
            }

            return {
                'pattern': unit_mapping.get(unit, 'daily'),
                'interval': interval
            }

        return None


# Create a singleton instance
date_time_parser_service = DateTimeParserService()