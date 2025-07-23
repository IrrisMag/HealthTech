# Optimized Dockerfile for analysis service
FROM python:3.11-slim

WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt ./

# Install dependencies with retry and longer timeout
RUN pip install --no-cache-dir --timeout 300 --retries 3 -r requirements.txt

# Copy application code
COPY . .

# Create non-root user for security
RUN useradd --create-home --shell /bin/bash app \
    && chown -R app:app /app

USER app

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
