#!/usr/bin/env python3
"""
Backend API Testing for Masal Sepeti (Story Basket)
Tests all API endpoints including AI story generation
"""

import requests
import sys
import json
import time
from datetime import datetime

class MasalSepetiAPITester:
    def __init__(self, base_url="https://storytimeai.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.created_story_id = None
        self.user_token = None
        self.admin_token = None
        self.test_user_email = None
        self.test_user_password = None
        self.session = requests.Session()

    def log_test(self, name, success, details="", response_data=None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details,
            "response_data": response_data
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, timeout=30, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}" if endpoint else self.base_url
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
        elif self.user_token:
            test_headers['Authorization'] = f'Bearer {self.user_token}'

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = self.session.get(url, headers=test_headers, timeout=timeout)
            elif method == 'POST':
                response = self.session.post(url, json=data, headers=test_headers, timeout=timeout)
            elif method == 'DELETE':
                response = self.session.delete(url, headers=test_headers, timeout=timeout)

            print(f"   Status: {response.status_code}")
            
            success = response.status_code == expected_status
            response_data = None
            
            try:
                response_data = response.json()
                if success:
                    print(f"   Response: {json.dumps(response_data, indent=2, ensure_ascii=False)[:200]}...")
            except:
                if success:
                    print(f"   Response: {response.text[:200]}...")

            if success:
                self.log_test(name, True, response_data=response_data)
            else:
                error_detail = f"Expected {expected_status}, got {response.status_code}"
                if response_data and 'detail' in response_data:
                    error_detail += f" - {response_data['detail']}"
                self.log_test(name, False, error_detail, response_data)

            return success, response_data

        except requests.exceptions.Timeout:
            self.log_test(name, False, f"Request timeout after {timeout}s")
            return False, {}
        except Exception as e:
            self.log_test(name, False, f"Request error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test API root endpoint"""
        return self.run_test("API Root", "GET", "", 200)

    def test_user_registration(self):
        """Test POST /auth/register - User registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        test_data = {
            "name": "Test",
            "surname": "User",
            "email": f"test_user_{timestamp}@example.com",
            "phone": "05551234567",
            "password": "testpass123"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=test_data
        )
        
        if success and response.get('success'):
            self.test_user_email = test_data['email']
            self.test_user_password = test_data['password']
            print(f"   ✓ User registered: {self.test_user_email}")
            return True
        return False

    def test_user_login(self):
        """Test POST /auth/login - User login"""
        if not self.test_user_email:
            print("❌ Cannot test login - no registered user")
            return False
            
        login_data = {
            "email": self.test_user_email,
            "password": self.test_user_password
        }
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if success and response.get('session_token'):
            self.user_token = response['session_token']
            print(f"   ✓ User logged in, token received")
            return True
        return False

    def test_get_current_user(self):
        """Test GET /auth/me - Get current user info"""
        if not self.user_token:
            print("❌ Cannot test /auth/me - no user token")
            return False
            
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        
        if success and response.get('user_id'):
            print(f"   ✓ User info retrieved: {response.get('name')} {response.get('surname')}")
            print(f"   ✓ Credits: {response.get('credits', 0)}")
            return True
        return False

    def test_admin_login(self):
        """Test POST /admin/login - Admin login with admin/masallardiyariai"""
        admin_data = {
            "username": "admin",
            "password": "masallardiyariai"
        }
        
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "admin/login",
            200,
            data=admin_data,
            headers={'Content-Type': 'application/json'}  # Don't use user token
        )
        
        if success and response.get('session_token'):
            self.admin_token = response['session_token']
            print(f"   ✓ Admin logged in successfully")
            return True
        return False

    def test_admin_stats(self):
        """Test GET /admin/stats - Admin dashboard stats"""
        if not self.admin_token:
            print("❌ Cannot test admin stats - no admin token")
            return False
            
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.admin_token}'
        }
        
        success, response = self.run_test(
            "Admin Stats",
            "GET",
            "admin/stats",
            200,
            headers=headers
        )
        
        if success and 'total_users' in response:
            print(f"   ✓ Total users: {response.get('total_users', 0)}")
            print(f"   ✓ Total stories: {response.get('total_stories', 0)}")
            print(f"   ✓ Pending requests: {response.get('pending_requests', 0)}")
            return True
        return False

    def test_credit_balance(self):
        """Test GET /credits/balance - Get user credit balance"""
        if not self.user_token:
            print("❌ Cannot test credit balance - no user token")
            return False
            
        success, response = self.run_test(
            "Get Credit Balance",
            "GET",
            "credits/balance",
            200
        )
        
        if success and 'credits' in response:
            print(f"   ✓ Credit balance: {response.get('credits')}")
            return True
        return False

    def test_credit_request(self):
        """Test POST /credits/request - Create credit request"""
        if not self.user_token:
            print("❌ Cannot test credit request - no user token")
            return False
            
        request_data = {
            "requested_credits": 10,
            "message": "Test credit request from API testing"
        }
        
        success, response = self.run_test(
            "Create Credit Request",
            "POST",
            "credits/request",
            200,
            data=request_data
        )
        
        if success and response.get('success'):
            print(f"   ✓ Credit request created successfully")
            return True
        return False

    def test_invalid_login(self):
        """Test login with invalid credentials"""
        invalid_data = {
            "email": "invalid@example.com",
            "password": "wrongpassword"
        }
        
        success, _ = self.run_test(
            "Invalid Login (should fail)",
            "POST",
            "auth/login",
            401,  # Expecting 401 for invalid credentials
            data=invalid_data,
            headers={'Content-Type': 'application/json'}  # Don't use user token
        )
        
        return success  # Success means we got the expected 401

    def test_invalid_admin_login(self):
        """Test admin login with invalid credentials"""
        invalid_data = {
            "username": "wrongadmin",
            "password": "wrongpassword"
        }
        
        success, _ = self.run_test(
            "Invalid Admin Login (should fail)",
            "POST",
            "admin/login",
            401,  # Expecting 401 for invalid credentials
            data=invalid_data,
            headers={'Content-Type': 'application/json'}  # Don't use user token
        )
        
        return success  # Success means we got the expected 401

    def test_get_topics(self):
        """Test GET /topics endpoint - Should return 15 categories"""
        success, data = self.run_test("Get Topics", "GET", "topics", 200)
        
        if success and data:
            # Validate we have 15 topics as required
            if len(data) == 15:
                print(f"   ✓ Correct number of topics: {len(data)}")
            else:
                print(f"   ⚠ Expected 15 topics, got {len(data)}")
            
            # Check topic structure
            if data and isinstance(data[0], dict):
                required_fields = ['id', 'name', 'icon', 'color', 'description', 'image', 'subtopic_count']
                first_topic = data[0]
                missing_fields = [field for field in required_fields if field not in first_topic]
                if missing_fields:
                    print(f"   ⚠ Missing fields in topic: {missing_fields}")
                else:
                    print("   ✓ Topic structure correct")
        
        return success

    def test_get_topic_detail(self):
        """Test GET /topics/{topic_id} - Should return topic detail with subtopics and kazanım"""
        # Test with a known topic ID
        success, data = self.run_test("Get Topic Detail", "GET", "topics/degerler", 200)
        
        if success and data:
            # Validate topic detail structure
            required_fields = ['id', 'name', 'icon', 'color', 'description', 'image', 'subtopics']
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                print(f"   ⚠ Missing fields in topic detail: {missing_fields}")
            else:
                print("   ✓ Topic detail structure correct")
            
            # Check subtopics
            subtopics = data.get('subtopics', [])
            if subtopics:
                print(f"   ✓ Found {len(subtopics)} subtopics")
                # Check first subtopic structure
                if subtopics[0]:
                    subtopic_fields = ['id', 'name', 'kazanim']
                    missing_subtopic_fields = [field for field in subtopic_fields if field not in subtopics[0]]
                    if missing_subtopic_fields:
                        print(f"   ⚠ Missing fields in subtopic: {missing_subtopic_fields}")
                    else:
                        print("   ✓ Subtopic structure with kazanım correct")
            else:
                print("   ⚠ No subtopics found")
        
        return success

    def test_get_stories(self):
        """Test GET /stories endpoint"""
        return self.run_test("Get All Stories", "GET", "stories", 200)

    def test_get_stories_with_topic_filter(self):
        """Test GET /stories with topic filter"""
        return self.run_test("Get Stories by Topic", "GET", "stories?topic=doga", 200)

    def test_get_stories_with_search(self):
        """Test GET /stories with search query"""
        return self.run_test("Search Stories", "GET", "stories?search=dostluk", 200)

    def test_get_popular_stories(self):
        """Test GET /stories/popular endpoint"""
        return self.run_test("Get Popular Stories", "GET", "stories/popular", 200)

    def test_create_story_ai_generation(self):
        """Test POST /stories/generate - AI story generation (CRITICAL TEST)"""
        story_data = {
            "topic_id": "degerler",
            "subtopic_id": "paylasma",
            "theme": "Paylaşmanın önemi ve dostluk",
            "age_group": "4-5",
            "character": "Minik Tavşan Cici",
            "kazanim_based": True
        }
        
        print("\n🚨 CRITICAL TEST: AI Story Generation")
        print("   This test may take 30-60 seconds...")
        
        # Use longer timeout for AI generation
        success, data = self.run_test(
            "AI Story Generation", 
            "POST", 
            "stories/generate", 
            200, 
            story_data, 
            timeout=120
        )
        
        if success and data:
            # Store story ID for later tests
            self.created_story_id = data.get('id')
            
            # Validate story structure
            required_fields = ['id', 'title', 'content', 'topic', 'theme', 'age_group', 'audio_base64']
            missing_fields = [field for field in required_fields if not data.get(field)]
            
            if missing_fields:
                print(f"   ⚠ Missing fields: {missing_fields}")
            else:
                print("   ✓ Story structure complete")
                print(f"   ✓ Story ID: {self.created_story_id}")
                print(f"   ✓ Title: {data.get('title', 'N/A')}")
                print(f"   ✓ Content length: {len(data.get('content', ''))} chars")
                print(f"   ✓ Audio included: {'Yes' if data.get('audio_base64') else 'No'}")
        
        return success

    def test_get_story_by_id(self):
        """Test GET /stories/{id} endpoint"""
        if not self.created_story_id:
            print("⚠ Skipping story retrieval test - no story ID available")
            return True
        
        return self.run_test(
            "Get Story by ID", 
            "GET", 
            f"stories/{self.created_story_id}", 
            200
        )

    def test_increment_play_count(self):
        """Test POST /stories/{id}/play endpoint"""
        if not self.created_story_id:
            print("⚠ Skipping play count test - no story ID available")
            return True
        
        return self.run_test(
            "Increment Play Count", 
            "POST", 
            f"stories/{self.created_story_id}/play", 
            200
        )

    def test_nonexistent_story(self):
        """Test GET /stories/{invalid_id} - should return 404"""
        return self.run_test(
            "Get Nonexistent Story", 
            "GET", 
            "stories/invalid-story-id-12345", 
            404
        )

    def run_all_tests(self):
        """Run all API tests"""
        print("=" * 60)
        print("🧪 MASAL SEPETİ API TESTING")
        print("=" * 60)
        print(f"Base URL: {self.base_url}")
        print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Test sequence
        tests = [
            self.test_root_endpoint,
            self.test_get_topics,
            self.test_get_topic_detail,
            self.test_get_stories,
            self.test_get_stories_with_topic_filter,
            self.test_get_stories_with_search,
            self.test_get_popular_stories,
            self.test_create_story_ai_generation,  # Critical test
            self.test_get_story_by_id,
            self.test_increment_play_count,
            self.test_nonexistent_story,
        ]
        
        for test_func in tests:
            try:
                test_func()
                time.sleep(1)  # Brief pause between tests
            except Exception as e:
                print(f"❌ Test {test_func.__name__} crashed: {str(e)}")
                self.log_test(test_func.__name__, False, f"Test crashed: {str(e)}")
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed / self.tests_run * 100):.1f}%")
        
        # Show failed tests
        failed_tests = [result for result in self.test_results if not result['success']]
        if failed_tests:
            print("\n❌ FAILED TESTS:")
            for test in failed_tests:
                print(f"   • {test['test']}: {test['details']}")
        
        print(f"\nCompleted at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test execution"""
    tester = MasalSepetiAPITester()
    
    try:
        success = tester.run_all_tests()
        return 0 if success else 1
    except KeyboardInterrupt:
        print("\n\n⚠ Tests interrupted by user")
        return 1
    except Exception as e:
        print(f"\n\n💥 Test suite crashed: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())