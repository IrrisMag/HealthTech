from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import os
from typing import Optional, List, Dict
import json
from pathlib import Path
import asyncio
import hashlib
import sys

# Add DT_explanation to path for importing medical knowledge
sys.path.append(str(Path(__file__).parent.parent / "DT_explanation"))

# Simple PDF processing
try:
    from pypdf import PdfReader
except ImportError:
    PdfReader = None

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("⚠️  GEMINI_API_KEY not set in environment variables")
    print("💡 Add GEMINI_API_KEY to your .env file for full functionality")
    # You could add a fallback API key here if needed
    GEMINI_API_KEY = "fallback-key-if-needed"

try:
    genai.configure(api_key=GEMINI_API_KEY)
    print("✅ Gemini AI configured successfully")
except Exception as e:
    print(f"❌ Failed to configure Gemini AI: {e}")
    print("🔧 Check your GEMINI_API_KEY in .env file")

app = FastAPI(
    title="Enhanced Patient Chatbot",
    description="A RAG-enabled chatbot using simple document search",
    version="1.0.0"
)

# Configure CORS for frontend integration
CORS_ORIGINS = os.getenv("CORS_ORIGINS",
    "http://localhost:3000,http://localhost:3001,http://localhost:19006,"
    "https://healthtech-platform-fresh.netlify.app,"
    "https://healthtech-tracks-1-2.netlify.app"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Global variables for document storage
document_chunks = []
conversation_memory = {}

# DT_explanation medical knowledge base
DT_MEDICAL_KNOWLEDGE = {
    "conditions": {
        "lupus": {
            "simple_name": "Lupus (Systemic Lupus Erythematosus)",
            "explanation": "Lupus is an autoimmune disease where your body's immune system attacks your own healthy tissues and organs. Think of it like your body's security system getting confused and attacking your own cells instead of protecting them.",
            "symptoms": ["Joint pain and swelling", "Skin rashes (especially butterfly rash on face)", "Fatigue", "Fever", "Hair loss", "Mouth ulcers"],
            "causes": ["Genetics", "Environmental triggers", "Infections", "Stress", "Sunlight exposure"],
            "lifestyle_tips": ["Protect skin from sun", "Get adequate rest", "Exercise gently", "Manage stress", "Follow prescribed medications"],
            "when_to_contact_doctor": ["Severe joint pain", "New rashes", "Persistent fever", "Difficulty breathing", "Chest pain"]
        },
        "hypertension": {
            "simple_name": "High Blood Pressure",
            "explanation": "Your blood pressure is higher than normal. Think of it like water flowing through a garden hose with too much pressure - it can strain your heart and blood vessels over time.",
            "symptoms": ["Often no symptoms", "Headaches", "Dizziness", "Blurred vision"],
            "causes": ["Poor diet", "Lack of exercise", "Stress", "Family history", "Age"],
            "lifestyle_tips": ["Reduce salt intake", "Exercise regularly", "Manage stress", "Maintain healthy weight", "Limit alcohol"],
            "when_to_contact_doctor": ["Blood pressure over 180/120", "Severe headache", "Chest pain", "Difficulty breathing"]
        },
        "diabetes_type_2": {
            "simple_name": "Type 2 Diabetes",
            "explanation": "Your body has trouble using sugar (glucose) properly. It's like having a key that doesn't fit the lock perfectly - your cells can't easily use the sugar in your blood for energy.",
            "symptoms": ["Increased thirst", "Frequent urination", "Fatigue", "Blurred vision", "Slow healing wounds"],
            "causes": ["Being overweight", "Lack of physical activity", "Family history", "Age", "Poor diet"],
            "lifestyle_tips": ["Follow a balanced diet", "Exercise regularly", "Monitor blood sugar", "Take medications as prescribed", "Maintain healthy weight"],
            "when_to_contact_doctor": ["Blood sugar over 300", "Persistent high readings", "Signs of infection", "Severe fatigue"]
        },
        "malaria": {
            "simple_name": "Malaria",
            "explanation": "Malaria is a serious disease caused by parasites that are transmitted through mosquito bites. The parasites travel to your liver and then infect your red blood cells.",
            "symptoms": ["Fever and chills", "Headache", "Muscle aches", "Nausea and vomiting", "Fatigue", "Sweating"],
            "causes": ["Mosquito bites from infected Anopheles mosquitoes", "Blood transfusion (rare)", "Sharing needles"],
            "lifestyle_tips": ["Use mosquito nets", "Apply insect repellent", "Wear long sleeves", "Take preventive medication when traveling"],
            "when_to_contact_doctor": ["High fever", "Severe headache", "Confusion", "Difficulty breathing", "Persistent vomiting"]
        }
    },
    "medications": {
        "metformin": {
            "purpose": "Helps control blood sugar in diabetes",
            "how_it_works": "It helps your body use insulin better and reduces the amount of sugar your liver makes",
            "common_side_effects": ["Stomach upset", "Nausea", "Diarrhea"],
            "taking_instructions": "Take with food to reduce stomach upset. Usually taken twice daily.",
            "precautions": ["Don't skip meals", "Monitor blood sugar regularly", "Stay hydrated"]
        }
    }
}

class ChatRequest(BaseModel):
    message: str
    patient_context: Optional[str] = None
    session_id: Optional[str] = "default"

class ChatResponse(BaseModel):
    response: str
    is_patient_related: bool
    sources: Optional[List[str]] = None
    confidence_score: Optional[float] = None

class DocumentInfo(BaseModel):
    filename: str
    pages: int
    chunks: int

def is_patient_related_query(message: str) -> bool:
    """Check if the query is related to patient care, health, or medical topics"""
    # General medical keywords
    general_keywords = [
        'health', 'medical', 'doctor', 'patient', 'symptom', 'disease', 'treatment',
        'medication', 'hospital', 'clinic', 'diagnosis', 'therapy', 'pain', 'fever',
        'appointment', 'prescription', 'surgery', 'recovery', 'wellness', 'care',
        'nurse', 'emergency', 'injury', 'illness', 'condition', 'medicine', 'drug',
        'vaccine', 'test', 'examination', 'consultation', 'specialist', 'healthcare',
        'infection', 'prevention', 'epidemic', 'outbreak', 'public health'
    ]

    # Specific medical conditions and diseases
    medical_conditions = [
        'malaria', 'typhoid', 'lupus', 'diabetes', 'hypertension', 'asthma', 'cancer',
        'tuberculosis', 'pneumonia', 'bronchitis', 'arthritis', 'migraine', 'anemia',
        'hepatitis', 'cholera', 'dengue', 'yellow fever', 'meningitis', 'sepsis',
        'stroke', 'heart attack', 'angina', 'epilepsy', 'depression', 'anxiety',
        'covid', 'coronavirus', 'flu', 'influenza', 'cold', 'cough', 'headache',
        'nausea', 'vomiting', 'diarrhea', 'constipation', 'fatigue', 'weakness'
    ]

    # Medical question patterns
    question_patterns = [
        'what is', 'what are', 'how to treat', 'how to cure', 'symptoms of',
        'causes of', 'prevention of', 'treatment for', 'cure for', 'medicine for',
        'i have', 'i feel', 'i am experiencing', 'my symptoms', 'should i see'
    ]

    message_lower = message.lower()

    # Check for any medical keywords, conditions, or question patterns
    return (any(keyword in message_lower for keyword in general_keywords) or
            any(condition in message_lower for condition in medical_conditions) or
            any(pattern in message_lower for pattern in question_patterns))

def search_dt_explanation(query: str) -> Optional[Dict]:
    """Search the DT_explanation medical knowledge base for relevant information"""
    query_lower = query.lower()

    # Search in conditions
    for condition_key, condition_data in DT_MEDICAL_KNOWLEDGE["conditions"].items():
        if (condition_key in query_lower or
            condition_data["simple_name"].lower() in query_lower or
            any(symptom.lower() in query_lower for symptom in condition_data.get("symptoms", []))):
            return {
                "type": "condition",
                "data": condition_data,
                "condition_name": condition_data["simple_name"]
            }

    # Search in medications
    for med_key, med_data in DT_MEDICAL_KNOWLEDGE["medications"].items():
        if med_key in query_lower:
            return {
                "type": "medication",
                "data": med_data,
                "medication_name": med_key.title()
            }

    return None

def format_dt_explanation(dt_info: Dict, query: str) -> str:
    """Format DT_explanation information into a patient-friendly response"""
    if dt_info["type"] == "condition":
        data = dt_info["data"]
        condition_name = dt_info["condition_name"]

        response = f"**{condition_name}**\n\n"
        response += f"**What it is:** {data['explanation']}\n\n"

        if "symptoms" in data:
            response += f"**Common symptoms:**\n"
            for symptom in data["symptoms"]:
                response += f"• {symptom}\n"
            response += "\n"

        if "causes" in data:
            response += f"**Common causes:**\n"
            for cause in data["causes"]:
                response += f"• {cause}\n"
            response += "\n"

        if "lifestyle_tips" in data:
            response += f"**Lifestyle recommendations:**\n"
            for tip in data["lifestyle_tips"]:
                response += f"• {tip}\n"
            response += "\n"

        if "when_to_contact_doctor" in data:
            response += f"**⚠️ Contact your doctor immediately if you experience:**\n"
            for warning in data["when_to_contact_doctor"]:
                response += f"• {warning}\n"
            response += "\n"

        response += "**Important:** This information is for educational purposes only. Always consult with a healthcare professional for proper diagnosis and treatment."

        return response

    elif dt_info["type"] == "medication":
        data = dt_info["data"]
        med_name = dt_info["medication_name"]

        response = f"**{med_name}**\n\n"
        response += f"**Purpose:** {data['purpose']}\n\n"
        response += f"**How it works:** {data['how_it_works']}\n\n"

        if "taking_instructions" in data:
            response += f"**How to take:** {data['taking_instructions']}\n\n"

        if "common_side_effects" in data:
            response += f"**Common side effects:**\n"
            for effect in data["common_side_effects"]:
                response += f"• {effect}\n"
            response += "\n"

        if "precautions" in data:
            response += f"**Important precautions:**\n"
            for precaution in data["precautions"]:
                response += f"• {precaution}\n"
            response += "\n"

        response += "**Important:** Always follow your doctor's instructions and never stop or change medications without consulting your healthcare provider."

        return response

    return ""

def load_pdf_documents(docs_folder: Path) -> List[Dict]:
    """Load and process PDF documents into chunks"""
    chunks = []
    
    if not docs_folder.exists():
        print(f"Documents folder not found: {docs_folder}")
        return chunks
    
    if not PdfReader:
        print("PyPDF not available. Please install: pip install pypdf")
        return chunks
    
    for pdf_file in docs_folder.glob("*.pdf"):
        try:
            print(f"Loading {pdf_file.name}...")
            reader = PdfReader(str(pdf_file))
            
            for page_num, page in enumerate(reader.pages):
                text = page.extract_text()
                if text.strip():
                    # Split text into smaller chunks
                    words = text.split()
                    chunk_size = 200  # words per chunk
                    overlap = 50     # overlapping words
                    
                    for i in range(0, len(words), chunk_size - overlap):
                        chunk_words = words[i:i + chunk_size]
                        chunk_text = ' '.join(chunk_words)
                        
                        if len(chunk_text.strip()) > 100:  # Only keep substantial chunks
                            chunks.append({
                                'text': chunk_text,
                                'source': pdf_file.name,
                                'page': page_num + 1,
                                'chunk_id': len(chunks)
                            })
            
            print(f"Processed {pdf_file.name}: {len(reader.pages)} pages")
            
        except Exception as e:
            print(f"Error processing {pdf_file.name}: {e}")
    
    print(f"Total chunks created: {len(chunks)}")
    return chunks

def simple_text_search(query: str, chunks: List[Dict], top_k: int = 3) -> List[Dict]:
    """Simple keyword-based search through document chunks"""
    if not chunks:
        return []
    
    query_words = set(query.lower().split())
    scored_chunks = []
    
    for chunk in chunks:
        chunk_words = set(chunk['text'].lower().split())
        
        # Calculate simple overlap score
        common_words = query_words.intersection(chunk_words)
        score = len(common_words) / len(query_words) if query_words else 0
        
        # Boost score for exact phrase matches
        if query.lower() in chunk['text'].lower():
            score += 0.5
        
        if score > 0:
            scored_chunks.append({
                **chunk,
                'relevance_score': score
            })
    
    # Sort by relevance and return top results
    scored_chunks.sort(key=lambda x: x['relevance_score'], reverse=True)
    return scored_chunks[:top_k]

def create_rag_prompt(message: str, relevant_chunks: List[Dict], conversation_history: List[str] = None) -> str:
    """Create a prompt that includes relevant document context and conversation history"""
    
    prompt = """You are a helpful medical assistant chatbot designed to provide general health information and support to patients.

IMPORTANT GUIDELINES:
- Only respond to health, medical, or patient care related queries
- Provide helpful, accurate, and empathetic responses based on the provided context
- Always remind users to consult healthcare professionals for serious concerns
- Do not provide specific medical diagnoses or treatment recommendations
- Be compassionate and understanding in your responses

"""
    
    # Add document context if available
    if relevant_chunks:
        prompt += "RELEVANT MEDICAL INFORMATION FROM DOCUMENTS:\n"
        for i, chunk in enumerate(relevant_chunks, 1):
            prompt += f"\n{i}. From {chunk['source']} (Page {chunk['page']}):\n{chunk['text']}\n"
        prompt += "\n" + "="*50 + "\n"
    
    # Add conversation history if available
    if conversation_history:
        prompt += "PREVIOUS CONVERSATION:\n"
        for msg in conversation_history[-4:]:  # Last 4 messages
            prompt += f"{msg}\n"
        prompt += "\n" + "="*50 + "\n"
    
    prompt += f"\nPATIENT QUESTION: {message}\n\n"
    prompt += "Please provide a helpful and medically appropriate response based on the above information:"
    
    return prompt

def manage_conversation_memory(session_id: str, user_message: str, bot_response: str, max_history: int = 10):
    """Manage conversation memory for each session"""
    if session_id not in conversation_memory:
        conversation_memory[session_id] = []
    
    conversation_memory[session_id].append(f"Patient: {user_message}")
    conversation_memory[session_id].append(f"Assistant: {bot_response}")
    
    # Keep only recent conversation
    if len(conversation_memory[session_id]) > max_history * 2:
        conversation_memory[session_id] = conversation_memory[session_id][-max_history * 2:]

def setup_document_system():
    """Initialize the document processing system"""
    global document_chunks
    
    try:
        # Use path relative to this app.py file
        app_dir = Path(__file__).parent
        docs_folder = app_dir / "docs"
        
        print(f"🔍 App directory: {app_dir}")
        print(f"🔍 Docs folder path: {docs_folder}")
        print(f"🔍 Docs folder exists: {docs_folder.exists()}")
        
        if docs_folder.exists():
            pdf_files = list(docs_folder.glob("*.pdf"))
            print(f"🔍 PDF files found: {pdf_files}")
        
        document_chunks = load_pdf_documents(docs_folder)
        
        if document_chunks:
            print(f"✅ Document system initialized with {len(document_chunks)} chunks")
            return True
        else:
            print("⚠️ No documents loaded. System will work with general knowledge only.")
            return False
            
    except Exception as e:
        print(f"❌ Error setting up document system: {e}")
        return False

# Initialize document system on startup
@app.on_event("startup")
async def startup_event():
    """Initialize the document system when the app starts"""
    print("🚀 Startup event triggered!")
    setup_document_system()

# Also initialize when module is imported (fallback)
print("📦 Patient support app module loading...")
setup_document_system()

@app.get("/")
def root():
    return {
        "service": "enhanced-patient-chatbot", 
        "status": "active", 
        "model": "gemini-1.5-flash",
        "rag_enabled": len(document_chunks) > 0,
        "document_chunks": len(document_chunks),
        "features": ["conversation_memory", "simple_document_search", "medical_focus"]
    }

@app.get("/documents")
def get_document_info():
    """Get information about loaded documents"""
    # Use path relative to this app.py file
    app_dir = Path(__file__).parent
    docs_folder = app_dir / "docs"
    
    if not docs_folder.exists():
        return {"error": "Documents folder not found"}
    
    documents_info = []
    doc_stats = {}
    
    # Count chunks per document
    for chunk in document_chunks:
        source = chunk['source']
        if source not in doc_stats:
            doc_stats[source] = {'chunks': 0, 'pages': set()}
        doc_stats[source]['chunks'] += 1
        doc_stats[source]['pages'].add(chunk['page'])
    
    for filename, stats in doc_stats.items():
        documents_info.append(DocumentInfo(
            filename=filename,
            pages=len(stats['pages']),
            chunks=stats['chunks']
        ))
    
    return {
        "total_documents": len(documents_info),
        "total_chunks": len(document_chunks),
        "documents": documents_info,
        "rag_status": "enabled" if document_chunks else "disabled"
    }

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        print(f"🔍 Processing chat request: {request.message[:50]}...")
        
        if not request.message.strip():
            raise HTTPException(status_code=400, detail="Please provide a message")
        
        # Check if query is patient-related
        print("🔍 Checking if query is patient-related...")
        is_patient_query = is_patient_related_query(request.message)
        print(f"🔍 Is patient query: {is_patient_query}")
        
        if not is_patient_query:
            return ChatResponse(
                response="I'm a patient care chatbot designed to help with health and medical related questions. Please ask me about health concerns, symptoms, medical appointments, or general wellness topics. How can I assist you with your health-related needs today?",
                is_patient_related=False
            )
        
        # Get conversation history
        print("🔍 Getting conversation history...")
        conversation_history = conversation_memory.get(request.session_id, [])

        # First, check DT_explanation medical knowledge base
        print("🔍 Searching DT_explanation medical knowledge...")
        dt_info = search_dt_explanation(request.message)

        if dt_info:
            print(f"🔍 Found DT_explanation info for: {dt_info.get('condition_name', dt_info.get('medication_name', 'medical topic'))}")
            # Use DT_explanation for comprehensive medical information
            dt_response = format_dt_explanation(dt_info, request.message)

            # Manage conversation memory
            manage_conversation_memory(request.session_id, request.message, dt_response)

            return ChatResponse(
                response=dt_response,
                is_patient_related=True,
                sources=["DT_explanation Medical Knowledge Base"],
                confidence_score=0.95
            )

        # If no DT_explanation match, fall back to RAG system
        print("🔍 No DT_explanation match, using RAG system...")

        # Search for relevant document chunks
        print("🔍 Searching for relevant document chunks...")
        relevant_chunks = simple_text_search(request.message, document_chunks)
        print(f"🔍 Found {len(relevant_chunks)} relevant chunks")

        # Create RAG-enhanced prompt
        print("🔍 Creating RAG-enhanced prompt...")
        prompt = create_rag_prompt(request.message, relevant_chunks, conversation_history)
        
        # Generate response using Gemini
        print("🔍 Calling Gemini API...")
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        print("🔍 Gemini API response received")
        
        if not response.text:
            raise HTTPException(status_code=500, detail="Failed to generate response")
        
        # Manage conversation memory
        manage_conversation_memory(request.session_id, request.message, response.text)
        
        # Extract sources
        sources = list(set([chunk['source'] for chunk in relevant_chunks])) if relevant_chunks else None
        
        # Calculate confidence score
        confidence = 0.8 if relevant_chunks else 0.5
        if len(relevant_chunks) > 1:
            confidence += 0.1
        confidence = min(confidence, 1.0)
        
        return ChatResponse(
            response=response.text,
            is_patient_related=True,
            sources=sources,
            confidence_score=confidence
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

@app.post("/reload-documents")
async def reload_documents():
    """Reload documents and reinitialize the system"""
    try:
        success = setup_document_system()
        if success:
            return {"status": "success", "message": f"Documents reloaded successfully. {len(document_chunks)} chunks loaded."}
        else:
            return {"status": "warning", "message": "Document system setup completed with warnings"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reloading documents: {str(e)}")

@app.delete("/clear-memory")
async def clear_conversation_memory():
    """Clear conversation memory for all sessions"""
    global conversation_memory
    conversation_memory.clear()
    return {"status": "success", "message": "All conversation memory cleared"}

@app.delete("/clear-memory/{session_id}")
async def clear_session_memory(session_id: str):
    """Clear conversation memory for a specific session"""
    if session_id in conversation_memory:
        del conversation_memory[session_id]
        return {"status": "success", "message": f"Memory cleared for session {session_id}"}
    else:
        return {"status": "info", "message": f"No memory found for session {session_id}"}

@app.get("/search")
async def search_documents(query: str, limit: int = 5):
    """Search through documents manually"""
    if not query.strip():
        raise HTTPException(status_code=400, detail="Please provide a search query")
    
    results = simple_text_search(query, document_chunks, limit)
    return {
        "query": query,
        "results": len(results),
        "chunks": results
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy", 
        "service": "enhanced-patient-chatbot",
        "document_system": "enabled" if document_chunks else "disabled",
        "memory_sessions": len(conversation_memory),
        "total_chunks": len(document_chunks)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)