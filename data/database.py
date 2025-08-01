"""
Database configuration and connection management for Blood Bank Data Service
"""

import os
import logging
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Environment variables - aligned with existing system configuration
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "reminderdb_data")  # Following existing naming pattern
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

class DatabaseManager:
    """Database connection and management class"""
    
    def __init__(self):
        self.client: Optional[AsyncIOMotorClient] = None
        self.database: Optional[AsyncIOMotorDatabase] = None
        
    async def connect_to_database(self):
        """Create database connection"""
        try:
            self.client = AsyncIOMotorClient(
                MONGODB_URI,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=5000,
                socketTimeoutMS=5000,
                maxPoolSize=50,
                minPoolSize=5
            )
            
            # Test the connection
            await self.client.admin.command('ping')
            self.database = self.client[DB_NAME]
            
            # Create indexes for better performance
            await self.create_indexes()
            
            logger.info(f"Successfully connected to MongoDB database: {DB_NAME}")
            
        except (ConnectionFailure, ServerSelectionTimeoutError) as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error connecting to database: {e}")
            raise
    
    async def close_database_connection(self):
        """Close database connection"""
        if self.client:
            self.client.close()
            logger.info("Database connection closed")
    
    async def create_indexes(self):
        """Create database indexes for optimal performance"""
        if self.database is None:
            return
            
        try:
            # Donor demographics indexes
            await self.database.donor_demographics.create_index("donor_id", unique=True)
            await self.database.donor_demographics.create_index("email", unique=True, sparse=True)
            await self.database.donor_demographics.create_index("phone_number")
            await self.database.donor_demographics.create_index("created_at")
            
            # Clinical data indexes
            await self.database.clinical_data.create_index("donor_id")
            await self.database.clinical_data.create_index("blood_type")
            await self.database.clinical_data.create_index("eligibility_status")
            await self.database.clinical_data.create_index("created_at")
            
            # Blood donations indexes
            await self.database.blood_donations.create_index("donation_id", unique=True)
            await self.database.blood_donations.create_index("donor_id")
            await self.database.blood_donations.create_index("donation_date")
            await self.database.blood_donations.create_index("donation_type")
            await self.database.blood_donations.create_index("collection_site")
            
            # Blood inventory indexes
            await self.database.blood_inventory.create_index("inventory_id", unique=True)
            await self.database.blood_inventory.create_index("donation_id")
            await self.database.blood_inventory.create_index("blood_type")
            await self.database.blood_inventory.create_index("component_type")
            await self.database.blood_inventory.create_index("status")
            await self.database.blood_inventory.create_index("expiry_date")
            await self.database.blood_inventory.create_index("collection_date")
            await self.database.blood_inventory.create_index("storage_location")
            await self.database.blood_inventory.create_index("bag_number", unique=True)
            
            # Compound indexes for common queries
            await self.database.blood_inventory.create_index([
                ("blood_type", 1),
                ("component_type", 1),
                ("status", 1)
            ])
            
            await self.database.blood_inventory.create_index([
                ("status", 1),
                ("expiry_date", 1)
            ])
            
            # Blood requests indexes
            await self.database.blood_requests.create_index("request_id", unique=True)
            await self.database.blood_requests.create_index("patient_id")
            await self.database.blood_requests.create_index("requesting_department")
            await self.database.blood_requests.create_index("blood_type")
            await self.database.blood_requests.create_index("priority")
            await self.database.blood_requests.create_index("status")
            await self.database.blood_requests.create_index("requested_date")
            await self.database.blood_requests.create_index("required_by")
            
            # DHIS2 sync records indexes
            await self.database.dhis2_sync_records.create_index("sync_id", unique=True)
            await self.database.dhis2_sync_records.create_index("sync_type")
            await self.database.dhis2_sync_records.create_index("sync_status")
            await self.database.dhis2_sync_records.create_index("sync_started")
            
            logger.info("Database indexes created successfully")
            
        except Exception as e:
            logger.error(f"Error creating database indexes: {e}")
            # Don't raise here as the application can still function without indexes
    
    def get_database(self) -> AsyncIOMotorDatabase:
        """Get database instance"""
        if self.database is None:
            raise RuntimeError("Database not connected. Call connect_to_database() first.")
        return self.database
    
    async def health_check(self) -> dict:
        """Check database health"""
        try:
            if not self.client:
                return {"status": "disconnected", "error": "No database connection"}
            
            # Ping the database
            await self.client.admin.command('ping')
            
            # Get database stats
            stats = await self.database.command("dbStats")
            
            return {
                "status": "healthy",
                "database": DB_NAME,
                "collections": stats.get("collections", 0),
                "data_size": stats.get("dataSize", 0),
                "storage_size": stats.get("storageSize", 0),
                "indexes": stats.get("indexes", 0)
            }
            
        except Exception as e:
            logger.error(f"Database health check failed: {e}")
            return {
                "status": "unhealthy",
                "error": str(e)
            }

# Global database manager instance
db_manager = DatabaseManager()

async def get_database() -> AsyncIOMotorDatabase:
    """Dependency to get database instance"""
    return db_manager.get_database()

# Collection helper functions
def convert_objectid(doc):
    """Convert ObjectId to string for JSON serialization"""
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc

def convert_objectid_list(docs):
    """Convert ObjectId to string for a list of documents"""
    return [convert_objectid(doc) for doc in docs]

# Database startup and shutdown events
async def startup_database():
    """Initialize database connection on startup"""
    await db_manager.connect_to_database()

async def shutdown_database():
    """Close database connection on shutdown"""
    await db_manager.close_database_connection()
