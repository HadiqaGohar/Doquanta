"""
Celery configuration for background job processing
"""
import os
from celery import Celery
from celery.schedules import crontab


# Get Redis URL from environment or use default
redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# Create Celery app instance
celery_app = Celery("todo_backend")

# Celery configuration
celery_app.config_from_object({
    'broker_url': redis_url,
    'result_backend': redis_url,
    'result_expires': 3600,
    'task_serializer': 'json',
    'accept_content': ['json'],
    'result_serializer': 'json',
    'timezone': 'UTC',
    'enable_utc': True,
    'beat_schedule': {
        # Check for reminders every minute
        'check-reminders': {
            'task': 'src.tasks.background.schedule_reminder_check',
            'schedule': 60.0,  # Every 60 seconds
        },
    },
    'imports': (
        'src.tasks.background',
    )
})

if __name__ == '__main__':
    celery_app.start()