#!/usr/bin/env python3
"""
Comprehensive Database Population Script for HealthTech Platform
Populates all Track 1, Track 2, and Track 3 databases with realistic healthcare data
"""

import asyncio
import random
import requests
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any
import uuid
from faker import Faker
import pymongo
from pymongo import MongoClient

# Initialize Faker for realistic data generation
fake = Faker(['fr_FR', 'en_US'])  # French and English locales

# API Endpoints
TRACK1_API = "https://track1-production.up.railway.app"
TRACK2_API = "https://healthtech-production-4917.up.railway.app"
TRACK3_API = "https://track3-blood-bank-backend-production.up.railway.app"

# MongoDB Connection (adjust as needed)
MONGO_URI = "mongodb://localhost:27017"

class HealthTechDataPopulator:
    def __init__(self):
        self.client = MongoClient(MONGO_URI)
        
    def generate_users(self, count: int = 100) -> List[Dict]:
        """Generate realistic healthcare users"""
        users = []
        roles = ['doctor', 'nurse', 'admin', 'receptionist', 'patient', 'staff']
        departments = ['Emergency', 'Cardiology', 'Pediatrics', 'Surgery', 'ICU', 'Maternity', 'Oncology']
        
        for i in range(count):
            role = random.choice(roles)
            user = {
                "user_id": str(uuid.uuid4()),
                "email": fake.email(),
                "full_name": fake.name(),
                "phone": fake.phone_number(),
                "role": role,
                "department": random.choice(departments) if role != 'patient' else None,
                "employee_id": f"EMP{1000 + i}" if role != 'patient' else None,
                "patient_id": f"PAT{2000 + i}" if role == 'patient' else None,
                "date_of_birth": fake.date_of_birth(minimum_age=18, maximum_age=80),
                "gender": random.choice(['M', 'F']),
                "address": fake.address(),
                "emergency_contact": fake.phone_number(),
                "created_at": fake.date_time_between(start_date='-2y', end_date='now'),
                "is_active": random.choice([True, True, True, False]),  # 75% active
                "last_login": fake.date_time_between(start_date='-30d', end_date='now'),
                "password_hash": "$2b$12$example_hash_for_demo_purposes"
            }
            users.append(user)
        return users
    
    def generate_feedback(self, users: List[Dict], count: int = 500) -> List[Dict]:
        """Generate patient feedback data"""
        feedback_list = []
        categories = ['service_quality', 'wait_time', 'staff_behavior', 'cleanliness', 'facilities']
        sentiments = ['positive', 'neutral', 'negative']
        languages = ['fr', 'en', 'douala', 'bassa', 'ewondo']
        
        for i in range(count):
            patient = random.choice([u for u in users if u['role'] == 'patient'])
            category = random.choice(categories)
            sentiment = random.choice(sentiments)
            
            # Generate realistic feedback based on sentiment
            if sentiment == 'positive':
                comments = [
                    "Excellent service, very satisfied with the care received",
                    "Staff was very professional and caring",
                    "Quick service, no long waiting times",
                    "Clean facilities and modern equipment"
                ]
            elif sentiment == 'negative':
                comments = [
                    "Long waiting time, need improvement",
                    "Staff could be more attentive",
                    "Facilities need better maintenance",
                    "Service was below expectations"
                ]
            else:
                comments = [
                    "Service was okay, room for improvement",
                    "Average experience, nothing special",
                    "Some good points, some areas to improve"
                ]
            
            feedback = {
                "feedback_id": str(uuid.uuid4()),
                "patient_id": patient['patient_id'],
                "patient_name": patient['full_name'],
                "category": category,
                "rating": random.randint(1, 5),
                "comment": random.choice(comments),
                "language": random.choice(languages),
                "sentiment": sentiment,
                "sentiment_score": random.uniform(-1, 1),
                "department": random.choice(['Emergency', 'Cardiology', 'Pediatrics', 'Surgery']),
                "visit_date": fake.date_between(start_date='-6m', end_date='today'),
                "submitted_at": fake.date_time_between(start_date='-6m', end_date='now'),
                "status": random.choice(['new', 'reviewed', 'resolved']),
                "priority": random.choice(['low', 'medium', 'high']),
                "tags": random.sample(['urgent', 'follow_up', 'complaint', 'suggestion', 'praise'], k=random.randint(1, 3))
            }
            feedback_list.append(feedback)
        return feedback_list
    
    def generate_reminders(self, users: List[Dict], count: int = 300) -> List[Dict]:
        """Generate appointment reminders"""
        reminders = []
        reminder_types = ['appointment', 'medication', 'follow_up', 'vaccination', 'checkup']
        statuses = ['scheduled', 'sent', 'delivered', 'failed']
        
        for i in range(count):
            patient = random.choice([u for u in users if u['role'] == 'patient'])
            doctor = random.choice([u for u in users if u['role'] == 'doctor'])
            
            appointment_date = fake.date_time_between(start_date='now', end_date='+3m')
            
            reminder = {
                "reminder_id": str(uuid.uuid4()),
                "patient_id": patient['patient_id'],
                "patient_name": patient['full_name'],
                "patient_phone": patient['phone'],
                "doctor_id": doctor.get('employee_id'),
                "doctor_name": doctor['full_name'],
                "appointment_date": appointment_date,
                "reminder_type": random.choice(reminder_types),
                "message": f"Reminder: You have an appointment on {appointment_date.strftime('%Y-%m-%d %H:%M')}",
                "language": random.choice(['fr', 'en']),
                "delivery_method": random.choice(['sms', 'voice', 'email']),
                "status": random.choice(statuses),
                "scheduled_for": appointment_date - timedelta(days=1),
                "sent_at": fake.date_time_between(start_date='-30d', end_date='now') if random.choice([True, False]) else None,
                "created_at": fake.date_time_between(start_date='-60d', end_date='now'),
                "priority": random.choice(['low', 'medium', 'high']),
                "department": doctor['department']
            }
            reminders.append(reminder)
        return reminders
    
    def generate_blood_donors(self, count: int = 200) -> List[Dict]:
        """Generate blood donor data for Track 3"""
        donors = []
        blood_types = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
        
        for i in range(count):
            donor = {
                "donor_id": f"DON{3000 + i}",
                "full_name": fake.name(),
                "date_of_birth": fake.date_of_birth(minimum_age=18, maximum_age=65),
                "gender": random.choice(['M', 'F']),
                "blood_type": random.choice(blood_types),
                "phone": fake.phone_number(),
                "email": fake.email(),
                "address": fake.address(),
                "emergency_contact": fake.phone_number(),
                "weight": random.uniform(50.0, 120.0),
                "height": random.uniform(150.0, 200.0),
                "is_eligible": random.choice([True, True, True, False]),  # 75% eligible
                "last_donation_date": fake.date_between(start_date='-1y', end_date='today'),
                "total_donations": random.randint(1, 50),
                "medical_conditions": random.sample(['none', 'hypertension', 'diabetes', 'anemia'], k=1),
                "created_at": fake.date_time_between(start_date='-2y', end_date='now'),
                "updated_at": fake.date_time_between(start_date='-30d', end_date='now')
            }
            donors.append(donor)
        return donors
    
    def generate_blood_inventory(self, donors: List[Dict], count: int = 400) -> List[Dict]:
        """Generate blood inventory data"""
        inventory = []
        blood_types = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
        component_types = ['whole_blood', 'red_cells', 'plasma', 'platelets']
        statuses = ['available', 'reserved', 'expired', 'used']
        
        for i in range(count):
            collection_date = fake.date_between(start_date='-6m', end_date='today')
            expiry_date = collection_date + timedelta(days=random.randint(35, 42))  # Blood shelf life
            
            inventory_item = {
                "inventory_id": f"INV{4000 + i}",
                "donation_id": f"DON{random.randint(1000, 9999)}",
                "blood_type": random.choice(blood_types),
                "component_type": random.choice(component_types),
                "volume": random.uniform(200.0, 500.0),
                "status": random.choice(statuses),
                "collection_date": collection_date,
                "expiry_date": expiry_date,
                "storage_location": f"Fridge-{random.randint(1, 10)}-Shelf-{random.randint(1, 5)}",
                "storage_temperature": random.uniform(2.0, 6.0),
                "bag_number": f"BAG{random.randint(10000, 99999)}",
                "quality_check_passed": random.choice([True, True, True, False]),  # 75% pass
                "units_available": random.randint(0, 10) if random.choice([True, False]) else 0,
                "created_at": collection_date,
                "updated_at": fake.date_time_between(start_date=collection_date, end_date='now')
            }
            inventory.append(inventory_item)
        return inventory
    
    def generate_blood_requests(self, count: int = 150) -> List[Dict]:
        """Generate blood requests"""
        requests = []
        blood_types = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
        departments = ['Emergency', 'Surgery', 'ICU', 'Maternity', 'Oncology']
        priorities = ['low', 'medium', 'high', 'critical']
        statuses = ['pending', 'approved', 'fulfilled', 'cancelled']
        
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
                "reason": random.choice(['Surgery', 'Trauma', 'Anemia', 'Cancer Treatment', 'Childbirth']),
                "requested_date": fake.date_time_between(start_date='-30d', end_date='now'),
                "needed_by": fake.date_time_between(start_date='now', end_date='+7d'),
                "notes": fake.text(max_nb_chars=200),
                "created_at": fake.date_time_between(start_date='-30d', end_date='now')
            }
            requests.append(request)
        return requests

    async def populate_all_databases(self):
        """Main method to populate all databases"""
        print("🚀 Starting HealthTech Database Population...")
        
        # Generate base data
        print("📊 Generating users...")
        users = self.generate_users(100)
        
        print("💬 Generating feedback...")
        feedback = self.generate_feedback(users, 500)
        
        print("⏰ Generating reminders...")
        reminders = self.generate_reminders(users, 300)
        
        print("🩸 Generating blood donors...")
        donors = self.generate_blood_donors(200)
        
        print("📦 Generating blood inventory...")
        inventory = self.generate_blood_inventory(donors, 400)
        
        print("📋 Generating blood requests...")
        requests = self.generate_blood_requests(150)
        
        # Populate databases
        await self.populate_track1_db(users, feedback, reminders)
        await self.populate_track3_db(donors, inventory, requests)
        
        print("✅ Database population completed!")
        print(f"📈 Generated: {len(users)} users, {len(feedback)} feedback, {len(reminders)} reminders")
        print(f"🩸 Generated: {len(donors)} donors, {len(inventory)} inventory items, {len(requests)} requests")

    async def populate_track1_db(self, users: List[Dict], feedback: List[Dict], reminders: List[Dict]):
        """Populate Track 1 databases"""
        try:
            print("📝 Populating Track 1 databases...")

            # Auth database
            auth_db = self.client['healthtech_auth']
            auth_db['users'].delete_many({})  # Clear existing
            auth_db['users'].insert_many(users)
            print(f"✅ Inserted {len(users)} users into auth database")

            # Feedback database
            feedback_db = self.client['healthtech_feedback']
            feedback_db['feedback'].delete_many({})
            feedback_db['feedback'].insert_many(feedback)
            print(f"✅ Inserted {len(feedback)} feedback records")

            # Reminders database
            reminder_db = self.client['healthtech_reminders']
            reminder_db['reminders'].delete_many({})
            reminder_db['reminders'].insert_many(reminders)
            print(f"✅ Inserted {len(reminders)} reminders")

            # Generate notifications based on reminders
            notifications = []
            for reminder in reminders[:100]:  # Sample notifications
                notification = {
                    "notification_id": str(uuid.uuid4()),
                    "reminder_id": reminder['reminder_id'],
                    "patient_id": reminder['patient_id'],
                    "message": reminder['message'],
                    "delivery_method": reminder['delivery_method'],
                    "status": random.choice(['sent', 'delivered', 'failed']),
                    "sent_at": fake.date_time_between(start_date='-30d', end_date='now'),
                    "delivered_at": fake.date_time_between(start_date='-30d', end_date='now') if random.choice([True, False]) else None,
                    "created_at": fake.date_time_between(start_date='-30d', end_date='now')
                }
                notifications.append(notification)

            notification_db = self.client['healthtech_notifications']
            notification_db['notifications'].delete_many({})
            notification_db['notifications'].insert_many(notifications)
            print(f"✅ Inserted {len(notifications)} notifications")

        except Exception as e:
            print(f"❌ Error populating Track 1 databases: {e}")

    async def populate_track3_db(self, donors: List[Dict], inventory: List[Dict], requests: List[Dict]):
        """Populate Track 3 blood bank databases"""
        try:
            print("🩸 Populating Track 3 blood bank databases...")

            # Blood bank database
            blood_db = self.client['blood_bank_db']

            # Donors
            blood_db['donors'].delete_many({})
            blood_db['donors'].insert_many(donors)
            print(f"✅ Inserted {len(donors)} donors")

            # Inventory
            blood_db['inventory'].delete_many({})
            blood_db['inventory'].insert_many(inventory)
            print(f"✅ Inserted {len(inventory)} inventory items")

            # Requests
            blood_db['requests'].delete_many({})
            blood_db['requests'].insert_many(requests)
            print(f"✅ Inserted {len(requests)} blood requests")

            # Generate donations based on donors
            donations = []
            for i, donor in enumerate(donors[:150]):  # Generate donations for 150 donors
                donation = {
                    "donation_id": f"DONATION{6000 + i}",
                    "donor_id": donor['donor_id'],
                    "donation_date": fake.date_between(start_date='-1y', end_date='today'),
                    "donation_type": random.choice(['whole_blood', 'plasma', 'platelets']),
                    "volume_collected": random.uniform(400.0, 500.0),
                    "collection_site": "Douala General Hospital",
                    "staff_id": f"STAFF{random.randint(100, 999)}",
                    "collection_time": random.randint(8, 15),
                    "adverse_reactions": random.choice([False, False, False, True]),  # 25% chance
                    "screening_results": {
                        "hiv": "negative",
                        "hepatitis_b": "negative",
                        "hepatitis_c": "negative",
                        "syphilis": "negative"
                    },
                    "created_at": fake.date_time_between(start_date='-1y', end_date='now')
                }
                donations.append(donation)

            blood_db['donations'].delete_many({})
            blood_db['donations'].insert_many(donations)
            print(f"✅ Inserted {len(donations)} donations")

        except Exception as e:
            print(f"❌ Error populating Track 3 databases: {e}")

    async def send_api_data(self):
        """Send data directly to APIs"""
        print("🌐 Sending data to live APIs...")

        try:
            # Test Track 1 API
            response = requests.get(f"{TRACK1_API}/health", timeout=10)
            if response.status_code == 200:
                print("✅ Track 1 API is accessible")
            else:
                print(f"⚠️ Track 1 API returned status {response.status_code}")
        except Exception as e:
            print(f"❌ Track 1 API error: {e}")

        try:
            # Test Track 3 API
            response = requests.get(f"{TRACK3_API}/health", timeout=10)
            if response.status_code == 200:
                print("✅ Track 3 API is accessible")
            else:
                print(f"⚠️ Track 3 API returned status {response.status_code}")
        except Exception as e:
            print(f"❌ Track 3 API error: {e}")

if __name__ == "__main__":
    populator = HealthTechDataPopulator()
    asyncio.run(populator.populate_all_databases())
