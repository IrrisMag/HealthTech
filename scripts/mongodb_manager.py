#!/usr/bin/env python3
"""
MongoDB Manager for HealthTech Platform
Manages databases, collections, and indexes across all services
"""

import os
import sys
from pymongo import MongoClient
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database configuration
DATABASES = {
    'analysis': 'reminderdb_analysis',
    'auth': 'reminderdb_auth', 
    'chatbot': 'reminderdb_chatbot',
    'data': 'reminderdb_data',
    'event': 'reminderdb_event',
    'feedback': 'reminderdb_feedback',
    'forecast': 'reminderdb_forecast',
    'notification': 'reminderdb_notification',
    'optimization': 'reminderdb_optimization',
    'reminder': 'reminderdb_reminder',
    'translation': 'reminderdb_translation'
}

# Collection schemas per service
COLLECTIONS = {
    'auth': [
        'users', 'audit_logs', 'security_events', 'login_attempts'
    ],
    'analysis': [
        'health_data', 'analysis_results', 'reports'
    ],
    'feedback': [
        'feedback', 'ratings', 'comments'
    ],
    'reminder': [
        'reminders', 'schedules', 'notifications'
    ],
    'notification': [
        'notifications', 'templates', 'delivery_logs'
    ],
    'chatbot': [
        'conversations', 'intents', 'responses'
    ],
    'data': [
        'patient_data', 'medical_records', 'vitals'
    ],
    'event': [
        'events', 'event_logs', 'schedules'
    ],
    'forecast': [
        'predictions', 'models', 'training_data'
    ],
    'optimization': [
        'optimization_jobs', 'results', 'parameters'
    ],
    'translation': [
        'translations', 'languages', 'dictionaries'
    ]
}


class MongoDBManager:
    def __init__(self, connection_string=None):
        """Initialize MongoDB manager"""
        self.connection_string = connection_string or os.getenv(
            'MONGODB_URI', 
            'mongodb://localhost:27017'
        )
        self.client = None
        
    def connect(self):
        """Connect to MongoDB"""
        try:
            self.client = MongoClient(self.connection_string)
            # Test connection
            self.client.admin.command('ping')
            logger.info(f"Connected to MongoDB: {self.connection_string}")
            return True
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            return False
    
    def list_databases(self):
        """List all databases"""
        if not self.client:
            return []
        
        db_list = self.client.list_database_names()
        healthtech_dbs = [db for db in db_list if db.startswith('reminderdb_')]
        return healthtech_dbs
    
    def create_databases(self):
        """Create all required databases and collections"""
        if not self.client:
            logger.error("Not connected to MongoDB")
            return False
        
        for service, db_name in DATABASES.items():
            logger.info(f"Setting up database: {db_name}")
            db = self.client[db_name]
            
            # Create collections for this service
            if service in COLLECTIONS:
                for collection_name in COLLECTIONS[service]:
                    if collection_name not in db.list_collection_names():
                        db.create_collection(collection_name)
                        logger.info(f"Created collection: {db_name}.{collection_name}")
        
        return True
    
    def create_indexes(self):
        """Create indexes for performance and security"""
        if not self.client:
            logger.error("Not connected to MongoDB")
            return False
        
        # Auth service indexes
        auth_db = self.client[DATABASES['auth']]
        
        # Users collection
        users = auth_db['users']
        users.create_index("email", unique=True)
        users.create_index("employee_id")
        users.create_index("role")
        users.create_index("department")
        users.create_index("is_active")
        
        # Audit logs
        audit_logs = auth_db['audit_logs']
        audit_logs.create_index("timestamp")
        audit_logs.create_index("user_id")
        audit_logs.create_index("action")
        
        # Common indexes for other services
        for service, db_name in DATABASES.items():
            if service == 'auth':
                continue
                
            db = self.client[db_name]
            
            # Create common indexes
            for collection_name in COLLECTIONS.get(service, []):
                if collection_name in db.list_collection_names():
                    collection = db[collection_name]
                    
                    # Common timestamp index
                    try:
                        collection.create_index("created_at")
                        collection.create_index("updated_at")
                    except:
                        pass  # Index might not be applicable
        
        logger.info("Indexes created successfully")
        return True
    
    def get_database_stats(self):
        """Get statistics for all databases"""
        if not self.client:
            return {}
        
        stats = {}
        for service, db_name in DATABASES.items():
            try:
                db = self.client[db_name]
                db_stats = db.command("dbStats")
                
                stats[service] = {
                    'database': db_name,
                    'collections': db_stats.get('collections', 0),
                    'objects': db_stats.get('objects', 0),
                    'dataSize': db_stats.get('dataSize', 0),
                    'storageSize': db_stats.get('storageSize', 0)
                }
            except Exception as e:
                logger.error(f"Error getting stats for {db_name}: {e}")
                stats[service] = {'error': str(e)}
        
        return stats
    
    def backup_database(self, service, backup_path=None):
        """Backup a specific database"""
        if service not in DATABASES:
            logger.error(f"Unknown service: {service}")
            return False
        
        db_name = DATABASES[service]
        backup_path = backup_path or f"./backups/{db_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # This would typically use mongodump
        logger.info(f"Backup command for {db_name}:")
        logger.info(f"mongodump --uri='{self.connection_string}' --db={db_name} --out={backup_path}")
        
        return True
    
    def close(self):
        """Close MongoDB connection"""
        if self.client:
            self.client.close()
            logger.info("MongoDB connection closed")


def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description='MongoDB Manager for HealthTech Platform')
    parser.add_argument('--action', choices=['setup', 'stats', 'list', 'backup'], 
                       default='setup', help='Action to perform')
    parser.add_argument('--service', help='Service name for backup')
    parser.add_argument('--uri', help='MongoDB connection URI')
    
    args = parser.parse_args()
    
    # Initialize manager
    manager = MongoDBManager(args.uri)
    
    if not manager.connect():
        sys.exit(1)
    
    try:
        if args.action == 'setup':
            logger.info("Setting up databases and collections...")
            manager.create_databases()
            manager.create_indexes()
            logger.info("Setup completed successfully")
            
        elif args.action == 'stats':
            logger.info("Getting database statistics...")
            stats = manager.get_database_stats()
            for service, data in stats.items():
                print(f"\n{service.upper()}:")
                for key, value in data.items():
                    print(f"  {key}: {value}")
                    
        elif args.action == 'list':
            logger.info("Listing HealthTech databases...")
            dbs = manager.list_databases()
            for db in dbs:
                print(f"  - {db}")
                
        elif args.action == 'backup':
            if not args.service:
                logger.error("Service name required for backup")
                sys.exit(1)
            manager.backup_database(args.service)
            
    finally:
        manager.close()


if __name__ == "__main__":
    main()
