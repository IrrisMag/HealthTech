import os
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

# MongoDB connection settings
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb+srv://farelrick22:inventory_optimization@cluster0.tgggfrc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
DATABASE_NAME = os.getenv("DATABASE_NAME", "inventory_optimization")

# Global client instance
client: AsyncIOMotorClient = None

async def connect_to_mongo():
    """Create database connection"""
    global client
    client = AsyncIOMotorClient(MONGODB_URL)
    
async def close_mongo_connection():
    """Close database connection"""
    global client
    if client:
        client.close()

def get_database() -> AsyncIOMotorDatabase:
    """Get database instance"""
    return client[DATABASE_NAME]
