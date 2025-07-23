from fastapi import FastAPI

app = FastAPI()

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "translation"}

@app.get("/")
def root():
    return {"service": "translation"}
