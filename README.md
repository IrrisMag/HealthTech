This is a FASTAPI project for the CODE2CARE Hackaton. Bellow are the steps to run our project:

Prerequisites:
    - Docker
    - Docker Compose
    - Python 3.11
    - pip
    - virtualenv
    - pycharm (optional)
    - vscode (optional)
1. Clone the repository
2. Create a .env file in the root directory and add the following variables:
    - MONGODB_URI=mongodb://mongo:27017
    - DB_NAME=dbname
    - TWILIO_ACCOUNT_SID=your_twilio_account_sid
    - TWILIO_PHONE_NUMBER=your_twilio_phone_number
    - TWILIO_AUTH_TOKEN=your_twilio_auth_token
   
3. Run `docker-compose up --build` to start the whole project
4. Navigate to http://localhost:8080/ to access the Traefik dashboard