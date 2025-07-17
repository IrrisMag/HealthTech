import os
from datetime import datetime, timedelta, date, time as dt_time
from typing import List
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from pymongo import MongoClient
from dotenv import load_dotenv
from apscheduler.schedulers.background import BackgroundScheduler
import requests
import pytz

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("DB_NAME")
NOTIFICATION_SERVICE_URL = os.getenv("NOTIFICATION_SERVICE_URL", "http://notification:8000/notifications/send")
TRANSLATION_SERVICE_URL = os.getenv("TRANSLATION_SERVICE_URL", "http://translation:8000/translate")

mongo_client = MongoClient(MONGODB_URI)
db = mongo_client[DB_NAME]
reminders = db["reminders"]

scheduler = BackgroundScheduler(timezone="Africa/Lagos")  # GMT+1
scheduler.start()


app = FastAPI()


LANGUAGES = ["fr", "en", "bassa", "ewondo", "nguemba"]

HARDCODED_TRANSLATIONS = {
    "appointment": {
        "en": "Hello{name}! 😊 Just a reminder that you have an appointment on {date} at {time} in room {room} with Dr. {doctor} at Douala General Hospital. We're looking forward to seeing you!",
        "fr": "Bonjour{name} ! 😊 Petit rappel : vous avez un rendez-vous le {date} à {time} dans la salle {room} avec le Dr {doctor} à l'Hopitâl Dénéral de Douala. Nous avons hâte de vous voir !",
        "bassa": "O bɛ́ nɛ́ rendez-vous bɛ́ {date} nɛ {time}.",
        "ewondo": "O zɔ rendez-vous na {date} na {time}.",
        "nguemba": "Wɛ́ nɛ rendez-vous nɛ {date} nɛ {time}."
    },
    "medication": {
        "en": "Hi{name}! 🌟 It's time to take your medication: {medication_name}, {dosage}. Take care of yourself!",
        "fr": "Bonjour{name} ! 🌟 Il est temps de prendre votre médicament : {medication_name}, {dosage}. Prenez soin de vous !",
        "bassa": "O bɛ́ nɛ́ yɔ́kɔ́ médicament : {medication_name}, {dosage}.",
        "ewondo": "O bɛ́ nɛ́ yɔ́kɔ́ médicament : {medication_name}, {dosage}.",
        "nguemba": "Wɛ́ nɛ yɔ́kɔ́ médicament : {medication_name}, {dosage}."
    }
}


class AppointmentReminderRequest(BaseModel):
    patient_id: str
    patient_phone: str
    patient_language: str = Field(..., pattern="^(fr|en|bassa|ewondo|nguemba)$")
    appointment_time: datetime
    room: str
    doctor: str
    message: str = None


class Medication(BaseModel):
    name: str
    dosage: str  # e.g., "1 pill"
    times: List[str]  # e.g., ["08:00", "14:00", "20:00"]


class MedicationReminderRequest(BaseModel):
    patient_id: str
    patient_phone: str
    patient_language: str = Field(..., pattern="^(fr|en|bassa|ewondo|nguemba)$")
    medications: List[Medication]
    start_date: date
    end_date: date
    message: str = None


def translate_message(message_type: str, message: str, lang: str, **kwargs) -> str:
    # Try translation service first
    if lang == "en":
        return message.format(**kwargs)
    try:
        resp = requests.post(TRANSLATION_SERVICE_URL, json={"text": message.format(**kwargs), "lang": lang})
        if resp.status_code == 200:
            translated = resp.json().get("translated")
            if translated and translated != message.format(**kwargs):
                return translated
    except Exception:
        pass
    # Fallback to hardcoded
    fallback = HARDCODED_TRANSLATIONS.get(message_type, {}).get(lang)
    if fallback:
        return fallback.format(**kwargs)
    return message.format(**kwargs)


def send_notification(to: str, body: str):
    try:
        resp = requests.post(
            NOTIFICATION_SERVICE_URL,
            json={"to": to, "message": body, "type": "sms"},
            timeout=5
        )
        if resp.status_code != 200:
            raise Exception(f"Notification service error: {resp.text}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send notification: {e}")


def schedule_notification(to: str, body: str, send_time: datetime):
    job_id = f"reminder_{to}_{send_time.timestamp()}"
    scheduler.add_job(send_notification, 'date', run_date=send_time, args=[to, body], id=job_id, replace_existing=True)


@app.post("/reminders/appointment")
def create_appointment_reminder(reminder: AppointmentReminderRequest):
    # Use GMT+1
    tz = pytz.timezone("Africa/Lagos")
    appt_time = reminder.appointment_time.astimezone(tz)
    date_str = appt_time.strftime("%Y-%m-%d")
    time_str = appt_time.strftime("%H:%M")
    base_msg = reminder.message or HARDCODED_TRANSLATIONS["appointment"]["en"]
    msg = translate_message(
        "appointment",
        base_msg,
        reminder.patient_language,
        date=date_str,
        time=time_str,
        room=reminder.room,
        doctor=reminder.doctor
    )
    # Save to DB
    reminders.insert_one({"type": "appointment", **reminder.dict(), "created_at": datetime.now()})
    # Send now
    send_notification(reminder.patient_phone, msg)
    # Schedule 2 days before
    two_days_before = appt_time - timedelta(days=2)
    if two_days_before > datetime.now(tz):
        schedule_notification(reminder.patient_phone, msg, two_days_before)
    # Schedule 2 hours before
    two_hours_before = appt_time - timedelta(hours=2)
    if two_hours_before > datetime.now(tz):
        schedule_notification(reminder.patient_phone, msg, two_hours_before)
    return {"status": "scheduled"}


@app.post("/reminders/medication")
def create_medication_reminder(reminder: MedicationReminderRequest):
    tz = pytz.timezone("Africa/Lagos")
    # Save to DB
    reminders.insert_one({"type": "medication", **reminder.dict(), "created_at": datetime.now()})
    # For each day in range
    current = reminder.start_date
    while current <= reminder.end_date:
        for med in reminder.medications:
            for t in med.times:
                hour, minute = map(int, t.split(":"))
                send_time = tz.localize(datetime.combine(current, dt_time(hour, minute)))
                base_msg = reminder.message or HARDCODED_TRANSLATIONS["medication"]["en"]
                msg = translate_message("medication", base_msg,
                                        reminder.patient_language, medication_name=med.name, dosage=med.dosage)
                # Send now if today and time is in the future
                if current == date.today() and send_time > datetime.now(tz):
                    send_notification(reminder.patient_phone, msg)
                # Schedule for future
                if send_time > datetime.now(tz):
                    schedule_notification(reminder.patient_phone, msg, send_time)
        current += timedelta(days=1)
    return {"status": "scheduled"}


@app.get("/reminders/")
def list_reminders():
    return list(reminders.find({}, {"_id": 0}))
