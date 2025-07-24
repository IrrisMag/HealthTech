FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Download required NLTK data for TextBlob
RUN python -c "import nltk; nltk.download('punkt'); nltk.download('punkt_tab'); nltk.download('brown')"

COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
