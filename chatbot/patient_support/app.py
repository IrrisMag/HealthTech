from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import google.generativeai as genai
import os
from typing import Optional, List, Dict
import json
from pathlib import Path
import asyncio
import hashlib

# Simple PDF processing
try:
    from pypdf import PdfReader
except ImportError:
    PdfReader = None

# Configure Gemini API
GEMINI_API_KEY = "AIzaSyBiwXGFp4AMSi-Ki4kO9iZ3w40OanNt_b4"
genai.configure(api_key=GEMINI_API_KEY)

app = FastAPI(title="Enhanced Patient Chatbot", description="A RAG-enabled chatbot using simple document search")

# Global variables for document storage
document_chunks = []
conversation_memory = {}

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
    patient_keywords = [
        'health', 'medical', 'doctor', 'patient', 'symptom', 'disease', 'treatment', 
        'medication', 'hospital', 'clinic', 'diagnosis', 'therapy', 'pain', 'fever',
        'appointment', 'prescription', 'surgery', 'recovery', 'wellness', 'care',
        'nurse', 'emergency', 'injury', 'illness', 'condition', 'medicine', 'drug',
        'vaccine', 'test', 'examination', 'consultation', 'specialist', 'healthcare',
        'malaria', 'infection', 'prevention', 'epidemic', 'outbreak', 'public health'
    ]
    
    message_lower = message.lower()
    return any(keyword in message_lower for keyword in patient_keywords)

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