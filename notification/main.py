import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from twilio.rest import Client as TwilioClient
from dotenv import load_dotenv

load_dotenv()

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

twilio_client = TwilioClient(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

app = FastAPI()

class NotificationRequest(BaseModel):
    to: str
    message: str
    type: str  # 'sms' or 'voice'

@app.post("/notifications/send")
def send_notification(notification: NotificationRequest):
    if notification.type == "sms":
        try:
            twilio_client.messages.create(
                body=notification.message,
                from_=TWILIO_PHONE_NUMBER,
                to=notification.to
            )
            return {"status": "sent"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Twilio SMS error: {e}")
    elif notification.type == "voice":
        try:
            # Twilio will call and read out the message using text-to-speech
            twiml = f'<Response><Say>{notification.message}</Say></Response>'
            call = twilio_client.calls.create(
                twiml=twiml,
                to=notification.to,
                from_=TWILIO_PHONE_NUMBER
            )
            return {"status": "call placed", "sid": call.sid}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Twilio Voice error: {e}")
    else:
        raise HTTPException(status_code=400, detail="Unsupported notification type")
