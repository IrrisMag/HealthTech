"""
Track 2 - AI Medical Assistant Entry Point
Simple entry point that directly imports and uses the patient_support app
"""

# Import the patient support app directly
from patient_support.app import app

print("✅ Track 2 Chatbot - Patient support app loaded successfully")

# The app variable is now imported from patient_support.app
# All endpoints are already defined there including:
# - /health
# - /chat
# - /clear-memory
# - /documents
# - /search
# - etc.
