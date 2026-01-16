"""
Kafka producer for task events.
"""
from kafka import KafkaProducer
import json
from typing import Dict, Any
from datetime import datetime
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TaskEventProducer:
    """
    Kafka producer for task events.

    Implements the event-driven architecture using Kafka for pub/sub messaging.
    """
    def __init__(self):
        # Get Kafka configuration from environment variables
        bootstrap_servers = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092')
        logger.info(f"Initializing Kafka producer with servers: {bootstrap_servers}")

        self.producer = KafkaProducer(
            bootstrap_servers=bootstrap_servers,
            value_serializer=lambda v: json.dumps(v).encode('utf-8'),
            acks='all',  # Wait for all replicas to acknowledge
            retries=3,
            linger_ms=5,  # Small delay to allow batching
            compression_type='snappy'  # Compress messages
        )

        # Define Kafka topics
        self.task_events_topic = os.getenv('TASK_EVENTS_TOPIC', 'task-events')
        self.reminders_topic = os.getenv('REMINDERS_TOPIC', 'reminders')
        self.task_updates_topic = os.getenv('TASK_UPDATES_TOPIC', 'task-updates')

    def publish_task_event(self, event_type: str, task_data: Dict[str, Any], user_id: str):
        """
        Publish a task event to Kafka.

        Args:
            event_type: Type of event (e.g., 'task_created', 'task_updated', 'task_deleted')
            task_data: Dictionary containing task information
            user_id: ID of the user associated with the task
        """
        event = {
            'event_type': event_type,
            'task_id': task_data.get('id'),
            'task_data': task_data,
            'user_id': user_id,
            'timestamp': datetime.now().isoformat()
        }

        try:
            future = self.producer.send(self.task_events_topic, event)
            # Block until the message is sent (or timeout)
            record_metadata = future.get(timeout=10)
            logger.info(f"Published {event_type} event to topic {self.task_events_topic}, "
                       f"partition {record_metadata.partition}, offset {record_metadata.offset}")
        except Exception as e:
            logger.error(f"Failed to publish {event_type} event: {str(e)}")
            raise

    def publish_reminder_event(self, task_id: int, title: str, due_at: str, remind_at: str, user_id: str):
        """
        Publish a reminder event to Kafka.

        Args:
            task_id: ID of the task
            title: Title of the task
            due_at: Due date/time of the task
            remind_at: Time when reminder should be sent
            user_id: ID of the user associated with the task
        """
        event = {
            'task_id': task_id,
            'title': title,
            'due_at': due_at,
            'remind_at': remind_at,
            'user_id': user_id
        }

        try:
            future = self.producer.send(self.reminders_topic, event)
            record_metadata = future.get(timeout=10)
            logger.info(f"Published reminder event to topic {self.reminders_topic}, "
                       f"partition {record_metadata.partition}, offset {record_metadata.offset}")
        except Exception as e:
            logger.error(f"Failed to publish reminder event: {str(e)}")
            raise

    def publish_task_update(self, task_id: int, action: str, user_id: str):
        """
        Publish a task update event to Kafka.

        Args:
            task_id: ID of the task
            action: Action performed (e.g., 'completed', 'updated', 'deleted')
            user_id: ID of the user associated with the task
        """
        event = {
            'task_id': task_id,
            'action': action,
            'user_id': user_id,
            'timestamp': datetime.now().isoformat()
        }

        try:
            future = self.producer.send(self.task_updates_topic, event)
            record_metadata = future.get(timeout=10)
            logger.info(f"Published task update event ({action}) to topic {self.task_updates_topic}, "
                       f"partition {record_metadata.partition}, offset {record_metadata.offset}")
        except Exception as e:
            logger.error(f"Failed to publish task update event: {str(e)}")
            raise

    def close(self):
        """
        Close the Kafka producer and clean up resources.
        """
        if self.producer:
            self.producer.close()
            logger.info("Kafka producer closed")


# Global instance of the producer
# In a real application, you'd want to manage this differently (e.g., dependency injection)
_kafka_producer = None


def get_kafka_producer() -> TaskEventProducer:
    """
    Get or create a singleton instance of the Kafka producer.

    Returns:
        TaskEventProducer: Instance of the Kafka producer
    """
    global _kafka_producer
    if _kafka_producer is None:
        _kafka_producer = TaskEventProducer()
    return _kafka_producer