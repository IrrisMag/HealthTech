1. Create a .env.example file in the root directory and add the following variables:
    - MONGODB_URI=mongodb://mongo:27017
    - DB_NAME=dbname
    - TWILIO_ACCOUNT_SID=your_twilio_account_sid
    - TWILIO_PHONE_NUMBER=your_twilio_phone_number
    - TWILIO_AUTH_TOKEN=your_twilio_auth_token
2. For docker run:
    docker-compose up notification
3. For direct run (Debugging):
    cd /HealthTech/notification
    uvicorn main:app --host 0.0.0.0 --port 8000


