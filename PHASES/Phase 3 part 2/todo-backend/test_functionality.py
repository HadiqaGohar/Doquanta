"""
Integration tests for the FastAPI Todo Backend
This file contains tests for all API endpoints with proper authentication
"""


import pytest
from fastapi.testclient import TestClient
from main import app
from src.core.security import verify_token
from jose import jwt
import json

# Create a test client for the FastAPI app
client = TestClient(app)

# Sample user ID for testing
TEST_USER_ID = "test_user_123"
TEST_JWT_SECRET = "test_secret_key_for_testing_purposes_only"
TEST_JWT_ALGORITHM = "HS256"

def create_test_token(user_id: str = TEST_USER_ID):
    """Helper function to create a test JWT token"""
    payload = {
        "sub": user_id,  # Better Auth typically uses 'sub' for user ID
        "exp": 9999999999,  # Far future expiration
        "iat": 1609459200,  # Jan 1, 2021
    }
    token = jwt.encode(payload, TEST_JWT_SECRET, algorithm=TEST_JWT_ALGORITHM)
    return token

def test_root_endpoint():
    """Test the root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to the Todo Backend API"}

def test_get_tasks_authenticated():
    """Test getting tasks with valid authentication"""
    token = create_test_token()
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get(f"/api/{TEST_USER_ID}/tasks", headers=headers)
    assert response.status_code == 200
    assert "tasks" in response.json()
    assert "count" in response.json()

def test_get_tasks_unauthorized():
    """Test getting tasks without authentication"""
    response = client.get(f"/api/{TEST_USER_ID}/tasks")
    assert response.status_code == 401  # Unauthorized

def test_get_tasks_wrong_user():
    """Test getting tasks for a different user (should be forbidden)"""
    token = create_test_token(TEST_USER_ID)
    headers = {"Authorization": f"Bearer {token}"}
    wrong_user_id = "wrong_user_456"

    response = client.get(f"/api/{wrong_user_id}/tasks", headers=headers)
    assert response.status_code == 403  # Forbidden

def test_create_task_authenticated():
    """Test creating a task with valid authentication"""
    token = create_test_token()
    headers = {"Authorization": f"Bearer {token}"}

    task_data = {
        "title": "Test Task",
        "description": "Test Description",
        "priority": "medium",
        "category": "work"
    }

    response = client.post(f"/api/{TEST_USER_ID}/tasks", json=task_data, headers=headers)
    assert response.status_code == 200
    assert response.json()["title"] == "Test Task"
    assert response.json()["description"] == "Test Description"

def test_create_task_unauthorized():
    """Test creating a task without authentication"""
    task_data = {
        "title": "Test Task",
        "description": "Test Description"
    }

    response = client.post(f"/api/{TEST_USER_ID}/tasks", json=task_data)
    assert response.status_code == 401  # Unauthorized

def test_get_single_task():
    """Test getting a single task"""
    # First, create a task
    token = create_test_token()
    headers = {"Authorization": f"Bearer {token}"}

    task_data = {
        "title": "Single Task Test",
        "description": "Testing single task retrieval"
    }

    create_response = client.post(f"/api/{TEST_USER_ID}/tasks", json=task_data, headers=headers)
    assert create_response.status_code == 200
    task_id = create_response.json()["id"]

    # Now get the task
    response = client.get(f"/api/{TEST_USER_ID}/tasks/{task_id}", headers=headers)
    assert response.status_code == 200
    assert response.json()["id"] == task_id
    assert response.json()["title"] == "Single Task Test"

def test_update_task():
    """Test updating a task"""
    # First, create a task
    token = create_test_token()
    headers = {"Authorization": f"Bearer {token}"}

    task_data = {
        "title": "Original Title",
        "description": "Original Description"
    }

    create_response = client.post(f"/api/{TEST_USER_ID}/tasks", json=task_data, headers=headers)
    assert create_response.status_code == 200
    task_id = create_response.json()["id"]

    # Now update the task
    update_data = {
        "title": "Updated Title",
        "description": "Updated Description",
        "completed": True
    }

    response = client.put(f"/api/{TEST_USER_ID}/tasks/{task_id}", json=update_data, headers=headers)
    assert response.status_code == 200
    assert response.json()["title"] == "Updated Title"
    assert response.json()["description"] == "Updated Description"
    assert response.json()["completed"] is True

def test_complete_task():
    """Test completing a task"""
    # First, create a task
    token = create_test_token()
    headers = {"Authorization": f"Bearer {token}"}

    task_data = {
        "title": "Task to Complete",
        "description": "Testing task completion"
    }

    create_response = client.post(f"/api/{TEST_USER_ID}/tasks", json=task_data, headers=headers)
    assert create_response.status_code == 200
    task_id = create_response.json()["id"]

    # Verify task is initially not completed
    get_response = client.get(f"/api/{TEST_USER_ID}/tasks/{task_id}", headers=headers)
    assert get_response.status_code == 200
    assert get_response.json()["completed"] is False

    # Now complete the task
    response = client.patch(f"/api/{TEST_USER_ID}/tasks/{task_id}/complete", headers=headers)
    assert response.status_code == 200
    assert response.json()["completed"] is True

def test_delete_task():
    """Test deleting a task"""
    # First, create a task
    token = create_test_token()
    headers = {"Authorization": f"Bearer {token}"}

    task_data = {
        "title": "Task to Delete",
        "description": "Testing task deletion"
    }

    create_response = client.post(f"/api/{TEST_USER_ID}/tasks", json=task_data, headers=headers)
    assert create_response.status_code == 200
    task_id = create_response.json()["id"]

    # Verify task exists
    get_response = client.get(f"/api/{TEST_USER_ID}/tasks/{task_id}", headers=headers)
    assert get_response.status_code == 200

    # Now delete the task
    response = client.delete(f"/api/{TEST_USER_ID}/tasks/{task_id}", headers=headers)
    assert response.status_code == 200

    # Verify task is deleted
    get_response_after_delete = client.get(f"/api/{TEST_USER_ID}/tasks/{task_id}", headers=headers)
    assert get_response_after_delete.status_code == 404

def test_error_handling_invalid_task_id():
    """Test error handling for invalid task ID"""
    token = create_test_token()
    headers = {"Authorization": f"Bearer {token}"}

    # Try to get a non-existent task
    response = client.get(f"/api/{TEST_USER_ID}/tasks/999999", headers=headers)
    assert response.status_code == 404

if __name__ == "__main__":
    pytest.main()