#!/usr/bin/env python3
"""
Script pour optimiser tous les requirements.txt avec des versions spécifiques
pour éviter le backtracking de pip et accélérer les builds Docker.
"""

import os
import glob

# Versions compatibles testées
OPTIMIZED_REQUIREMENTS = {
    "basic": """fastapi==0.115.0
uvicorn[standard]==0.30.6""",
    
    "with_mongo": """fastapi==0.115.0
uvicorn[standard]==0.30.6
motor==3.3.2
pymongo==4.6.1""",

    "with_auth": """fastapi==0.115.0
uvicorn[standard]==0.30.6
motor==3.3.2
pymongo==4.6.1
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6""",

    "with_scheduler": """fastapi==0.115.0
uvicorn[standard]==0.30.6
motor==3.3.2
pymongo==4.6.1
apscheduler==3.10.4
pytz==2023.3""",

    "with_twilio": """fastapi==0.115.0
uvicorn[standard]==0.30.6
twilio==8.10.0""",
    
    "full": """fastapi==0.115.0
uvicorn[standard]==0.30.6
motor==3.3.2
pymongo==4.6.1
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
apscheduler==3.10.4
pytz==2023.3
twilio==8.10.0
requests==2.31.0
python-dotenv==1.0.0"""
}

# Mapping des services vers leurs requirements
SERVICE_REQUIREMENTS = {
    "analysis": "basic",
    "auth": "with_auth", 
    "chatbot": "basic",
    "data": "basic",
    "event": "basic",
    "feedback": "with_mongo",
    "forecast": "basic",
    "notification": "with_twilio",
    "optimization": "basic",
    "reminder": "with_scheduler",
    "translation": "basic"
}

def update_requirements():
    """Met à jour tous les requirements.txt"""
    updated = []
    
    for service, req_type in SERVICE_REQUIREMENTS.items():
        req_file = f"{service}/requirements.txt"
        
        if os.path.exists(req_file):
            with open(req_file, 'w') as f:
                f.write(OPTIMIZED_REQUIREMENTS[req_type] + '\n')
            updated.append(req_file)
            print(f"✅ Updated {req_file} with {req_type} requirements")
        else:
            print(f"⚠️  {req_file} not found")
    
    print(f"\n🎉 Updated {len(updated)} requirements.txt files!")
    return updated

if __name__ == "__main__":
    update_requirements()
