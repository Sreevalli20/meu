#!/usr/bin/env python3
"""
PANI-PATH Production Smoke Test
Tests API endpoints and basic functionality without requiring full deployment.
Run locally or against deployed URL.
"""

import httpx
import json
import sys
from typing import Dict, Any

# Fix Windows console encoding
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

# Configuration - change BASE_URL to test against production
BASE_URL = "http://localhost:8000"  # Default to local
# BASE_URL = "https://meu-6ckl.onrender.com"  # Uncomment for production test

def print_section(title: str):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")

def test_health() -> bool:
    """Test health endpoint"""
    print("Testing GET /api/health")
    try:
        response = httpx.get(f"{BASE_URL}/api/health", timeout=10)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {json.dumps(data, indent=2)}")
            return True
        else:
            print(f"ERROR: Expected 200, got {response.status_code}")
            return False
    except Exception as e:
        print(f"ERROR: {e}")
        return False

def test_geocode() -> bool:
    """Test geocoding endpoint"""
    print("Testing POST /api/geocode")
    try:
        response = httpx.post(
            f"{BASE_URL}/api/geocode",
            json={"query": "Charminar Hyderabad"},
            timeout=10
        )
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Results count: {len(data.get('results', []))}")
            if data.get('results'):
                print(f"First result: {json.dumps(data['results'][0], indent=2)[:200]}...")
            return True
        else:
            print(f"ERROR: Expected 200, got {response.status_code}")
            return False
    except Exception as e:
        print(f"ERROR: {e}")
        return False

def test_auth_me() -> bool:
    """Test auth/me endpoint (should return guest user)"""
    print("Testing GET /api/auth/me")
    try:
        response = httpx.get(f"{BASE_URL}/api/auth/me", timeout=10)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"User: {data.get('user', {}).get('name', 'N/A')}")
            return True
        else:
            print(f"ERROR: Expected 200, got {response.status_code}")
            return False
    except Exception as e:
        print(f"ERROR: {e}")
        return False

def test_saved_places() -> bool:
    """Test saved places endpoint"""
    print("Testing GET /api/saved")
    try:
        response = httpx.get(f"{BASE_URL}/api/saved", timeout=10)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Saved places count: {len(data.get('savedPlaces', []))}")
            return True
        else:
            print(f"ERROR: Expected 200, got {response.status_code}")
            return False
    except Exception as e:
        print(f"ERROR: {e}")
        return False

def test_static_files() -> bool:
    """Test that static files are served"""
    print("Testing GET / (index.html)")
    try:
        response = httpx.get(f"{BASE_URL}/", timeout=10)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            content_type = response.headers.get('content-type', '')
            print(f"Content-Type: {content_type}")
            if 'text/html' in content_type:
                print("[OK] Frontend served correctly")
                return True
            else:
                print(f"ERROR: Expected text/html, got {content_type}")
                return False
        else:
            print(f"ERROR: Expected 200, got {response.status_code}")
            return False
    except Exception as e:
        print(f"ERROR: {e}")
        return False

def main():
    print_section("PANI-PATH Smoke Test")
    print(f"Testing against: {BASE_URL}\n")

    results = {
        "Health Check": test_health(),
        "Geocoding": test_geocode(),
        "Auth/me": test_auth_me(),
        "Saved Places": test_saved_places(),
        "Static Files": test_static_files(),
    }

    print_section("Test Results Summary")
    passed = sum(1 for v in results.values() if v)
    total = len(results)

    for test, result in results.items():
        status = "[PASS]" if result else "[FAIL]"
        print(f"{status:10} | {test}")

    print(f"\nTotal: {passed}/{total} tests passed")

    if passed == total:
        print("\n[SUCCESS] All smoke tests passed!")
        return 0
    else:
        print(f"\n[ERROR] {total - passed} test(s) failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())
