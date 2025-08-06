#!/usr/bin/env python3
"""
Test script for Track 2 Railway deployment
Tests the health endpoint and basic functionality
"""

import requests
import json
import sys
import time
from typing import Optional

def test_endpoint(url: str, endpoint: str, method: str = "GET", data: Optional[dict] = None) -> bool:
    """Test a specific endpoint"""
    full_url = f"{url.rstrip('/')}/{endpoint.lstrip('/')}"
    
    try:
        print(f"🔍 Testing {method} {full_url}")
        
        if method == "GET":
            response = requests.get(full_url, timeout=10)
        elif method == "POST":
            response = requests.post(full_url, json=data, timeout=10)
        else:
            print(f"❌ Unsupported method: {method}")
            return False
        
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            try:
                result = response.json()
                print(f"   ✅ Success: {json.dumps(result, indent=2)[:200]}...")
                return True
            except json.JSONDecodeError:
                print(f"   ✅ Success: {response.text[:200]}...")
                return True
        else:
            print(f"   ❌ Failed: {response.text[:200]}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"   ❌ Connection error: {e}")
        return False

def main():
    """Main test function"""
    if len(sys.argv) != 2:
        print("Usage: python test_track2_deployment.py <railway_url>")
        print("Example: python test_track2_deployment.py https://your-app.railway.app")
        sys.exit(1)
    
    base_url = sys.argv[1]
    
    print("🧪 Track 2 Deployment Test")
    print("=" * 50)
    print(f"🌐 Testing URL: {base_url}")
    print()
    
    # Test endpoints
    tests = [
        ("health", "GET"),
        ("", "GET"),  # Root endpoint
        ("docs", "GET"),  # API docs
        ("api", "GET"),  # API info
    ]
    
    passed = 0
    total = len(tests)
    
    for endpoint, method in tests:
        if test_endpoint(base_url, endpoint, method):
            passed += 1
        print()
        time.sleep(1)  # Brief pause between tests
    
    # Test chat endpoint with sample data
    print("🤖 Testing chat functionality...")
    chat_data = {
        "message": "Hello, I have a headache. What should I do?",
        "session_id": "test-session"
    }
    
    if test_endpoint(base_url, "chat", "POST", chat_data):
        passed += 1
    total += 1
    
    print()
    print("📊 Test Results")
    print("=" * 30)
    print(f"✅ Passed: {passed}/{total}")
    print(f"❌ Failed: {total - passed}/{total}")
    
    if passed == total:
        print("🎉 All tests passed! Track 2 deployment is working correctly.")
        sys.exit(0)
    else:
        print("⚠️  Some tests failed. Check the deployment logs.")
        sys.exit(1)

if __name__ == "__main__":
    main()
