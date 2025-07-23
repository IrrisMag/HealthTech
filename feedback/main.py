import asyncio
import logging
from datetime import datetime
from enum import Enum
from typing import Optional, List, Dict, Any

import motor.motor_asyncio
from bson import ObjectId
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from textblob import TextBlob

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)



# Initialize FastAPI app
app = FastAPI(
    title="Patient Feedback Microservice",
    description=(
        "Multilingual patient feedback collection and analysis system "
        "for Douala General Hospital"
    ),
    version="1.0.0"
)

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "feedback"}


# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Database connection with SSL configuration
try:
    client = motor.motor_asyncio.AsyncIOMotorClient(
        MONGODB_URL,
        tls=True,
        tlsAllowInvalidCertificates=True,
        serverSelectionTimeoutMS=30000,
        connectTimeoutMS=30000,
        socketTimeoutMS=30000,
        maxPoolSize=50,
        retryWrites=True
    )
    db = client[DATABASE_NAME]
    logger.info("MongoDB client initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize MongoDB client: {e}")
    # Fallback configuration
    client = motor.motor_asyncio.AsyncIOMotorClient(
        MONGODB_URL,
        ssl=True,
        ssl_cert_reqs=None,
        serverSelectionTimeoutMS=30000,
        connectTimeoutMS=30000,
        socketTimeoutMS=30000
    )
    db = client[DATABASE_NAME]


# Collections
feedback_collection = db.feedback
analytics_collection = db.analytics


# Enums and Models
class FeedbackType(str, Enum):
    GENERAL = "general"
    APPOINTMENT = "appointment"
    MEDICATION = "medication"
    STAFF = "staff"
    FACILITIES = "facilities"
    WAITING_TIME = "waiting_time"


class Language(str, Enum):
    FRENCH = "fr"
    ENGLISH = "en"
    DOUALA = "douala"
    BASSA = "bassa"
    EWONDO = "ewondo"


class SentimentType(str, Enum):
    POSITIVE = "positive"
    NEGATIVE = "negative"
    NEUTRAL = "neutral"


class FeedbackInput(BaseModel):
    patient_id: Optional[str] = None
    text_feedback: Optional[str] = None
    voice_feedback_url: Optional[str] = None
    rating: Optional[int] = Field(None, ge=1, le=5)
    feedback_type: FeedbackType
    language: Language
    department: Optional[str] = None
    visit_date: Optional[datetime] = None
    contact_info: Optional[str] = None


class FeedbackResponse(BaseModel):
    id: str
    patient_id: Optional[str]
    text_feedback: Optional[str]
    voice_feedback_url: Optional[str]
    rating: Optional[int]
    feedback_type: str
    language: str
    department: Optional[str]
    sentiment: str
    keywords: List[str]
    priority: str
    created_at: datetime
    processed_at: Optional[datetime]


class AnalyticsResponse(BaseModel):
    total_feedback: int
    sentiment_distribution: Dict[str, int]
    average_rating: float
    top_keywords: List[Dict[str, Any]]
    feedback_by_department: Dict[str, int]
    feedback_by_language: Dict[str, int]
    priority_distribution: Dict[str, int]


# Utility functions
def convert_objectid(document):
    """Convert ObjectId to string for JSON serialization"""
    if document:
        document["id"] = str(document["_id"])
        del document["_id"]
    return document


async def check_db_connection():
    """Check if database connection is available"""
    try:
        await asyncio.wait_for(client.admin.command('ping'), timeout=5.0)
        return True
    except Exception:
        return False


# Database health check endpoint
@app.get("/health/db")
async def database_health():
    """Check database connection health"""
    try:
        is_connected = await check_db_connection()
        if is_connected:
            return {"status": "healthy", "database": "connected"}
        else:
            return {"status": "unhealthy", "database": "disconnected"}
    except Exception as e:
        return {"status": "unhealthy", "database": "error", "message": str(e)}


class FeedbackAnalyzer:
    """Handles feedback analysis and sentiment detection"""

    def __init__(self):
        self.priority_keywords = {
            "urgent": [
                "emergency", "urgent", "critical", "pain", "bleeding", "dying"
            ],
            "high": [
                "long wait", "delayed", "rude", "unprofessional", "dirty",
                "broken"
            ],
            "medium": [
                "slow", "crowded", "noisy", "uncomfortable", "confusing"
            ],
            "low": [
                "good", "excellent", "satisfied", "clean", "professional",
                "helpful"
            ]
        }

        self.category_keywords = {
            "waiting_time": [
                "wait", "queue", "delay", "slow", "time", "attente", "retard"
            ],
            "staff": [
                "doctor", "nurse", "staff", "personnel", "médecin",
                "infirmier"
            ],
            "facilities": [
                "clean", "dirty", "room", "equipment", "facility", "propre",
                "sale"
            ],
            "appointment": [
                "appointment", "schedule", "booking", "rendez-vous",
                "planifier"
            ]
        }

    def analyze_sentiment(self, text: str, language: str) -> str:
        """Analyze sentiment using TextBlob"""
        try:
            if not text:
                return "neutral"
            blob = TextBlob(text)
            polarity = blob.sentiment.polarity
            if polarity > 0.1:
                return "positive"
            elif polarity < -0.1:
                return "negative"
            else:
                return "neutral"
        except Exception as e:
            logger.error(f"Sentiment analysis error: {e}")
            return "neutral"

    def extract_keywords(self, text: str, language: str) -> List[str]:
        """Extract relevant keywords from feedback text"""
        if not text:
            return []

        keywords = []
        text_lower = text.lower()

        # Extract keywords based on categories
        for category, words in self.category_keywords.items():
            for word in words:
                if word in text_lower:
                    keywords.append(word)

        # Extract nouns and adjectives using TextBlob
        try:
            blob = TextBlob(text)
            pos_tags = blob.tags
            for word, pos in pos_tags:
                if (pos in ['NN', 'NNS', 'JJ', 'JJR', 'JJS'] and
                        len(word) > 3):
                    keywords.append(word.lower())
        except Exception as e:
            logger.error(f"Keyword extraction error: {e}")

        # Return top 10 unique keywords
        return list(set(keywords))[:10]

    def determine_priority(self, text: str, rating: Optional[int],
                           sentiment: str) -> str:
        """Determine priority level based on content and rating"""
        if not text:
            text = ""

        text_lower = text.lower()

        # Check for urgent keywords
        for keyword in self.priority_keywords["urgent"]:
            if keyword in text_lower:
                return "urgent"

        # Check rating
        if rating and rating <= 2:
            return "high"
        elif rating and rating >= 4:
            return "low"

        # Check sentiment
        if sentiment == "negative":
            return "high"
        elif sentiment == "positive":
            return "low"

        return "medium"


# Initialize analyzer
analyzer = FeedbackAnalyzer()


# Database startup event
@app.on_event("startup")
async def startup_db_client():
    """Initialize database connection and create indexes"""
    try:
        # Test connection with retry logic
        max_retries = 3
        for attempt in range(max_retries):
            try:
                # Test connection with timeout
                await asyncio.wait_for(
                    client.admin.command('ping'), timeout=10.0
                )
                logger.info("Connected to MongoDB successfully")
                break
            except asyncio.TimeoutError:
                logger.warning(
                    f"Connection attempt {attempt + 1} timed out"
                )
                if attempt == max_retries - 1:
                    raise
                await asyncio.sleep(2)
            except Exception as e:
                logger.warning(
                    f"Connection attempt {attempt + 1} failed: {e}"
                )
                if attempt == max_retries - 1:
                    raise
                await asyncio.sleep(2)

        # Create indexes
        try:
            await feedback_collection.create_index("created_at")
            await feedback_collection.create_index("sentiment")
            await feedback_collection.create_index("priority")
            await feedback_collection.create_index("feedback_type")
            await feedback_collection.create_index("language")
            logger.info("Database indexes created successfully")
        except Exception as e:
            logger.warning(f"Index creation failed (non-critical): {e}")

    except Exception as e:
        logger.error(f"Database connection error: {e}")
        logger.info("Application will continue without database connection")


@app.on_event("shutdown")
async def shutdown_db_client():
    """Close database connection"""
    try:
        client.close()
        logger.info("Database connection closed")
    except Exception as e:
        logger.error(f"Error closing database connection: {e}")


# API Routes
@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Patient Feedback Microservice is running",
        "status": "healthy"
    }


@app.post("/feedback", response_model=FeedbackResponse)
async def submit_feedback(feedback: FeedbackInput):
    """Submit new patient feedback"""
    try:
        # Analyze feedback
        sentiment = analyzer.analyze_sentiment(
            feedback.text_feedback or "", feedback.language
        )
        keywords = analyzer.extract_keywords(
            feedback.text_feedback or "", feedback.language
        )
        priority = analyzer.determine_priority(
            feedback.text_feedback or "", feedback.rating, sentiment
        )

        # Create feedback document
        feedback_doc = {
            "patient_id": feedback.patient_id,
            "text_feedback": feedback.text_feedback,
            "voice_feedback_url": feedback.voice_feedback_url,
            "rating": feedback.rating,
            "feedback_type": feedback.feedback_type,
            "language": feedback.language,
            "department": feedback.department,
            "visit_date": feedback.visit_date,
            "contact_info": feedback.contact_info,
            "sentiment": sentiment,
            "keywords": keywords,
            "priority": priority,
            "created_at": datetime.utcnow(),
            "processed_at": datetime.utcnow()
        }

        # Insert into database
        result = await feedback_collection.insert_one(feedback_doc)

        # Retrieve created document
        created_feedback = await feedback_collection.find_one(
            {"_id": result.inserted_id}
        )
        return FeedbackResponse(**convert_objectid(created_feedback))

    except Exception as e:
        logger.error(f"Error submitting feedback: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to submit feedback"
        )


@app.get("/feedback", response_model=List[FeedbackResponse])
async def get_feedback(
    skip: int = 0,
    limit: int = 50,
    sentiment: Optional[SentimentType] = None,
    priority: Optional[str] = None,
    feedback_type: Optional[FeedbackType] = None,
    language: Optional[Language] = None,
    department: Optional[str] = None
):
    """Retrieve feedback with filters"""
    try:
        # Build query
        query = {}
        if sentiment:
            query["sentiment"] = sentiment
        if priority:
            query["priority"] = priority
        if feedback_type:
            query["feedback_type"] = feedback_type
        if language:
            query["language"] = language
        if department:
            query["department"] = department

        # Execute query
        cursor = feedback_collection.find(query).skip(skip).limit(limit).sort(
            "created_at", -1
        )
        feedback_list = await cursor.to_list(length=limit)

        return [
            FeedbackResponse(**convert_objectid(doc)) for doc in feedback_list
        ]

    except Exception as e:
        logger.error(f"Error retrieving feedback: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to retrieve feedback"
        )


@app.get("/feedback/{feedback_id}", response_model=FeedbackResponse)
async def get_feedback_by_id(feedback_id: str):
    """Get specific feedback by ID"""
    try:
        if not ObjectId.is_valid(feedback_id):
            raise HTTPException(
                status_code=400, detail="Invalid feedback ID"
            )

        feedback_doc = await feedback_collection.find_one(
            {"_id": ObjectId(feedback_id)}
        )
        if not feedback_doc:
            raise HTTPException(status_code=404, detail="Feedback not found")

        return FeedbackResponse(**convert_objectid(feedback_doc))

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving feedback: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to retrieve feedback"
        )


@app.get("/analytics", response_model=AnalyticsResponse)
async def get_analytics(
    days: int = 30,
    department: Optional[str] = None
):
    """Get feedback analytics and insights"""
    try:
        # Build date filter
        from datetime import timedelta
        start_date = datetime.utcnow() - timedelta(days=days)
        match_stage = {"created_at": {"$gte": start_date}}
        if department:
            match_stage["department"] = department

        # Aggregation pipeline
        pipeline = [
            {"$match": match_stage},
            {"$group": {
                "_id": None,
                "total_feedback": {"$sum": 1},
                "sentiment_counts": {"$push": "$sentiment"},
                "ratings": {"$push": "$rating"},
                "keywords": {"$push": "$keywords"},
                "departments": {"$push": "$department"},
                "languages": {"$push": "$language"},
                "priorities": {"$push": "$priority"}
            }}
        ]

        result = await feedback_collection.aggregate(pipeline).to_list(
            length=1
        )

        if not result:
            return AnalyticsResponse(
                total_feedback=0,
                sentiment_distribution={},
                average_rating=0.0,
                top_keywords=[],
                feedback_by_department={},
                feedback_by_language={},
                priority_distribution={}
            )

        data = result[0]

        # Process sentiment distribution
        sentiment_dist = {}
        for sentiment in data["sentiment_counts"]:
            sentiment_dist[sentiment] = sentiment_dist.get(sentiment, 0) + 1

        # Calculate average rating
        ratings = [r for r in data["ratings"] if r is not None]
        avg_rating = sum(ratings) / len(ratings) if ratings else 0.0

        # Process keywords
        all_keywords = []
        for keyword_list in data["keywords"]:
            all_keywords.extend(keyword_list)

        keyword_counts = {}
        for keyword in all_keywords:
            keyword_counts[keyword] = keyword_counts.get(keyword, 0) + 1

        top_keywords = [
            {"keyword": k, "count": v}
            for k, v in sorted(
                keyword_counts.items(), key=lambda x: x[1], reverse=True
            )[:10]
        ]

        # Process departments
        dept_dist = {}
        for dept in data["departments"]:
            if dept:
                dept_dist[dept] = dept_dist.get(dept, 0) + 1

        # Process languages
        lang_dist = {}
        for lang in data["languages"]:
            lang_dist[lang] = lang_dist.get(lang, 0) + 1

        # Process priorities
        priority_dist = {}
        for priority in data["priorities"]:
            priority_dist[priority] = priority_dist.get(priority, 0) + 1

        return AnalyticsResponse(
            total_feedback=data["total_feedback"],
            sentiment_distribution=sentiment_dist,
            average_rating=round(avg_rating, 2),
            top_keywords=top_keywords,
            feedback_by_department=dept_dist,
            feedback_by_language=lang_dist,
            priority_distribution=priority_dist
        )

    except Exception as e:
        logger.error(f"Error generating analytics: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to generate analytics"
        )


@app.get("/feedback/urgent", response_model=List[FeedbackResponse])
async def get_urgent_feedback():
    """Get urgent feedback requiring immediate attention"""
    try:
        cursor = feedback_collection.find({"priority": "urgent"}).sort(
            "created_at", -1
        )
        urgent_feedback = await cursor.to_list(length=100)
        return [
            FeedbackResponse(**convert_objectid(doc))
            for doc in urgent_feedback
        ]

    except Exception as e:
        logger.error(f"Error retrieving urgent feedback: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to retrieve urgent feedback"
        )


@app.delete("/feedback/{feedback_id}")
async def delete_feedback(feedback_id: str):
    """Delete specific feedback"""
    try:
        if not ObjectId.is_valid(feedback_id):
            raise HTTPException(
                status_code=400, detail="Invalid feedback ID"
            )

        result = await feedback_collection.delete_one(
            {"_id": ObjectId(feedback_id)}
        )

        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Feedback not found")

        return {"message": "Feedback deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting feedback: {e}")
        raise HTTPException(
            status_code=500, detail="Failed to delete feedback"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
