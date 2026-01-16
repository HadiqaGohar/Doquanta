"""
Dapr integration for the Todo application.

Implements distributed application runtime features using Dapr.
"""
import asyncio
import logging
from typing import Any, Dict, Optional
import aiohttp
import os
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DaprIntegration:
    """
    Integration with Dapr for distributed application runtime features.
    """
    def __init__(self):
        # Get Dapr configuration from environment variables
        self.dapr_http_port = int(os.getenv('DAPR_HTTP_PORT', '3500'))
        self.dapr_grpc_port = int(os.getenv('DAPR_GRPC_PORT', '50001'))
        self.app_id = os.getenv('DAPR_APP_ID', 'todo-backend')

        # Base URL for Dapr sidecar
        self.dapr_base_url = f"http://localhost:{self.dapr_http_port}"

        # Create HTTP session
        self.session = None

    async def __aenter__(self):
        """Async context manager entry."""
        self.session = aiohttp.ClientSession()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        if self.session:
            await self.session.close()

    async def publish_event(self, topic: str, data: Dict[str, Any]):
        """
        Publish an event to a Dapr pub/sub topic.

        Args:
            topic: The topic to publish to
            data: The data to publish
        """
        if not self.session:
            raise RuntimeError("DaprIntegration not initialized. Use as async context manager.")

        url = f"{self.dapr_base_url}/v1.0/publish/{topic}"
        try:
            async with self.session.post(url, json=data) as response:
                if response.status == 200:
                    logger.info(f"Successfully published to topic '{topic}'")
                else:
                    logger.error(f"Failed to publish to topic '{topic}', status: {response.status}")
                    response_text = await response.text()
                    logger.error(f"Response: {response_text}")
        except Exception as e:
            logger.error(f"Error publishing to topic '{topic}': {str(e)}")
            raise

    async def save_state(self, key: str, value: Any, state_store: str = "statestore"):
        """
        Save state using Dapr state management.

        Args:
            key: The key for the state
            value: The value to store
            state_store: The name of the state store component
        """
        if not self.session:
            raise RuntimeError("DaprIntegration not initialized. Use as async context manager.")

        url = f"{self.dapr_base_url}/v1.0/state/{state_store}"
        state_item = {
            "key": key,
            "value": value
        }

        try:
            async with self.session.post(url, json=[state_item]) as response:
                if response.status == 200:
                    logger.info(f"Successfully saved state for key '{key}'")
                else:
                    logger.error(f"Failed to save state for key '{key}', status: {response.status}")
                    response_text = await response.text()
                    logger.error(f"Response: {response_text}")
        except Exception as e:
            logger.error(f"Error saving state for key '{key}': {str(e)}")
            raise

    async def get_state(self, key: str, state_store: str = "statestore") -> Optional[Any]:
        """
        Get state using Dapr state management.

        Args:
            key: The key for the state
            state_store: The name of the state store component

        Returns:
            The stored value or None if not found
        """
        if not self.session:
            raise RuntimeError("DaprIntegration not initialized. Use as async context manager.")

        url = f"{self.dapr_base_url}/v1.0/state/{state_store}/{key}"

        try:
            async with self.session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    logger.info(f"Successfully retrieved state for key '{key}'")
                    return data
                elif response.status == 404:
                    logger.info(f"No state found for key '{key}'")
                    return None
                else:
                    logger.error(f"Failed to get state for key '{key}', status: {response.status}")
                    response_text = await response.text()
                    logger.error(f"Response: {response_text}")
                    return None
        except Exception as e:
            logger.error(f"Error getting state for key '{key}': {str(e)}")
            return None

    async def invoke_service(self, service_app_id: str, method: str, data: Optional[Dict[str, Any]] = None):
        """
        Invoke another service using Dapr service invocation.

        Args:
            service_app_id: The ID of the target service
            method: The method to invoke
            data: Optional data to send with the invocation

        Returns:
            The response from the target service
        """
        if not self.session:
            raise RuntimeError("DaprIntegration not initialized. Use as async context manager.")

        url = f"{self.dapr_base_url}/v1.0/invoke/{service_app_id}/method/{method}"

        try:
            if data:
                async with self.session.post(url, json=data) as response:
                    if response.status == 200:
                        result = await response.json()
                        logger.info(f"Successfully invoked {service_app_id}.{method}")
                        return result
                    else:
                        logger.error(f"Failed to invoke {service_app_id}.{method}, status: {response.status}")
                        response_text = await response.text()
                        logger.error(f"Response: {response_text}")
                        return None
            else:
                async with self.session.get(url) as response:
                    if response.status == 200:
                        result = await response.json()
                        logger.info(f"Successfully invoked {service_app_id}.{method}")
                        return result
                    else:
                        logger.error(f"Failed to invoke {service_app_id}.{method}, status: {response.status}")
                        response_text = await response.text()
                        logger.error(f"Response: {response_text}")
                        return None
        except Exception as e:
            logger.error(f"Error invoking {service_app_id}.{method}: {str(e)}")
            raise

    async def get_secret(self, secret_store: str, key: str, metadata: Optional[Dict[str, str]] = None) -> Optional[str]:
        """
        Get a secret from Dapr secret store.

        Args:
            secret_store: The name of the secret store
            key: The key of the secret
            metadata: Optional metadata for the secret request

        Returns:
            The secret value or None if not found
        """
        if not self.session:
            raise RuntimeError("DaprIntegration not initialized. Use as async context manager.")

        url = f"{self.dapr_base_url}/v1.0/secrets/{secret_store}/{key}"
        if metadata:
            # Convert metadata to query string
            params = "&".join([f"metadata.{k}={v}" for k, v in metadata.items()])
            url += f"?{params}"

        try:
            async with self.session.get(url) as response:
                if response.status == 200:
                    result = await response.json()
                    logger.info(f"Successfully retrieved secret '{key}' from '{secret_store}'")
                    # Return the actual secret value (usually under a key that matches the secret name)
                    return result.get(key)
                elif response.status == 404:
                    logger.info(f"Secret '{key}' not found in '{secret_store}'")
                    return None
                else:
                    logger.error(f"Failed to get secret '{key}' from '{secret_store}', status: {response.status}")
                    response_text = await response.text()
                    logger.error(f"Response: {response_text}")
                    return None
        except Exception as e:
            logger.error(f"Error getting secret '{key}' from '{secret_store}': {str(e)}")
            return None


# Example usage function
async def example_usage():
    """
    Example of how to use the Dapr integration.
    """
    async with DaprIntegration() as dapr:
        # Publish an event
        await dapr.publish_event("task-events", {
            "eventType": "task.created",
            "taskId": 123,
            "userId": "user123",
            "timestamp": datetime.now().isoformat()
        })

        # Save state
        await dapr.save_state("user:preferences:user123", {
            "theme": "dark",
            "notifications": True
        })

        # Get state
        preferences = await dapr.get_state("user:preferences:user123")
        print(f"Retrieved preferences: {preferences}")

        # Get a secret
        api_key = await dapr.get_secret("kubernetes", "my-api-key")
        print(f"Retrieved API key: {'Found' if api_key else 'Not found'}")


# Global instance of the Dapr integration
_dapr_integration = None


def get_dapr_client() -> DaprIntegration:
    """
    Get or create a singleton instance of the Dapr integration.

    Returns:
        DaprIntegration: Instance of the Dapr integration
    """
    global _dapr_integration
    if _dapr_integration is None:
        _dapr_integration = DaprIntegration()
    return _dapr_integration