from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum
import uvicorn
from datetime import datetime
import logging
from contextlib import asynccontextmanager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Medical knowledge base - In production, this would be a proper database or vector store
MEDICAL_KNOWLEDGE_BASE = {
    "conditions": {
        "hypertension": {
            "simple_name": "High Blood Pressure",
            "explanation": "Your blood pressure is higher than normal. Think of it like water flowing through a garden hose with too much pressure - it can strain your heart and blood vessels over time.",
            "causes": ["Poor diet", "Lack of exercise", "Stress", "Family history"],
            "lifestyle_tips": ["Reduce salt intake", "Exercise regularly", "Manage stress", "Maintain healthy weight"]
        },
        "diabetes_type_2": {
            "simple_name": "Type 2 Diabetes",
            "explanation": "Your body has trouble using sugar (glucose) properly. It's like having a key that doesn't fit the lock perfectly - your cells can't easily use the sugar in your blood for energy.",
            "causes": ["Being overweight", "Lack of physical activity", "Family history", "Age"],
            "lifestyle_tips": ["Follow a balanced diet", "Exercise regularly", "Monitor blood sugar", "Take medications as prescribed"]
        }
    },
    "medications": {
        "metformin": {
            "purpose": "Helps control blood sugar in diabetes",
            "how_it_works": "It helps your body use insulin better and reduces the amount of sugar your liver makes",
            "common_side_effects": ["Stomach upset", "Nausea", "Diarrhea"],
            "taking_instructions": "Take with food to reduce stomach upset. Usually taken twice daily.",
            "precautions": ["Don't skip meals", "Monitor blood sugar regularly", "Stay hydrated"]
        },
        "lisinopril": {
            "purpose": "Helps lower blood pressure",
            "how_it_works": "It relaxes your blood vessels, making it easier for your heart to pump blood",
            "common_side_effects": ["Dry cough", "Dizziness", "Headache"],
            "taking_instructions": "Take at the same time each day, usually once daily",
            "precautions": ["Stand up slowly to avoid dizziness", "Don't stop suddenly", "Monitor blood pressure"]
        }
    }
}

class ExplanationType(str, Enum):
    DIAGNOSIS = "diagnosis"
    MEDICATION = "medication"
    TREATMENT = "treatment"
    LIFESTYLE = "lifestyle"
    FOLLOWUP = "followup"

class PatientContext(BaseModel):
    age: Optional[int] = Field(None, description="Patient age for personalized explanations")
    gender: Optional[str] = Field(None, description="Patient gender")
    medical_history: Optional[List[str]] = Field(default=[], description="Relevant medical history")
    current_medications: Optional[List[str]] = Field(default=[], description="Current medications")
    education_level: Optional[str] = Field("general", description="Education level for explanation complexity")

class ExplanationRequest(BaseModel):
    medical_term: str = Field(..., description="Medical term or condition to explain")
    clinical_summary: Optional[str] = Field(None, description="Clinician's summary or notes")
    explanation_type: ExplanationType = Field(..., description="Type of explanation needed")
    patient_context: Optional[PatientContext] = Field(None, description="Patient context for personalization")
    specific_questions: Optional[List[str]] = Field(default=[], description="Specific patient questions")

class ExplanationResponse(BaseModel):
    simple_explanation: str = Field(..., description="Patient-friendly explanation")
    key_points: List[str] = Field(..., description="Important points to remember")
    lifestyle_recommendations: Optional[List[str]] = Field(None, description="Lifestyle advice")
    side_effects: Optional[List[str]] = Field(None, description="Common side effects if applicable")
    taking_instructions: Optional[str] = Field(None, description="How to take medication if applicable")
    follow_up_care: Optional[List[str]] = Field(None, description="Follow-up care instructions")
    when_to_contact_doctor: List[str] = Field(..., description="When to contact healthcare provider")
    additional_resources: Optional[List[str]] = Field(None, description="Additional educational resources")
    personalized_notes: Optional[str] = Field(None, description="Personalized advice based on patient context")

class MedicationExplanationRequest(BaseModel):
    medication_name: str = Field(..., description="Name of the medication")
    dosage: Optional[str] = Field(None, description="Prescribed dosage")
    frequency: Optional[str] = Field(None, description="How often to take")
    duration: Optional[str] = Field(None, description="How long to take it")
    patient_context: Optional[PatientContext] = Field(None, description="Patient context")

class HealthMetrics(BaseModel):
    timestamp: datetime
    explanations_given: int
    patient_satisfaction: Optional[float]
    common_questions: Dict[str, int]

# Global metrics storage (in production, use a proper database)
metrics = HealthMetrics(
    timestamp=datetime.now(),
    explanations_given=0,
    patient_satisfaction=None,
    common_questions={}
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Medical Explanation API starting up...")
    yield
    logger.info("Medical Explanation API shutting down...")

app = FastAPI(
    title="Medical Explanation API",
    description="API for explaining medical diagnoses, treatments, and medications in patient-friendly language",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware for web applications
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MedicalExplainer:
    """Core class for generating medical explanations"""
    
    def __init__(self):
        self.knowledge_base = MEDICAL_KNOWLEDGE_BASE
    
    def get_patient_friendly_explanation(self, medical_term: str, explanation_type: ExplanationType, 
                                       patient_context: Optional[PatientContext] = None) -> Dict[str, Any]:
        """Generate patient-friendly explanation for medical terms"""
        
        # Normalize the medical term
        normalized_term = medical_term.lower().replace(" ", "_")
        
        explanation = {
            "simple_explanation": f"I'll explain {medical_term} in simple terms.",
            "key_points": [],
            "when_to_contact_doctor": ["If you have any concerns or questions", "If symptoms worsen"]
        }
        
        if explanation_type == ExplanationType.DIAGNOSIS:
            if normalized_term in self.knowledge_base["conditions"]:
                condition = self.knowledge_base["conditions"][normalized_term]
                explanation.update({
                    "simple_explanation": condition["explanation"],
                    "key_points": condition["causes"],
                    "lifestyle_recommendations": condition["lifestyle_tips"],
                    "when_to_contact_doctor": [
                        "If symptoms get worse",
                        "If you experience new symptoms",
                        "If you have questions about your treatment"
                    ]
                })
        
        elif explanation_type == ExplanationType.MEDICATION:
            if normalized_term in self.knowledge_base["medications"]:
                medication = self.knowledge_base["medications"][normalized_term]
                explanation.update({
                    "simple_explanation": f"{medication['purpose']}. {medication['how_it_works']}",
                    "side_effects": medication["common_side_effects"],
                    "taking_instructions": medication["taking_instructions"],
                    "key_points": medication["precautions"],
                    "when_to_contact_doctor": [
                        "If you experience severe side effects",
                        "If the medication doesn't seem to be working",
                        "Before stopping the medication"
                    ]
                })
        
        # Personalize based on patient context
        if patient_context:
            explanation["personalized_notes"] = self._generate_personalized_notes(
                medical_term, patient_context, explanation_type
            )
        
        return explanation
    
    def _generate_personalized_notes(self, medical_term: str, context: PatientContext, 
                                   explanation_type: ExplanationType) -> str:
        """Generate personalized notes based on patient context"""
        notes = []
        
        if context.age:
            if context.age > 65:
                notes.append("Since you're over 65, it's especially important to monitor for side effects and keep regular check-ups.")
            elif context.age < 30:
                notes.append("As a younger patient, focusing on lifestyle changes now can have long-term benefits.")
        
        if context.medical_history:
            notes.append(f"Given your medical history of {', '.join(context.medical_history)}, we'll need to monitor your progress closely.")
        
        if context.education_level == "advanced":
            notes.append("I can provide more detailed medical information if you'd like to understand the mechanisms better.")
        
        return " ".join(notes) if notes else "Your healthcare team will work with you to ensure the best possible outcome."

# Initialize the medical explainer
explainer = MedicalExplainer()

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Medical Explanation API",
        "version": "1.0.0",
        "description": "Explains medical diagnoses, treatments, and medications in patient-friendly language",
        "endpoints": {
            "explain": "/explain - General medical explanations",
            "medication": "/medication - Medication-specific explanations",
            "health": "/health - API health check",
            "metrics": "/metrics - Usage metrics"
        }
    }

@app.post("/explain", response_model=ExplanationResponse)
async def explain_medical_term(request: ExplanationRequest):
    """
    Explain medical terms, diagnoses, or treatments in patient-friendly language
    """
    try:
        global metrics
        metrics.explanations_given += 1
        
        # Track common questions
        if request.medical_term in metrics.common_questions:
            metrics.common_questions[request.medical_term] += 1
        else:
            metrics.common_questions[request.medical_term] = 1
        
        explanation = explainer.get_patient_friendly_explanation(
            request.medical_term,
            request.explanation_type,
            request.patient_context
        )
        
        # Handle specific patient questions
        if request.specific_questions:
            additional_info = []
            for question in request.specific_questions:
                additional_info.append(f"Regarding '{question}': This is important to discuss with your healthcare provider for personalized advice.")
            explanation["additional_resources"] = additional_info
        
        return ExplanationResponse(**explanation)
        
    except Exception as e:
        logger.error(f"Error explaining medical term: {str(e)}")
        raise HTTPException(status_code=500, detail="Error generating explanation")

@app.post("/medication", response_model=ExplanationResponse)
async def explain_medication(request: MedicationExplanationRequest):
    """
    Provide detailed medication explanations including dosage, side effects, and instructions
    """
    try:
        global metrics
        metrics.explanations_given += 1
        
        explanation_request = ExplanationRequest(
            medical_term=request.medication_name,
            explanation_type=ExplanationType.MEDICATION,
            patient_context=request.patient_context
        )
        
        explanation = explainer.get_patient_friendly_explanation(
            request.medication_name,
            ExplanationType.MEDICATION,
            request.patient_context
        )
        
        # Add dosage and frequency information if provided
        if request.dosage or request.frequency:
            dosage_info = []
            if request.dosage:
                dosage_info.append(f"Your prescribed dosage is: {request.dosage}")
            if request.frequency:
                dosage_info.append(f"Take it: {request.frequency}")
            if request.duration:
                dosage_info.append(f"For: {request.duration}")
            
            explanation["taking_instructions"] = f"{explanation.get('taking_instructions', '')} {' | '.join(dosage_info)}"
        
        return ExplanationResponse(**explanation)
        
    except Exception as e:
        logger.error(f"Error explaining medication: {str(e)}")
        raise HTTPException(status_code=500, detail="Error generating medication explanation")

@app.get("/conditions")
async def list_available_conditions():
    """List all available conditions in the knowledge base"""
    return {
        "available_conditions": list(MEDICAL_KNOWLEDGE_BASE["conditions"].keys()),
        "total_conditions": len(MEDICAL_KNOWLEDGE_BASE["conditions"])
    }

@app.get("/medications")
async def list_available_medications():
    """List all available medications in the knowledge base"""
    return {
        "available_medications": list(MEDICAL_KNOWLEDGE_BASE["medications"].keys()),
        "total_medications": len(MEDICAL_KNOWLEDGE_BASE["medications"])
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now(),
        "service": "Medical Explanation API"
    }

@app.get("/metrics")
async def get_metrics():
    """Get API usage metrics"""
    return {
        "explanations_given": metrics.explanations_given,
        "common_questions": dict(sorted(metrics.common_questions.items(), key=lambda x: x[1], reverse=True)[:10]),
        "timestamp": metrics.timestamp
    }

@app.post("/feedback")
async def submit_feedback(
    rating: int = Query(..., ge=1, le=5, description="Rating between 1 and 5"),
    comments: Optional[str] = Query(None, description="Optional feedback comments")
):
    global metrics
    if metrics.patient_satisfaction is None:
        metrics.patient_satisfaction = rating
    else:
        # Simple running average
        metrics.patient_satisfaction = (metrics.patient_satisfaction + rating) / 2
    
    return {
        "message": "Thank you for your feedback",
        "rating": rating,
        "comments": comments
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )