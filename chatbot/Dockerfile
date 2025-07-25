FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements from patient support service
COPY patient_support/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Install additional dependencies for DT explanation
RUN pip install --no-cache-dir pandas openpyxl

# Copy application code
COPY . .

# Create docs directory for PDF documents
RUN mkdir -p /app/patient_support/docs

EXPOSE 8000

# Start the RAG chatbot service (main implementation)
CMD ["python", "-m", "uvicorn", "patient_support.app:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
