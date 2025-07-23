import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")


client = MongoClient(MONGODB_URI)
db = client[DB_NAME]
users_collection = db["users"]
roles_collection = db["roles"]
