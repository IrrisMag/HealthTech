# Enhanced Patient Chatbot API

A FastAPI-based chatbot service designed specifically for patient-related queries using Google's Gemini AI model with LangChain and RAG (Retrieval-Augmented Generation) capabilities.

## 🆕 Enhanced Features

- **RAG-Powered Responses**: Access and explain information from PDF documents (clinical summaries, health guides)
- **Conversation Memory**: Maintains conversation context across interactions
- **Document Management**: Automatically processes PDFs from the `docs/` folder
- **LangChain Integration**: Advanced conversation flow management
- **Vector Search**: Semantic search through medical documents
- **Source Attribution**: Shows which documents were used to generate responses
- **Confidence Scoring**: Provides confidence levels for responses

## Original Features

- **Patient-focused responses**: Only responds to health and medical related queries
- **Gemini AI integration**: Uses Google's Gemini Pro model for intelligent responses
- **Safety guidelines**: Includes appropriate medical disclaimers and guidance
- **Context support**: Accepts optional patient context for more personalized responses
- **Query filtering**: Automatically detects and filters non-medical queries

## API Endpoints

### POST /chat
Main chatbot endpoint for patient queries with RAG capabilities.

**Request Body:**
```json
{
    "message": "What are the symptoms of malaria?",
    "patient_context": "Adult patient, traveling to endemic area", // optional
    "session_id": "user_123" // optional, for conversation memory
}
```

**Enhanced Response:**
```json
{
    "response": "Based on the medical guidelines, malaria symptoms typically include...",
    "is_patient_related": true,
    "sources": ["Malaria_guide.pdf"], // Documents used for response
    "confidence_score": 0.85 // Confidence level (0-1)
}
```

### GET /documents
Get information about loaded PDF documents.

**Response:**
```json
{
    "total_documents": 1,
    "documents": [
        {
            "filename": "Malaria_guide.pdf",
            "pages": 25,
            "chunks": 30
        }
    ],
    "rag_status": "enabled"
}
```

### POST /reload-documents
Reload documents and reinitialize the RAG system.

### DELETE /clear-memory
Clear conversation memory for fresh start.

### GET /
Service information endpoint with RAG status.

### GET /health
Health check endpoint with system status.

## Installation & Setup

### Quick Start
```bash
# Install dependencies
pip install -r requirements.txt

# Add PDF documents to docs/ folder
# Copy your medical PDFs to: docs/

# Start the chatbot
python -m uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

### Manual Setup

1. **Install dependencies:**
```bash
pip install -r requirements.txt
```

2. **Add documents:**
   - Place PDF files in the `docs/` folder
   - The system will automatically process them for RAG

3. **Run the enhanced application:**

```bash
uvicorn app_enhanced:app --reload --host 0.0.0.0 --port 8000
```
`

## Configuration

The Gemini API key is configured in the application. For production use, consider using environment variables:

```python
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "your-api-key-here")
```

## Usage Examples

### Medical Query with RAG
```bash
curl -X POST "http://localhost:8000/chat" \
     -H "Content-Type: application/json" \
     -d '{"message": "What are the symptoms of malaria and how is it treated?"}'
```

### Query with Conversation Memory
```bash
# First message
curl -X POST "http://localhost:8000/chat" \
     -H "Content-Type: application/json" \
     -d '{"message": "I have a fever", "session_id": "patient_123"}'

# Follow-up message (uses context)
curl -X POST "http://localhost:8000/chat" \
     -H "Content-Type: application/json" \
     -d '{"message": "How long should I wait before seeing a doctor?", "session_id": "patient_123"}'
```

### Document Management
```bash
# Get document information
curl -X GET "http://localhost:8000/documents"

# Reload documents after adding new PDFs
curl -X POST "http://localhost:8000/reload-documents"

# Clear conversation memory
curl -X DELETE "http://localhost:8000/clear-memory"
```

## 📁 Document Structure

```
chatbot/patient_support/
├── app.py                      # Original chatbot
├── requirements.txt            # Dependencies
├── docs/                       # PDF documents folder
│   └── Malaria_guide.pdf      # Your medical documents
└── chroma_db/                 # Vector database (auto-created)
```

## 🚀 Key Improvements Over Original

1. **Document-Based Responses**: Answers based on your PDF content
2. **Conversation Context**: Remembers previous interactions
3. **Source Attribution**: Shows which documents were referenced
4. **Better Accuracy**: RAG provides more accurate, specific answers
5. **Easy Management**: Tools for document validation and testing
6. **Scalable**: Add new PDFs anytime, system auto-processes them

## Important Notes

- This chatbot is designed for general health information only
- Always includes disclaimers about consulting healthcare professionals
- Does not provide specific medical diagnoses or treatment recommendations
- Filters out non-medical queries to maintain focus on patient care
- **RAG responses are based on provided documents** - ensure document accuracy

## API Documentation

Once running, visit `http://localhost:8000/docs` for interactive API documentation powered by FastAPI's automatic OpenAPI generation.

## Troubleshooting

### Common Issues

1. **"RAG system disabled"**: No PDFs in docs/ folder or loading failed
2. **Slow responses**: Large documents or many PDFs - consider optimization
3. **Memory errors**: Reduce document size or increase system memory
4. **API key errors**: Check your Gemini API key configuration

### Performance Tips

- Keep PDFs under 10MB each for optimal performance
- Use clear, well-structured medical documents
- Regularly clear conversation memory for fresh starts
- Monitor document loading in startup logs