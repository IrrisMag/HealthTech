FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create a comprehensive requirements file
RUN echo "fastapi==0.104.1\n\
uvicorn==0.24.0\n\
pydantic==2.5.0\n\
google-generativeai==0.3.2\n\
pypdf\n\
pandas\n\
openpyxl" > requirements.txt

# Install all dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create docs directory for PDF documents
RUN mkdir -p /app/patient_support/docs

EXPOSE 8000

# Start the chatbot service using main.py as entry point
CMD python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
