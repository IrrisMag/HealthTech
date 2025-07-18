import os
from datetime import datetime, timedelta, date, time as dt_time
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, Field
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv
from apscheduler.schedulers.background import BackgroundScheduler
import requests
import pytz


load_dotenv()


MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("DB_NAME")
NOTIFICATION_SERVICE_URL = os.getenv("NOTIFICATION_SERVICE_URL", "http://notification:8000/notifications/send")
# TRANSLATION_SERVICE_URL removed: translation service is no longer used


mongo_client = MongoClient(MONGODB_URI)
db = mongo_client[DB_NAME]
reminders = db["reminders"]


scheduler = BackgroundScheduler(timezone="Africa/Lagos")  # GMT+1
scheduler.start()


app = FastAPI()


LANGUAGES = ["fr", "en", "bassa", "ewondo", "nguemba"]


HARDCODED_TRANSLATIONS = {
    "appointment": {
        "en": (
            "Hello{name}! 😊 Just a reminder that you have an appointment on {date} at {time} "
            "in room {room} with Dr. {doctor} at Douala General Hospital. "
            "We're looking forward to seeing you!"
        ),
        "fr": (
            "Bonjour{name} ! 😊 Petit rappel : vous avez un rendez-vous le {date} à {time} "
            "dans la salle {room} avec le Dr {doctor} à l'Hôpital Général de Douala. "
            "Nous avons hâte de vous voir !"
        ),
        "bassa": (
            "Mbolo{name} ! 😊 Nda'a, o bɛ́ nɛ́ rendez-vous bɛ́ {date} nɛ {time} "
            "na salle {room} nɛ́ Docteur {doctor} na Douala General Hospital. "
            "Nda'a, o bɛ́ nɛ́ yɔ́kɔ́ !"
        ),
        "ewondo": (
            "Mbembe{name} ! 😊 Nda'a, o zɔ rendez-vous na {date} na {time} "
            "na salle {room} na Docteur {doctor} na Douala General Hospital. "
            "Nda'a, o zɔ yɔ́kɔ́ !"
        ),
        "nguemba": (
            "Wɛ́{name} ! 😊 Nda'a, wɛ́ nɛ rendez-vous nɛ {date} nɛ {time} "
            "na salle {room} nɛ Docteur {doctor} na Douala General Hospital. "
            "Nda'a, wɛ́ nɛ yɔ́kɔ́ !"
        )
    },
    "medication": {
        "en": "Hi{name}! 🌟 It's time to take your medication: {medication_name}, {dosage}. Take care of yourself!",
        "fr": "Bonjour{name} ! 🌟 Il est temps de prendre votre médicament : {medication_name}, {dosage}. Prenez soin de vous !",
        "bassa": "Mbolo{name} ! 🌟 Nda'a, o bɛ́ nɛ́ yɔ́kɔ́ médicament : {medication_name}, {dosage}. Nda'a, o bɛ́ nɛ́ yɔ́kɔ́ !",
        "ewondo": "Mbembe{name} ! 🌟 Nda'a, o bɛ́ nɛ́ yɔ́kɔ́ médicament : {medication_name}, {dosage}. Nda'a, o bɛ́ nɛ́ yɔ́kɔ́ !",
        "nguemba": "Wɛ́{name} ! 🌟 Nda'a, wɛ́ nɛ yɔ́kɔ́ médicament : {medication_name}, {dosage}. Nda'a, wɛ́ nɛ yɔ́kɔ́ !"
    }
}


class AppointmentReminderRequest(BaseModel):
    patient_id: str
    patient_name: str
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
    patient_name: str
    patient_phone: str
    patient_language: str = Field(..., pattern="^(fr|en|bassa|ewondo|nguemba)$")
    medications: List[Medication]
    start_date: date
    end_date: date
    message: str = None


class AppointmentReminderUpdate(BaseModel):
    patient_name: Optional[str] = None
    patient_phone: Optional[str] = None
    patient_language: Optional[str] = Field(None, pattern="^(fr|en|bassa|ewondo|nguemba)$")
    appointment_time: Optional[datetime] = None
    room: Optional[str] = None
    doctor: Optional[str] = None
    message: Optional[str] = None


class MedicationReminderUpdate(BaseModel):
    patient_phone: Optional[str] = None
    patient_language: Optional[str] = Field(None, pattern="^(fr|en|bassa|ewondo|nguemba)$")
    medications: Optional[List[Medication]] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    message: Optional[str] = None


class ReminderResponse(BaseModel):
    id: str
    type: str
    patient_id: str
    patient_phone: str
    patient_language: str
    created_at: datetime
    # Additional fields will be included based on reminder type



def translate_message(message_type: str, message: str, lang: str, **kwargs) -> str:
    # Use only hardcoded translations, no external translation service
    fallback = HARDCODED_TRANSLATIONS.get(message_type, {}).get(lang)
    if fallback:
        return fallback.format(**kwargs)
    # If no translation available, fallback to English
    fallback_en = HARDCODED_TRANSLATIONS.get(message_type, {}).get("en")
    if fallback_en:
        return fallback_en.format(**kwargs)
    # As a last resort, use the provided message
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



def convert_objectid_to_str(doc):
    """Convert MongoDB ObjectId to string for JSON serialization"""
    if doc and "_id" in doc:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
    return doc



def cancel_scheduled_jobs_for_reminder(reminder_id: str):
    """Cancel all scheduled jobs for a specific reminder"""
    try:
        # Get all jobs and filter by reminder ID pattern
        jobs = scheduler.get_jobs()
        for job in jobs:
            if reminder_id in job.id:
                scheduler.remove_job(job.id)
    except Exception as e:
        print(f"Error canceling jobs for reminder {reminder_id}: {e}")



def reschedule_appointment_notifications(reminder_data: dict):
    """Reschedule appointment notifications after update"""
    tz = pytz.timezone("Africa/Lagos")
    appt_time = reminder_data["appointment_time"]
    if isinstance(appt_time, str):
        appt_time = datetime.fromisoformat(appt_time.replace('Z', '+00:00'))
    appt_time = appt_time.astimezone(tz)

    date_str = appt_time.strftime("%Y-%m-%d")
    time_str = appt_time.strftime("%H:%M")
    base_msg = reminder_data.get("message") or HARDCODED_TRANSLATIONS["appointment"]["en"]
    msg = translate_message(
        "appointment",
        base_msg,
        reminder_data["patient_language"],
        date=date_str,
        time=time_str,
        room=reminder_data["room"],
        doctor=reminder_data["doctor"]
    )

    # Schedule 2 days before
    two_days_before = appt_time - timedelta(days=2)
    if two_days_before > datetime.now(tz):
        schedule_notification(reminder_data["patient_phone"], msg, two_days_before)

    # Schedule 2 hours before
    two_hours_before = appt_time - timedelta(hours=2)
    if two_hours_before > datetime.now(tz):
        schedule_notification(reminder_data["patient_phone"], msg, two_hours_before)



def reschedule_medication_notifications(reminder_data: dict):
    """Reschedule medication notifications after update"""
    tz = pytz.timezone("Africa/Lagos")
    start_date = reminder_data["start_date"]
    end_date = reminder_data["end_date"]

    if isinstance(start_date, str):
        start_date = datetime.fromisoformat(start_date).date()
    if isinstance(end_date, str):
        end_date = datetime.fromisoformat(end_date).date()

    current = start_date
    while current <= end_date:
        for med in reminder_data["medications"]:
            for t in med["times"]:
                hour, minute = map(int, t.split(":"))
                send_time = tz.localize(datetime.combine(current, dt_time(hour, minute)))
                base_msg = reminder_data.get("message") or HARDCODED_TRANSLATIONS["medication"]["en"]
                msg = translate_message("medication", base_msg,
                                        reminder_data["patient_language"],
                                        medication_name=med["name"],
                                        dosage=med["dosage"])

                # Schedule for future
                if send_time > datetime.now(tz):
                    schedule_notification(reminder_data["patient_phone"], msg, send_time)
        current += timedelta(days=1)



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
        name=reminder.patient_name,
        date=date_str,
        time=time_str,
        room=reminder.room,
        doctor=reminder.doctor
    )
    # Save to DB
    reminder_doc = {"type": "appointment", **reminder.dict(), "created_at": datetime.now()}
    result = reminders.insert_one(reminder_doc)

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

    # Return the created reminder
    created_reminder = reminders.find_one({"_id": result.inserted_id})
    return convert_objectid_to_str(created_reminder)



@app.post("/reminders/medication")
def create_medication_reminder(reminder: MedicationReminderRequest):
    tz = pytz.timezone("Africa/Lagos")
    # Convert start_date and end_date to ISO strings for MongoDB
    reminder_data = reminder.dict()
    reminder_data["start_date"] = reminder_data["start_date"].isoformat()
    reminder_data["end_date"] = reminder_data["end_date"].isoformat()
    reminder_doc = {"type": "medication", **reminder_data, "created_at": datetime.now()}
    result = reminders.insert_one(reminder_doc)

    # For each day in range
    current = reminder.start_date
    while current <= reminder.end_date:
        for med in reminder.medications:
            for t in med.times:
                hour, minute = map(int, t.split(":"))
                send_time = tz.localize(datetime.combine(current, dt_time(hour, minute)))
                base_msg = reminder.message or HARDCODED_TRANSLATIONS["medication"]["en"]
                msg = translate_message("medication", base_msg,
                                        reminder.patient_language, name=reminder.patient_name, medication_name=med.name,
                                        dosage=med.dosage)
                # Send now if today and time is in the future
                if current == date.today() and send_time > datetime.now(tz):
                    send_notification(reminder.patient_phone, msg)
                # Schedule for future
                if send_time > datetime.now(tz):
                    schedule_notification(reminder.patient_phone, msg, send_time)
        current += timedelta(days=1)

    # Return the created reminder
    created_reminder = reminders.find_one({"_id": result.inserted_id})
    return convert_objectid_to_str(created_reminder)



# READ operations
@app.get("/reminders/")
def list_reminders(
        patient_id: Optional[str] = Query(None, description="Filter by patient ID"),
        reminder_type: Optional[str] = Query(None, description="Filter by reminder type (appointment/medication)"),
        limit: int = Query(100, description="Maximum number of reminders to return"),
        skip: int = Query(0, description="Number of reminders to skip")
):
    """List all reminders with optional filtering"""
    query = {}
    if patient_id:
        query["patient_id"] = patient_id
    if reminder_type:
        query["type"] = reminder_type

    cursor = reminders.find(query).skip(skip).limit(limit).sort("created_at", -1)
    result = []
    for doc in cursor:
        result.append(convert_objectid_to_str(doc))
    return result



@app.get("/reminders/{reminder_id}")
def get_reminder(reminder_id: str):
    """Get a specific reminder by ID"""
    try:
        object_id = ObjectId(reminder_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid reminder ID format")

    reminder = reminders.find_one({"_id": object_id})
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")

    return convert_objectid_to_str(reminder)



# UPDATE operations
@app.put("/reminders/appointment/{reminder_id}")
def update_appointment_reminder(reminder_id: str, update_data: AppointmentReminderUpdate):
    """Update an appointment reminder"""
    try:
        object_id = ObjectId(reminder_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid reminder ID format")

    # Get existing reminder
    existing_reminder = reminders.find_one({"_id": object_id, "type": "appointment"})
    if not existing_reminder:
        raise HTTPException(status_code=404, detail="Appointment reminder not found")

    # Prepare update data (only include non-None fields)
    update_fields = {k: v for k, v in update_data.dict().items() if v is not None}
    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields to update")

    update_fields["updated_at"] = datetime.now()

    # Update in database
    result = reminders.update_one({"_id": object_id}, {"$set": update_fields})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Reminder not found")

    # Get updated reminder
    updated_reminder = reminders.find_one({"_id": object_id})

    # Cancel existing scheduled jobs and reschedule with new data
    cancel_scheduled_jobs_for_reminder(reminder_id)
    reschedule_appointment_notifications(updated_reminder)

    return convert_objectid_to_str(updated_reminder)



@app.put("/reminders/medication/{reminder_id}")
def update_medication_reminder(reminder_id: str, update_data: MedicationReminderUpdate):
    """Update a medication reminder"""
    try:
        object_id = ObjectId(reminder_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid reminder ID format")

    # Get existing reminder
    existing_reminder = reminders.find_one({"_id": object_id, "type": "medication"})
    if not existing_reminder:
        raise HTTPException(status_code=404, detail="Medication reminder not found")

    # Prepare update data (only include non-None fields)
    update_fields = {}
    for k, v in update_data.dict().items():
        if v is not None:
            if k == "medications":
                # Convert Medication objects to dict
                update_fields[k] = [med.dict() for med in v]
            else:
                update_fields[k] = v

    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields to update")

    update_fields["updated_at"] = datetime.now()

    # Update in database
    result = reminders.update_one({"_id": object_id}, {"$set": update_fields})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Reminder not found")

    # Get updated reminder
    updated_reminder = reminders.find_one({"_id": object_id})

    # Cancel existing scheduled jobs and reschedule with new data
    cancel_scheduled_jobs_for_reminder(reminder_id)
    reschedule_medication_notifications(updated_reminder)

    return convert_objectid_to_str(updated_reminder)



# DELETE operations
@app.delete("/reminders/{reminder_id}")
def delete_reminder(reminder_id: str):
    """Delete a specific reminder"""
    try:
        object_id = ObjectId(reminder_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid reminder ID format")

    # Check if reminder exists
    existing_reminder = reminders.find_one({"_id": object_id})
    if not existing_reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")

    # Cancel all scheduled jobs for this reminder
    cancel_scheduled_jobs_for_reminder(reminder_id)

    # Delete from database
    result = reminders.delete_one({"_id": object_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Reminder not found")

    return {"message": "Reminder deleted successfully", "deleted_id": reminder_id}



@app.delete("/reminders/patient/{patient_id}")
def delete_patient_reminders(patient_id: str):
    """Delete all reminders for a specific patient"""
    # Get all reminders for the patient to cancel their jobs
    patient_reminders = list(reminders.find({"patient_id": patient_id}))

    # Cancel scheduled jobs for all patient reminders
    for reminder in patient_reminders:
        cancel_scheduled_jobs_for_reminder(str(reminder["_id"]))

    # Delete all reminders for the patient
    result = reminders.delete_many({"patient_id": patient_id})

    return {
        "message": f"Deleted {result.deleted_count} reminders for patient {patient_id}",
        "deleted_count": result.deleted_count
    }



# Additional utility endpoints
@app.get("/reminders/patient/{patient_id}")
def get_patient_reminders(patient_id: str):
    """Get all reminders for a specific patient"""
    cursor = reminders.find({"patient_id": patient_id}).sort("created_at", -1)
    result = []
    for doc in cursor:
        result.append(convert_objectid_to_str(doc))
    return result



@app.get("/reminders/stats")
def get_reminder_stats():
    """Get statistics about reminders"""
    total_reminders = reminders.count_documents({})
    appointment_count = reminders.count_documents({"type": "appointment"})
    medication_count = reminders.count_documents({"type": "medication"})

    # Get language distribution
    pipeline = [
        {"$group": {"_id": "$patient_language", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    language_stats = list(reminders.aggregate(pipeline))

    return {
        "total_reminders": total_reminders,
        "appointment_reminders": appointment_count,
        "medication_reminders": medication_count,
        "language_distribution": language_stats,
        "active_scheduled_jobs": len(scheduler.get_jobs())
    }

