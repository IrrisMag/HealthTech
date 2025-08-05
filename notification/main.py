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

# SMS Templates for credential delivery
CREDENTIAL_TEMPLATES = {
    "staff_credentials": {
        "en": (
            "🏥 Welcome to HealthTech, {full_name}!\n\n"
            "Your account has been created:\n"
            "📧 Email: {email}\n"
            "🔑 Password: {password}\n"
            "👤 Role: {role}\n\n"
            "Please login and change your password immediately.\n"
            "Web: https://healthtech-ui.netlify.app\n\n"
            "- Douala General Hospital"
        ),
        "fr": (
            "🏥 Bienvenue sur HealthTech, {full_name}!\n\n"
            "Votre compte a été créé:\n"
            "📧 Email: {email}\n"
            "🔑 Mot de passe: {password}\n"
            "👤 Rôle: {role}\n\n"
            "Veuillez vous connecter et changer votre mot de passe immédiatement.\n"
            "Web: https://healthtech-ui.netlify.app\n\n"
            "- Hôpital Général de Douala"
        )
    },
    "patient_credentials": {
        "en": (
            "🏥 Welcome to HealthTech Mobile, {full_name}!\n\n"
            "Your patient account has been created:\n"
            "📧 Email: {email}\n"
            "🔑 Password: {password}\n\n"
            "Download the HealthTech mobile app to:\n"
            "• Submit feedback\n"
            "• Chat with AI health assistant\n"
            "• View your medical information\n\n"
            "Please change your password after first login.\n\n"
            "- Douala General Hospital"
        ),
        "fr": (
            "🏥 Bienvenue sur HealthTech Mobile, {full_name}!\n\n"
            "Votre compte patient a été créé:\n"
            "📧 Email: {email}\n"
            "🔑 Mot de passe: {password}\n\n"
            "Téléchargez l'application mobile HealthTech pour:\n"
            "• Soumettre des commentaires\n"
            "• Discuter avec l'assistant santé IA\n"
            "• Voir vos informations médicales\n\n"
            "Veuillez changer votre mot de passe après la première connexion.\n\n"
            "- Hôpital Général de Douala"
        )
    },
    "account_approved": {
        "en": (
            "✅ Account Approved - {full_name}\n\n"
            "Your HealthTech account has been approved and activated!\n\n"
            "📧 Email: {email}\n"
            "👤 Role: {role}\n\n"
            "You can now login to access the system.\n"
            "Web: https://healthtech-ui.netlify.app\n\n"
            "- Douala General Hospital"
        ),
        "fr": (
            "✅ Compte Approuvé - {full_name}\n\n"
            "Votre compte HealthTech a été approuvé et activé!\n\n"
            "📧 Email: {email}\n"
            "👤 Rôle: {role}\n\n"
            "Vous pouvez maintenant vous connecter pour accéder au système.\n"
            "Web: https://healthtech-ui.netlify.app\n\n"
            "- Hôpital Général de Douala"
        )
    }
}

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "notification"}


class NotificationRequest(BaseModel):
    to: str
    message: str
    type: str  # 'sms' or 'voice'


class CredentialDeliveryRequest(BaseModel):
    to: str
    full_name: str
    email: str
    temporary_password: str
    role: str
    language: str = "en"  # Default to English


@app.post("/notifications/send")
def send_notification(notification: NotificationRequest):
    if notification.type == "sms":
        try:
            message = twilio_client.messages.create(
                body=notification.message,
                from_=TWILIO_PHONE_NUMBER,
                to=notification.to
            )
            return {
                "status": "sent",
                "sid": message.sid,
                "to": notification.to,
                "from": TWILIO_PHONE_NUMBER,
                "message_status": message.status
            }
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Twilio SMS error: {e}"
            )
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
            raise HTTPException(
                status_code=500, detail=f"Twilio Voice error: {e}"
            )
    else:
        raise HTTPException(
            status_code=400, detail="Unsupported notification type"
        )


@app.post("/notifications/send-credentials")
def send_user_credentials(request: CredentialDeliveryRequest):
    """
    Send login credentials to new users via SMS
    """
    try:
        # Determine template based on role
        if request.role == "patient":
            template_key = "patient_credentials"
        else:
            template_key = "staff_credentials"

        # Get template in requested language, fallback to English
        template = CREDENTIAL_TEMPLATES.get(template_key, {}).get(
            request.language,
            CREDENTIAL_TEMPLATES[template_key]["en"]
        )

        # Format the message
        message = template.format(
            full_name=request.full_name,
            email=request.email,
            password=request.temporary_password,
            role=request.role.title()
        )

        # Send SMS
        sms_message = twilio_client.messages.create(
            body=message,
            from_=TWILIO_PHONE_NUMBER,
            to=request.to
        )

        return {
            "status": "credentials_sent",
            "sid": sms_message.sid,
            "to": request.to,
            "role": request.role,
            "message_status": sms_message.status,
            "template_used": template_key,
            "language": request.language
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send credentials: {str(e)}"
        )


@app.post("/notifications/send-approval")
def send_account_approval(request: CredentialDeliveryRequest):
    """
    Send account approval notification via SMS
    """
    try:
        # Get approval template in requested language
        template = CREDENTIAL_TEMPLATES.get("account_approved", {}).get(
            request.language,
            CREDENTIAL_TEMPLATES["account_approved"]["en"]
        )

        # Format the message
        message = template.format(
            full_name=request.full_name,
            email=request.email,
            role=request.role.title()
        )

        # Send SMS
        sms_message = twilio_client.messages.create(
            body=message,
            from_=TWILIO_PHONE_NUMBER,
            to=request.to
        )

        return {
            "status": "approval_sent",
            "sid": sms_message.sid,
            "to": request.to,
            "role": request.role,
            "message_status": sms_message.status,
            "language": request.language
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to send approval notification: {str(e)}"
        )
