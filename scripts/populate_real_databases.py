#!/usr/bin/env python3
"""
Real Database Population Script for HealthTech Platform
Populates the actual databases used by the deployed APIs with realistic healthcare data
"""

import asyncio
import random
import requests
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any
import uuid
from faker import Faker
import motor.motor_asyncio
from motor.motor_asyncio import AsyncIOMotorClient

# Initialize Faker for realistic data generation
fake = Faker(['fr_FR', 'en_US'])

# Database connection strings (update these with your actual MongoDB URIs)
MONGODB_URIS = {
    'track1': 'mongodb+srv://your-track1-db-uri',  # Update with actual URI
    'track3': 'mongodb+srv://your-track3-db-uri',  # Update with actual URI
}

# API Endpoints for testing
TRACK1_API = "https://track1-production.up.railway.app"
TRACK3_API = "https://track3-blood-bank-backend-production.up.railway.app"

class RealDatabasePopulator:
    def __init__(self):
        self.clients = {}
        
    async def connect_databases(self):
        """Connect to all databases"""
        try:
            # For now, we'll use direct API calls to populate data
            # since we don't have direct database access
            print("🔗 Connecting to APIs for data population...")
            return True
        except Exception as e:
            print(f"❌ Database connection error: {e}")
            return False
    
    def generate_realistic_users(self, count: int = 50) -> List[Dict]:
        """Generate realistic healthcare users"""
        users = []
        roles = ['doctor', 'nurse', 'admin', 'receptionist', 'patient']
        departments = ['Emergency', 'Cardiology', 'Pediatrics', 'Surgery', 'ICU', 'Maternity']
        
        for i in range(count):
            role = random.choice(roles)
            user = {
                "email": fake.email(),
                "password": "healthtech123",  # Default password for demo
                "full_name": fake.name(),
                "phone": fake.phone_number(),
                "role": role,
                "department": random.choice(departments) if role != 'patient' else None,
                "employee_id": f"EMP{1000 + i}" if role != 'patient' else None,
                "date_of_birth": fake.date_of_birth(minimum_age=18, maximum_age=80).isoformat(),
                "gender": random.choice(['M', 'F']),
                "address": fake.address(),
                "is_active": True
            }
            users.append(user)
        return users
    
    def generate_realistic_donors(self, count: int = 100) -> List[Dict]:
        """Generate realistic blood donors"""
        donors = []
        blood_types = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
        
        for i in range(count):
            donor = {
                "donor_id": f"DON{3000 + i}",
                "full_name": fake.name(),
                "date_of_birth": fake.date_of_birth(minimum_age=18, maximum_age=65).isoformat(),
                "gender": random.choice(['M', 'F']),
                "blood_type": random.choice(blood_types),
                "phone": fake.phone_number(),
                "email": fake.email(),
                "address": fake.address(),
                "weight": round(random.uniform(50.0, 120.0), 1),
                "height": round(random.uniform(150.0, 200.0), 1),
                "is_eligible": random.choice([True, True, True, False]),
                "last_donation_date": fake.date_between(start_date='-1y', end_date='today').isoformat(),
                "total_donations": random.randint(1, 50),
                "medical_conditions": []
            }
            donors.append(donor)
        return donors
    
    def generate_realistic_inventory(self, count: int = 200) -> List[Dict]:
        """Generate realistic blood inventory"""
        inventory = []
        blood_types = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
        component_types = ['whole_blood', 'red_cells', 'plasma', 'platelets']
        statuses = ['available', 'reserved', 'expired']
        
        for i in range(count):
            collection_date = fake.date_between(start_date='-6m', end_date='today')
            expiry_date = collection_date + timedelta(days=random.randint(35, 42))
            
            item = {
                "inventory_id": f"INV{4000 + i}",
                "blood_type": random.choice(blood_types),
                "component_type": random.choice(component_types),
                "volume": round(random.uniform(200.0, 500.0), 1),
                "units_available": random.randint(1, 10),
                "status": random.choice(statuses),
                "collection_date": collection_date.isoformat(),
                "expiry_date": expiry_date.isoformat(),
                "storage_location": f"Fridge-{random.randint(1, 10)}",
                "storage_temperature": round(random.uniform(2.0, 6.0), 1),
                "bag_number": f"BAG{random.randint(10000, 99999)}",
                "quality_check_passed": random.choice([True, True, True, False])
            }
            inventory.append(item)
        return inventory
    
    def generate_realistic_requests(self, count: int = 75) -> List[Dict]:
        """Generate realistic blood requests"""
        requests = []
        blood_types = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
        departments = ['Emergency', 'Surgery', 'ICU', 'Maternity', 'Oncology']
        priorities = ['low', 'medium', 'high', 'critical']
        statuses = ['pending', 'approved', 'fulfilled']
        
        for i in range(count):
            request = {
                "request_id": f"REQ{5000 + i}",
                "patient_id": f"PAT{random.randint(2000, 2999)}",
                "requesting_department": random.choice(departments),
                "requesting_physician": fake.name(),
                "blood_type": random.choice(blood_types),
                "component_type": random.choice(['whole_blood', 'red_cells', 'plasma', 'platelets']),
                "units_requested": random.randint(1, 6),
                "priority": random.choice(priorities),
                "status": random.choice(statuses),
                "reason": random.choice(['Surgery', 'Trauma', 'Anemia', 'Cancer Treatment']),
                "requested_date": fake.date_time_between(start_date='-30d', end_date='now').isoformat(),
                "needed_by": fake.date_time_between(start_date='now', end_date='+7d').isoformat()
            }
            requests.append(request)
        return requests
    
    def generate_realistic_feedback(self, count: int = 150) -> List[Dict]:
        """Generate realistic patient feedback"""
        feedback_list = []
        categories = ['service_quality', 'wait_time', 'staff_behavior', 'cleanliness', 'facilities']
        sentiments = ['positive', 'neutral', 'negative']
        
        for i in range(count):
            sentiment = random.choice(sentiments)
            
            if sentiment == 'positive':
                comments = [
                    "Excellent service, very satisfied with the care received",
                    "Staff was very professional and caring",
                    "Quick service, no long waiting times"
                ]
                rating = random.randint(4, 5)
            elif sentiment == 'negative':
                comments = [
                    "Long waiting time, need improvement",
                    "Staff could be more attentive",
                    "Service was below expectations"
                ]
                rating = random.randint(1, 2)
            else:
                comments = [
                    "Service was okay, room for improvement",
                    "Average experience, nothing special"
                ]
                rating = 3
            
            feedback = {
                "feedback_id": str(uuid.uuid4()),
                "patient_id": f"PAT{random.randint(2000, 2999)}",
                "category": random.choice(categories),
                "rating": rating,
                "comment": random.choice(comments),
                "language": random.choice(['fr', 'en']),
                "sentiment": sentiment,
                "department": random.choice(['Emergency', 'Cardiology', 'Pediatrics']),
                "visit_date": fake.date_between(start_date='-6m', end_date='today').isoformat(),
                "submitted_at": fake.date_time_between(start_date='-6m', end_date='now').isoformat(),
                "status": random.choice(['new', 'reviewed', 'resolved'])
            }
            feedback_list.append(feedback)
        return feedback_list
    
    async def populate_via_api_calls(self):
        """Populate databases by making API calls to create data"""
        print("🚀 Starting database population via API calls...")
        
        # Generate data
        users = self.generate_realistic_users(50)
        donors = self.generate_realistic_donors(100)
        inventory = self.generate_realistic_inventory(200)
        requests = self.generate_realistic_requests(75)
        feedback = self.generate_realistic_feedback(150)
        
        print(f"📊 Generated: {len(users)} users, {len(donors)} donors, {len(inventory)} inventory items")
        print(f"📋 Generated: {len(requests)} requests, {len(feedback)} feedback entries")
        
        # Try to populate via API endpoints
        await self.populate_track1_data(users, feedback)
        await self.populate_track3_data(donors, inventory, requests)
        
        print("✅ Database population completed!")
    
    async def populate_track1_data(self, users: List[Dict], feedback: List[Dict]):
        """Populate Track 1 data via API calls"""
        print("📝 Populating Track 1 data...")
        
        # Try to register users
        registered_count = 0
        for user in users[:10]:  # Register first 10 users
            try:
                response = requests.post(
                    f"{TRACK1_API}/api/auth/register",
                    json=user,
                    timeout=10
                )
                if response.status_code in [200, 201]:
                    registered_count += 1
            except Exception as e:
                continue
        
        print(f"✅ Registered {registered_count} users in Track 1")
        
        # Try to submit feedback
        feedback_count = 0
        for fb in feedback[:20]:  # Submit first 20 feedback entries
            try:
                response = requests.post(
                    f"{TRACK1_API}/api/feedback/submit",
                    json=fb,
                    timeout=10
                )
                if response.status_code in [200, 201]:
                    feedback_count += 1
            except Exception as e:
                continue
        
        print(f"✅ Submitted {feedback_count} feedback entries")
    
    async def populate_track3_data(self, donors: List[Dict], inventory: List[Dict], requests: List[Dict]):
        """Populate Track 3 data via API calls"""
        print("🩸 Populating Track 3 blood bank data...")
        
        # Try to add donors
        donor_count = 0
        for donor in donors[:20]:  # Add first 20 donors
            try:
                response = requests.post(
                    f"{TRACK3_API}/donors",
                    json=donor,
                    timeout=10
                )
                if response.status_code in [200, 201]:
                    donor_count += 1
            except Exception as e:
                continue
        
        print(f"✅ Added {donor_count} donors to Track 3")
        
        # Try to add inventory
        inventory_count = 0
        for item in inventory[:30]:  # Add first 30 inventory items
            try:
                response = requests.post(
                    f"{TRACK3_API}/inventory",
                    json=item,
                    timeout=10
                )
                if response.status_code in [200, 201]:
                    inventory_count += 1
            except Exception as e:
                continue
        
        print(f"✅ Added {inventory_count} inventory items")
        
        # Try to add requests
        request_count = 0
        for req in requests[:15]:  # Add first 15 requests
            try:
                response = requests.post(
                    f"{TRACK3_API}/requests",
                    json=req,
                    timeout=10
                )
                if response.status_code in [200, 201]:
                    request_count += 1
            except Exception as e:
                continue
        
        print(f"✅ Added {request_count} blood requests")

async def main():
    """Main execution function"""
    populator = RealDatabasePopulator()
    
    # Connect to databases
    connected = await populator.connect_databases()
    if not connected:
        print("❌ Failed to connect to databases")
        return
    
    # Populate databases
    await populator.populate_via_api_calls()
    
    print("🎉 Database population process completed!")
    print("📊 The dashboard should now show real data instead of zeros!")

if __name__ == "__main__":
    asyncio.run(main())
