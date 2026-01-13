"""
Background job processing for task reminders using Celery
"""
import os
from datetime import datetime
from sqlmodel import Session, select
from ..db.session import engine
from ..models.models import TaskReminder, Task
from ..api.websocket import manager
import json

import asyncio
import threading
from celery import current_app as celery_app


@celery_app.task
def send_reminder_notification(reminder_id: str):
    """
    Background task to send reminder notifications.
    """
    try:
        # Get the reminder from the database
        with Session(engine) as session:
            reminder = session.get(TaskReminder, reminder_id)
            if not reminder:
                print(f"Reminder {reminder_id} not found")
                return False

            # Get the associated task
            task = session.get(Task, reminder.task_id)
            if not task:
                print(f"Task {reminder.task_id} not found for reminder {reminder_id}")
                return False

            # Update the reminder to mark it as sent
            reminder.sent = True
            reminder.sent_at = datetime.now()
            session.add(reminder)
            session.commit()

            # Send notification to user via WebSocket if they're connected
            if task.user_id in manager.active_connections:
                notification_message = {
                    "type": "reminder",
                    "task_id": task.id,
                    "title": task.title,
                    "message": f"Reminder: {task.title}",
                    "timestamp": datetime.now().isoformat()
                }

                # Send to all active connections for this user
                for websocket in manager.active_connections[task.user_id]:
                    try:
                        # Since this is a sync task, we can't directly use async/await
                        # In a real implementation, we would need to handle this differently
                        import asyncio
                        import threading

                        def send_to_websocket():
                            async def send():
                                await websocket.send_text(json.dumps(notification_message))

                            # Run the async function in an event loop
                            loop = asyncio.new_event_loop()
                            asyncio.set_event_loop(loop)
                            loop.run_until_complete(send())
                            loop.close()

                        # Run in a separate thread
                        thread = threading.Thread(target=send_to_websocket)
                        thread.start()
                    except Exception as e:
                        print(f"Error sending WebSocket notification: {e}")
                        # Remove disconnected connections
                        if websocket in manager.active_connections[task.user_id]:
                            manager.active_connections[task.user_id].remove(websocket)

            print(f"Reminder sent for task {task.id}: {task.title}")
            return True

    except Exception as e:
        print(f"Error sending reminder {reminder_id}: {e}")
        return False


@celery_app.task
def schedule_reminder_check():
    """
    Background task to check for reminders that should be sent.
    This should run periodically to check for due reminders.
    """
    try:
        with Session(engine) as session:
            # Find all reminders that are scheduled for now or in the past and haven't been sent
            current_time = datetime.now()
            statement = select(TaskReminder).where(
                TaskReminder.scheduled_time <= current_time,
                TaskReminder.sent == False
            )
            reminders = session.exec(statement).all()

            sent_count = 0
            for reminder in reminders:
                # Send the reminder notification
                send_reminder_notification.delay(reminder.id)
                sent_count += 1

        print(f"Checked reminders and scheduled {sent_count} notifications")
        return {"checked": len(reminders), "sent": sent_count}

    except Exception as e:
        print(f"Error checking reminders: {e}")
        return {"error": str(e)}


def start_scheduler():
    """
    Start the periodic scheduler to check for reminders.
    This would typically be run as a separate worker process.
    """
    # The scheduler runs automatically when celery beat is started
    print("Reminder scheduler configured")


if __name__ == "__main__":
    # This would be run as a separate process
    start_scheduler()