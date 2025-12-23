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
    def __init__(self, base_url="https://masalkitap.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.created_story_id = None

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

    def run_test(self, name, method, endpoint, expected_status, data=None, timeout=30):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}" if endpoint else self.base_url
        headers = {'Content-Type': 'application/json'}

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=timeout)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=timeout)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=timeout)

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

    def test_get_topics(self):
        """Test GET /topics endpoint"""
        success, data = self.run_test("Get Topics", "GET", "topics", 200)
        
        if success and data:
            # Validate topics structure
            expected_topics = ["organlar", "degerler", "doga", "duygular", "arkadaslik", "saglik"]
            topic_ids = [topic.get('id') for topic in data]
            
            if all(topic_id in topic_ids for topic_id in expected_topics):
                print("   ✓ All expected topics found")
            else:
                print(f"   ⚠ Missing topics: {set(expected_topics) - set(topic_ids)}")
        
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
            "topic": "arkadaslik",
            "theme": "Paylaşmanın önemi ve dostluk",
            "age_group": "4-5",
            "character": "Minik Tavşan Cici"
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