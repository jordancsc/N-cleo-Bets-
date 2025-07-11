import requests
import sys
from datetime import datetime, timedelta
import json

class NucleoBetsAPITester:
    def __init__(self, base_url="https://b47850e8-b54b-4e4b-80c6-a207c441a19a.preview.emergentagent.com"):
        self.base_url = base_url
        self.admin_token = None
        self.user_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.created_user_id = None
        self.created_analysis_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, token=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test health endpoint"""
        success, response = self.run_test(
            "Health Check",
            "GET",
            "api/health",
            200
        )
        return success

    def test_admin_login(self):
        """Test admin login"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "api/login",
            200,
            data={"username": "Ademir", "password": "admin123"}
        )
        if success and 'access_token' in response:
            self.admin_token = response['access_token']
            print(f"   Admin token obtained: {self.admin_token[:20]}...")
            return True
        return False

    def test_invalid_login(self):
        """Test invalid login credentials"""
        success, response = self.run_test(
            "Invalid Login",
            "POST",
            "api/login",
            401,
            data={"username": "invalid", "password": "wrong"}
        )
        return success

    def test_get_current_user(self):
        """Test getting current user info"""
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "api/me",
            200,
            token=self.admin_token
        )
        if success:
            print(f"   User info: {response.get('username')} (Admin: {response.get('is_admin')})")
        return success

    def test_create_regular_user(self):
        """Test creating a regular user"""
        test_username = f"test_user_{datetime.now().strftime('%H%M%S')}"
        success, response = self.run_test(
            "Create Regular User",
            "POST",
            "api/users",
            200,
            data={"username": test_username, "password": "testpass123", "is_admin": False},
            token=self.admin_token
        )
        if success and 'user_id' in response:
            self.created_user_id = response['user_id']
            self.test_username = test_username
            print(f"   Created user ID: {self.created_user_id}")
            return True
        return False

    def test_create_admin_user(self):
        """Test creating an admin user"""
        admin_username = f"admin_test_{datetime.now().strftime('%H%M%S')}"
        success, response = self.run_test(
            "Create Admin User",
            "POST",
            "api/users",
            200,
            data={"username": admin_username, "password": "adminpass123", "is_admin": True},
            token=self.admin_token
        )
        return success

    def test_regular_user_login(self):
        """Test regular user login"""
        if not hasattr(self, 'test_username'):
            print("❌ No test user created, skipping regular user login test")
            return False
            
        success, response = self.run_test(
            "Regular User Login",
            "POST",
            "api/login",
            200,
            data={"username": self.test_username, "password": "testpass123"}
        )
        if success and 'access_token' in response:
            self.user_token = response['access_token']
            print(f"   Regular user token obtained: {self.user_token[:20]}...")
            return True
        return False

    def test_get_users_list(self):
        """Test getting users list (admin only)"""
        success, response = self.run_test(
            "Get Users List",
            "GET",
            "api/users",
            200,
            token=self.admin_token
        )
        if success:
            print(f"   Found {len(response)} users")
        return success

    def test_regular_user_cannot_access_users(self):
        """Test that regular user cannot access users endpoint"""
        success, response = self.run_test(
            "Regular User Cannot Access Users",
            "GET",
            "api/users",
            403,
            token=self.user_token
        )
        return success

    def test_create_analysis(self):
        """Test creating an analysis"""
        analysis_data = {
            "match": "Flamengo vs Corinthians",
            "league": "Brasileirão",
            "date": (datetime.now() + timedelta(days=1)).isoformat(),
            "prediction_type": "Casa",
            "odds": 2.5,
            "description": "Análise de teste para o Flamengo jogando em casa",
            "result": None
        }
        
        success, response = self.run_test(
            "Create Analysis",
            "POST",
            "api/analyses",
            200,
            data=analysis_data,
            token=self.admin_token
        )
        if success and 'analysis_id' in response:
            self.created_analysis_id = response['analysis_id']
            print(f"   Created analysis ID: {self.created_analysis_id}")
            return True
        return False

    def test_get_analyses(self):
        """Test getting analyses list"""
        success, response = self.run_test(
            "Get Analyses",
            "GET",
            "api/analyses",
            200,
            token=self.admin_token
        )
        if success:
            print(f"   Found {len(response)} analyses")
        return success

    def test_regular_user_can_view_analyses(self):
        """Test that regular user can view analyses"""
        success, response = self.run_test(
            "Regular User Can View Analyses",
            "GET",
            "api/analyses",
            200,
            token=self.user_token
        )
        if success:
            print(f"   Regular user can see {len(response)} analyses")
        return success

    def test_update_analysis_result(self):
        """Test updating analysis result to Green"""
        if not self.created_analysis_id:
            print("❌ No analysis created, skipping update test")
            return False
            
        success, response = self.run_test(
            "Update Analysis Result to Green",
            "PUT",
            f"api/analyses/{self.created_analysis_id}",
            200,
            data={"result": "Green"},
            token=self.admin_token
        )
        return success

    def test_update_analysis_result_red(self):
        """Test updating analysis result to Red"""
        if not self.created_analysis_id:
            print("❌ No analysis created, skipping update test")
            return False
            
        success, response = self.run_test(
            "Update Analysis Result to Red",
            "PUT",
            f"api/analyses/{self.created_analysis_id}",
            200,
            data={"result": "Red"},
            token=self.admin_token
        )
        return success

    def test_regular_user_cannot_create_analysis(self):
        """Test that regular user cannot create analysis"""
        analysis_data = {
            "match": "Test Match",
            "league": "Test League",
            "date": datetime.now().isoformat(),
            "prediction_type": "Casa",
            "odds": 1.5,
            "description": "Test analysis"
        }
        
        success, response = self.run_test(
            "Regular User Cannot Create Analysis",
            "POST",
            "api/analyses",
            403,
            data=analysis_data,
            token=self.user_token
        )
        return success

    def test_prediction_types(self):
        """Test all prediction types"""
        prediction_types = ['Casa', 'Empate', 'Fora', 'Over', 'Under', 'Dupla Chance 1', 'Dupla Chance 2']
        all_passed = True
        
        for pred_type in prediction_types:
            analysis_data = {
                "match": f"Test Match - {pred_type}",
                "league": "Test League",
                "date": (datetime.now() + timedelta(days=1)).isoformat(),
                "prediction_type": pred_type,
                "odds": 2.0,
                "description": f"Test analysis for {pred_type}"
            }
            
            success, response = self.run_test(
                f"Create Analysis - {pred_type}",
                "POST",
                "api/analyses",
                200,
                data=analysis_data,
                token=self.admin_token
            )
            if not success:
                all_passed = False
                
        return all_passed

    def test_delete_analysis(self):
        """Test deleting an analysis"""
        if not self.created_analysis_id:
            print("❌ No analysis created, skipping delete test")
            return False
            
        success, response = self.run_test(
            "Delete Analysis",
            "DELETE",
            f"api/analyses/{self.created_analysis_id}",
            200,
            token=self.admin_token
        )
        return success

    def test_delete_user(self):
        """Test deleting a user"""
        if not self.created_user_id:
            print("❌ No user created, skipping delete test")
            return False
            
        success, response = self.run_test(
            "Delete User",
            "DELETE",
            f"api/users/{self.created_user_id}",
            200,
            token=self.admin_token
        )
        return success

    def test_cannot_delete_admin(self):
        """Test that admin user cannot be deleted"""
        # First get the admin user ID
        success, users = self.run_test(
            "Get Users for Admin Delete Test",
            "GET",
            "api/users",
            200,
            token=self.admin_token
        )
        
        if not success:
            return False
            
        admin_user = next((user for user in users if user['username'] == 'Ademir'), None)
        if not admin_user:
            print("❌ Admin user not found")
            return False
            
        success, response = self.run_test(
            "Cannot Delete Admin User",
            "DELETE",
            f"api/users/{admin_user['id']}",
            400,
            token=self.admin_token
        )
        return success

def main():
    print("🐺 Starting Núcleo Bets API Testing...")
    print("=" * 50)
    
    tester = NucleoBetsAPITester()
    
    # Test sequence
    tests = [
        tester.test_health_check,
        tester.test_admin_login,
        tester.test_invalid_login,
        tester.test_get_current_user,
        tester.test_create_regular_user,
        tester.test_create_admin_user,
        tester.test_regular_user_login,
        tester.test_get_users_list,
        tester.test_regular_user_cannot_access_users,
        tester.test_create_analysis,
        tester.test_get_analyses,
        tester.test_regular_user_can_view_analyses,
        tester.test_update_analysis_result,
        tester.test_update_analysis_result_red,
        tester.test_regular_user_cannot_create_analysis,
        tester.test_prediction_types,
        tester.test_cannot_delete_admin,
        tester.test_delete_analysis,
        tester.test_delete_user,
    ]
    
    # Run all tests
    for test in tests:
        try:
            test()
        except Exception as e:
            print(f"❌ Test {test.__name__} failed with exception: {str(e)}")
    
    # Print results
    print("\n" + "=" * 50)
    print(f"📊 API Test Results:")
    print(f"   Tests Run: {tester.tests_run}")
    print(f"   Tests Passed: {tester.tests_passed}")
    print(f"   Success Rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All API tests passed!")
        return 0
    else:
        print(f"⚠️  {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())