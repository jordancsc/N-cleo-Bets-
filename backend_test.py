#!/usr/bin/env python3
"""
Backend API Testing for Núcleo Bets
Tests all authentication, admin, and tips functionality
"""

import requests
import json
from datetime import datetime, timedelta
import time

# Configuration
BASE_URL = "https://2ccffa4c-2e74-43a8-9225-0242c358bf67.preview.emergentagent.com/api"
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"

# Test data
TEST_USER_DATA = {
    "username": "joao_silva",
    "email": "joao.silva@email.com", 
    "password": "senha123"
}

TEST_TIP_DATA = {
    "match_info": "Flamengo vs Palmeiras - Brasileirão",
    "prediction": "1",  # Home win
    "confidence": 85.5,
    "reasoning": "Flamengo tem melhor desempenho em casa e Palmeiras tem 3 jogadores lesionados",
    "odds": "2.10",
    "match_date": (datetime.utcnow() + timedelta(days=1)).isoformat()
}

# Test data for Valuable Tips (as requested in review)
TEST_VALUABLE_TIP_DATA = {
    "title": "Tripla Especial - Copa do Brasil",
    "description": "Combinação de 3 jogos com alta probabilidade de acerto",
    "games": "Flamengo vs Palmeiras - Casa (1.80)\nSantos vs Corinthians - Over 2.5 (2.10)\nReal Madrid vs Barcelona - Fora (2.50)",
    "total_odds": "9.45",
    "stake_suggestion": "5-10% da banca"
}

class NucleoBetstester:
    def __init__(self):
        self.session = requests.Session()
        self.admin_token = None
        self.user_token = None
        self.test_user_id = None
        self.test_tip_id = None
        self.test_valuable_tip_id = None
        self.results = []
        
    def log_result(self, test_name, success, message, details=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        if details:
            print(f"   Details: {details}")
        
        self.results.append({
            "test": test_name,
            "success": success,
            "message": message,
            "details": details
        })
    
    def test_api_health(self):
        """Test if API is accessible"""
        try:
            response = self.session.get(f"{BASE_URL}/")
            if response.status_code == 200:
                data = response.json()
                self.log_result("API Health Check", True, "API is accessible", data.get("message"))
                return True
            else:
                self.log_result("API Health Check", False, f"API returned status {response.status_code}")
                return False
        except Exception as e:
            self.log_result("API Health Check", False, f"Failed to connect to API: {str(e)}")
            return False
    
    def test_user_registration(self):
        """Test user registration endpoint"""
        try:
            response = self.session.post(f"{BASE_URL}/auth/register", json=TEST_USER_DATA)
            
            if response.status_code == 200:
                data = response.json()
                self.log_result("User Registration", True, "User registered successfully", data.get("message"))
                return True
            else:
                error_msg = response.json().get("detail", "Unknown error") if response.content else f"Status {response.status_code}"
                self.log_result("User Registration", False, f"Registration failed: {error_msg}")
                return False
        except Exception as e:
            self.log_result("User Registration", False, f"Registration request failed: {str(e)}")
            return False
    
    def test_user_login_before_approval(self):
        """Test that user cannot login before admin approval"""
        try:
            login_data = {
                "username": TEST_USER_DATA["username"],
                "password": TEST_USER_DATA["password"]
            }
            response = self.session.post(f"{BASE_URL}/auth/login", json=login_data)
            
            if response.status_code == 401:
                error_msg = response.json().get("detail", "")
                if "não aprovada" in error_msg or "not approved" in error_msg.lower():
                    self.log_result("User Login Before Approval", True, "Correctly blocked unapproved user", error_msg)
                    return True
                else:
                    self.log_result("User Login Before Approval", False, f"Wrong error message: {error_msg}")
                    return False
            else:
                self.log_result("User Login Before Approval", False, f"Should have been blocked but got status {response.status_code}")
                return False
        except Exception as e:
            self.log_result("User Login Before Approval", False, f"Login test failed: {str(e)}")
            return False
    
    def test_admin_login(self):
        """Test admin login"""
        try:
            login_data = {
                "username": ADMIN_USERNAME,
                "password": ADMIN_PASSWORD
            }
            response = self.session.post(f"{BASE_URL}/auth/login", json=login_data)
            
            if response.status_code == 200:
                data = response.json()
                self.admin_token = data.get("access_token")
                user_info = data.get("user", {})
                
                if user_info.get("role") == "admin":
                    self.log_result("Admin Login", True, f"Admin logged in successfully as {user_info.get('username')}")
                    return True
                else:
                    self.log_result("Admin Login", False, f"User role is {user_info.get('role')}, expected admin")
                    return False
            else:
                error_msg = response.json().get("detail", "Unknown error") if response.content else f"Status {response.status_code}"
                self.log_result("Admin Login", False, f"Admin login failed: {error_msg}")
                return False
        except Exception as e:
            self.log_result("Admin Login", False, f"Admin login request failed: {str(e)}")
            return False
    
    def test_admin_get_users(self):
        """Test admin can get user list"""
        if not self.admin_token:
            self.log_result("Admin Get Users", False, "No admin token available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = self.session.get(f"{BASE_URL}/admin/users", headers=headers)
            
            if response.status_code == 200:
                users = response.json()
                # Find our test user
                test_user = next((u for u in users if u["username"] == TEST_USER_DATA["username"]), None)
                if test_user:
                    self.test_user_id = test_user["id"]
                    approved_status = test_user.get("approved_by_admin", False)
                    self.log_result("Admin Get Users", True, f"Found {len(users)} users, test user approval status: {approved_status}")
                    return True
                else:
                    self.log_result("Admin Get Users", False, f"Test user not found in {len(users)} users")
                    return False
            else:
                error_msg = response.json().get("detail", "Unknown error") if response.content else f"Status {response.status_code}"
                self.log_result("Admin Get Users", False, f"Failed to get users: {error_msg}")
                return False
        except Exception as e:
            self.log_result("Admin Get Users", False, f"Get users request failed: {str(e)}")
            return False
    
    def test_admin_approve_user(self):
        """Test admin can approve users"""
        if not self.admin_token or not self.test_user_id:
            self.log_result("Admin Approve User", False, "Missing admin token or user ID")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = self.session.post(f"{BASE_URL}/admin/approve-user/{self.test_user_id}", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                self.log_result("Admin Approve User", True, "User approved successfully", data.get("message"))
                return True
            else:
                error_msg = response.json().get("detail", "Unknown error") if response.content else f"Status {response.status_code}"
                self.log_result("Admin Approve User", False, f"User approval failed: {error_msg}")
                return False
        except Exception as e:
            self.log_result("Admin Approve User", False, f"User approval request failed: {str(e)}")
            return False
    
    def test_user_login_after_approval(self):
        """Test user can login after admin approval"""
        try:
            login_data = {
                "username": TEST_USER_DATA["username"],
                "password": TEST_USER_DATA["password"]
            }
            response = self.session.post(f"{BASE_URL}/auth/login", json=login_data)
            
            if response.status_code == 200:
                data = response.json()
                self.user_token = data.get("access_token")
                user_info = data.get("user", {})
                
                if user_info.get("role") == "user":
                    self.log_result("User Login After Approval", True, f"User logged in successfully as {user_info.get('username')}")
                    return True
                else:
                    self.log_result("User Login After Approval", False, f"Wrong user role: {user_info.get('role')}")
                    return False
            else:
                error_msg = response.json().get("detail", "Unknown error") if response.content else f"Status {response.status_code}"
                self.log_result("User Login After Approval", False, f"User login failed: {error_msg}")
                return False
        except Exception as e:
            self.log_result("User Login After Approval", False, f"User login request failed: {str(e)}")
            return False
    
    def test_protected_route_access(self):
        """Test protected route access with user token"""
        if not self.user_token:
            self.log_result("Protected Route Access", False, "No user token available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.user_token}"}
            response = self.session.get(f"{BASE_URL}/auth/me", headers=headers)
            
            if response.status_code == 200:
                user_info = response.json()
                expected_username = TEST_USER_DATA["username"]
                if user_info.get("username") == expected_username:
                    self.log_result("Protected Route Access", True, f"Successfully accessed protected route as {expected_username}")
                    return True
                else:
                    self.log_result("Protected Route Access", False, f"Wrong user info returned: {user_info}")
                    return False
            else:
                error_msg = response.json().get("detail", "Unknown error") if response.content else f"Status {response.status_code}"
                self.log_result("Protected Route Access", False, f"Protected route access failed: {error_msg}")
                return False
        except Exception as e:
            self.log_result("Protected Route Access", False, f"Protected route request failed: {str(e)}")
            return False
    
    def test_create_admin_tip(self):
        """Test creating admin analysis"""
        if not self.admin_token:
            self.log_result("Create Admin Analysis", False, "No admin token available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = self.session.post(f"{BASE_URL}/admin/analysis", json=TEST_TIP_DATA, headers=headers)
            
            if response.status_code == 200:
                tip = response.json()
                self.test_tip_id = tip.get("id")
                match_info = tip.get("match_info")
                bet_type = tip.get("bet_type")
                confidence = tip.get("confidence")
                self.log_result("Create Admin Analysis", True, f"Analysis created: {match_info} - Bet: {bet_type} ({confidence}%)")
                return True
            else:
                error_msg = response.json().get("detail", "Unknown error") if response.content else f"Status {response.status_code}"
                self.log_result("Create Admin Analysis", False, f"Analysis creation failed: {error_msg}")
                return False
        except Exception as e:
            self.log_result("Create Admin Analysis", False, f"Analysis creation request failed: {str(e)}")
            return False
    
    def test_get_admin_tips(self):
        """Test retrieving admin analysis"""
        if not self.admin_token:
            self.log_result("Get Admin Analysis", False, "No admin token available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = self.session.get(f"{BASE_URL}/admin/analysis", headers=headers)
            
            if response.status_code == 200:
                tips = response.json()
                if len(tips) > 0:
                    tip = tips[0]
                    self.log_result("Get Admin Analysis", True, f"Retrieved {len(tips)} analysis. Latest: {tip.get('match_info')}")
                    return True
                else:
                    self.log_result("Get Admin Analysis", True, "No analysis found (empty list)")
                    return True
            else:
                error_msg = response.json().get("detail", "Unknown error") if response.content else f"Status {response.status_code}"
                self.log_result("Get Admin Analysis", False, f"Failed to get analysis: {error_msg}")
                return False
        except Exception as e:
            self.log_result("Get Admin Analysis", False, f"Get analysis request failed: {str(e)}")
            return False
    
    def test_get_public_tips(self):
        """Test retrieving public analysis as regular user"""
        if not self.user_token:
            self.log_result("Get Public Analysis", False, "No user token available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.user_token}"}
            response = self.session.get(f"{BASE_URL}/analysis", headers=headers)
            
            if response.status_code == 200:
                tips = response.json()
                self.log_result("Get Public Analysis", True, f"User can access {len(tips)} public analysis")
                return True
            else:
                error_msg = response.json().get("detail", "Unknown error") if response.content else f"Status {response.status_code}"
                self.log_result("Get Public Analysis", False, f"Failed to get public analysis: {error_msg}")
                return False
        except Exception as e:
            self.log_result("Get Public Analysis", False, f"Get public analysis request failed: {str(e)}")
            return False
    
    def test_update_admin_tip(self):
        """Test updating admin analysis with result"""
        if not self.admin_token or not self.test_tip_id:
            self.log_result("Update Admin Analysis", False, "Missing admin token or analysis ID")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            update_data = {
                "result": "green"  # Green result
            }
            response = self.session.put(f"{BASE_URL}/admin/analysis/{self.test_tip_id}", json=update_data, headers=headers)
            
            if response.status_code == 200:
                tip = response.json()
                result = tip.get("result")
                self.log_result("Update Admin Analysis", True, f"Analysis updated - Result: {result}")
                return True
            else:
                error_msg = response.json().get("detail", "Unknown error") if response.content else f"Status {response.status_code}"
                self.log_result("Update Admin Analysis", False, f"Analysis update failed: {error_msg}")
                return False
        except Exception as e:
            self.log_result("Update Admin Analysis", False, f"Analysis update request failed: {str(e)}")
            return False
    
    def test_statistics_api(self):
        """Test statistics endpoint"""
        if not self.user_token:
            self.log_result("Statistics API", False, "No user token available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.user_token}"}
            response = self.session.get(f"{BASE_URL}/stats", headers=headers)
            
            if response.status_code == 200:
                stats = response.json()
                admin_stats = stats.get("admin_tips", {})
                ai_stats = stats.get("ai_predictions", {})
                
                admin_total = admin_stats.get("total", 0)
                admin_accuracy = admin_stats.get("accuracy", 0)
                ai_total = ai_stats.get("total", 0)
                ai_accuracy = ai_stats.get("accuracy", 0)
                
                self.log_result("Statistics API", True, 
                    f"Admin tips: {admin_total} total, {admin_accuracy}% accuracy | AI predictions: {ai_total} total, {ai_accuracy}% accuracy")
                return True
            else:
                error_msg = response.json().get("detail", "Unknown error") if response.content else f"Status {response.status_code}"
                self.log_result("Statistics API", False, f"Statistics request failed: {error_msg}")
                return False
        except Exception as e:
            self.log_result("Statistics API", False, f"Statistics request failed: {str(e)}")
            return False
    
    def test_role_based_access_control(self):
        """Test that regular users cannot access admin endpoints"""
        if not self.user_token:
            self.log_result("Role-Based Access Control", False, "No user token available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.user_token}"}
            
            # Try to access admin users endpoint
            response = self.session.get(f"{BASE_URL}/admin/users", headers=headers)
            
            if response.status_code == 403:
                error_msg = response.json().get("detail", "")
                if "admin" in error_msg.lower() or "negado" in error_msg.lower():
                    self.log_result("Role-Based Access Control", True, "Regular user correctly blocked from admin endpoint")
                    return True
                else:
                    self.log_result("Role-Based Access Control", False, f"Wrong error message: {error_msg}")
                    return False
            else:
                self.log_result("Role-Based Access Control", False, f"Should have been blocked but got status {response.status_code}")
                return False
        except Exception as e:
            self.log_result("Role-Based Access Control", False, f"Access control test failed: {str(e)}")
            return False
    
    def test_admin_deactivate_user(self):
        """Test admin can deactivate users"""
        if not self.admin_token or not self.test_user_id:
            self.log_result("Admin Deactivate User", False, "Missing admin token or user ID")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = self.session.post(f"{BASE_URL}/admin/deactivate-user/{self.test_user_id}", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                self.log_result("Admin Deactivate User", True, "User deactivated successfully", data.get("message"))
                return True
            else:
                error_msg = response.json().get("detail", "Unknown error") if response.content else f"Status {response.status_code}"
                self.log_result("Admin Deactivate User", False, f"User deactivation failed: {error_msg}")
                return False
        except Exception as e:
            self.log_result("Admin Deactivate User", False, f"User deactivation request failed: {str(e)}")
            return False
    
    def test_delete_admin_tip(self):
        """Test deleting admin tip"""
        if not self.admin_token or not self.test_tip_id:
            self.log_result("Delete Admin Tip", False, "Missing admin token or tip ID")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = self.session.delete(f"{BASE_URL}/admin/tips/{self.test_tip_id}", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                self.log_result("Delete Admin Tip", True, "Tip deleted successfully", data.get("message"))
                return True
            else:
                error_msg = response.json().get("detail", "Unknown error") if response.content else f"Status {response.status_code}"
                self.log_result("Delete Admin Tip", False, f"Tip deletion failed: {error_msg}")
                return False
        except Exception as e:
            self.log_result("Delete Admin Tip", False, f"Tip deletion request failed: {str(e)}")
            return False
    
    def test_create_valuable_tip(self):
        """Test creating valuable tips (PRIORITY TEST - user reported issue)"""
        if not self.admin_token:
            self.log_result("Create Valuable Tip", False, "No admin token available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = self.session.post(f"{BASE_URL}/admin/valuable-tips", json=TEST_VALUABLE_TIP_DATA, headers=headers)
            
            if response.status_code == 200:
                tip = response.json()
                self.test_valuable_tip_id = tip.get("id")
                title = tip.get("title")
                total_odds = tip.get("total_odds")
                self.log_result("Create Valuable Tip", True, f"Valuable tip created: {title} - Odds: {total_odds}")
                return True
            else:
                error_msg = response.json().get("detail", "Unknown error") if response.content else f"Status {response.status_code}"
                self.log_result("Create Valuable Tip", False, f"Valuable tip creation failed: {error_msg}")
                return False
        except Exception as e:
            self.log_result("Create Valuable Tip", False, f"Valuable tip creation request failed: {str(e)}")
            return False
    
    def test_get_admin_valuable_tips(self):
        """Test retrieving admin valuable tips"""
        if not self.admin_token:
            self.log_result("Get Admin Valuable Tips", False, "No admin token available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = self.session.get(f"{BASE_URL}/admin/valuable-tips", headers=headers)
            
            if response.status_code == 200:
                tips = response.json()
                if len(tips) > 0:
                    tip = tips[0]
                    self.log_result("Get Admin Valuable Tips", True, f"Retrieved {len(tips)} valuable tips. Latest: {tip.get('title')}")
                    return True
                else:
                    self.log_result("Get Admin Valuable Tips", True, "No valuable tips found (empty list)")
                    return True
            else:
                error_msg = response.json().get("detail", "Unknown error") if response.content else f"Status {response.status_code}"
                self.log_result("Get Admin Valuable Tips", False, f"Failed to get valuable tips: {error_msg}")
                return False
        except Exception as e:
            self.log_result("Get Admin Valuable Tips", False, f"Get valuable tips request failed: {str(e)}")
            return False
    
    def test_get_public_valuable_tips(self):
        """Test retrieving public valuable tips as regular user"""
        if not self.user_token:
            self.log_result("Get Public Valuable Tips", False, "No user token available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.user_token}"}
            response = self.session.get(f"{BASE_URL}/valuable-tips", headers=headers)
            
            if response.status_code == 200:
                tips = response.json()
                self.log_result("Get Public Valuable Tips", True, f"User can access {len(tips)} public valuable tips")
                return True
            else:
                error_msg = response.json().get("detail", "Unknown error") if response.content else f"Status {response.status_code}"
                self.log_result("Get Public Valuable Tips", False, f"Failed to get public valuable tips: {error_msg}")
                return False
        except Exception as e:
            self.log_result("Get Public Valuable Tips", False, f"Get public valuable tips request failed: {str(e)}")
            return False
    
    def test_update_valuable_tip(self):
        """Test updating valuable tip"""
        if not self.admin_token or not self.test_valuable_tip_id:
            self.log_result("Update Valuable Tip", False, "Missing admin token or valuable tip ID")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            update_data = {
                "stake_suggestion": "10-15% da banca (atualizado)"
            }
            response = self.session.put(f"{BASE_URL}/admin/valuable-tips/{self.test_valuable_tip_id}", json=update_data, headers=headers)
            
            if response.status_code == 200:
                tip = response.json()
                stake_suggestion = tip.get("stake_suggestion")
                self.log_result("Update Valuable Tip", True, f"Valuable tip updated - Stake suggestion: {stake_suggestion}")
                return True
            else:
                error_msg = response.json().get("detail", "Unknown error") if response.content else f"Status {response.status_code}"
                self.log_result("Update Valuable Tip", False, f"Valuable tip update failed: {error_msg}")
                return False
        except Exception as e:
            self.log_result("Update Valuable Tip", False, f"Valuable tip update request failed: {str(e)}")
            return False
    
    def test_delete_valuable_tip(self):
        """Test deleting valuable tip"""
        if not self.admin_token or not self.test_valuable_tip_id:
            self.log_result("Delete Valuable Tip", False, "Missing admin token or valuable tip ID")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = self.session.delete(f"{BASE_URL}/admin/valuable-tips/{self.test_valuable_tip_id}", headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                self.log_result("Delete Valuable Tip", True, "Valuable tip deleted successfully", data.get("message"))
                return True
            else:
                error_msg = response.json().get("detail", "Unknown error") if response.content else f"Status {response.status_code}"
                self.log_result("Delete Valuable Tip", False, f"Valuable tip deletion failed: {error_msg}")
                return False
        except Exception as e:
            self.log_result("Delete Valuable Tip", False, f"Valuable tip deletion request failed: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all backend tests in sequence"""
        print("🚀 Starting Núcleo Bets Backend API Tests")
        print("=" * 60)
        
        # Test sequence
        tests = [
            self.test_api_health,
            self.test_user_registration,
            self.test_user_login_before_approval,
            self.test_admin_login,
            self.test_admin_get_users,
            self.test_admin_approve_user,
            self.test_user_login_after_approval,
            self.test_protected_route_access,
            # PRIORITY TESTS - Valuable Tips (as requested in review)
            self.test_create_valuable_tip,
            self.test_get_admin_valuable_tips,
            self.test_get_public_valuable_tips,
            self.test_update_valuable_tip,
            # Regular tip tests
            self.test_create_admin_tip,
            self.test_get_admin_tips,
            self.test_get_public_tips,
            self.test_update_admin_tip,
            self.test_statistics_api,
            self.test_role_based_access_control,
            self.test_admin_deactivate_user,
            self.test_delete_admin_tip,
            self.test_delete_valuable_tip
        ]
        
        for test in tests:
            test()
            time.sleep(0.5)  # Small delay between tests
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for r in self.results if r["success"])
        total = len(self.results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        if total - passed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['message']}")
        
        return passed == total

if __name__ == "__main__":
    tester = NucleoBetstester()
    success = tester.run_all_tests()
    exit(0 if success else 1)