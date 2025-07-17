from typing import List, Union
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import pipeline
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.decomposition import LatentDirichletAllocation

app = FastAPI()


@app.get("/")
def root():
    return {"service": "analysis"}

# Load sentiment model from HuggingFace Hub
sentiment_model = pipeline("sentiment-analysis", model="nlptown/bert-base-multilingual-uncased-sentiment")

# Define keywords to look for in urgent feedback
URGENT_KEYWORDS = [
    # Medical emergency
    "bleeding", "unconscious", "seizure", "stroke", "choking", "fainted", "heart attack", "cardiac", "crisis", "pain",
    "extreme pain", "emergency",
    # Neglect or mistreatment
    "neglect", "ignored", "rude", "disrespectful", "insulting", "unresponsive", "refused", "denied", "abandoned",
    "abuse", "violated", "discrimination", "mistreated",
    # Safety and hygiene issues
    "dirty", "unclean", "infection", "contaminated", "unsafe", "hazard", "exposed", "unsanitary", "blood", "expired",
    "toxic", "insect", "rats", "mold",
    # Admin or critical failures
    "lost", "mistake", "error", "wrong", "incorrect", "misdiagnosed", "delay", "waiting too long", "forgotten",
    "wrong patient", "wrong medicine", "switched", "misplaced", "missing record", "forgot",
    # Violence or threats
    "threatened", "violence", "assault", "hit", "slapped", "security issue", "fight", "attacked", "abusive language",
    "harassment", "intimidated",
    # Legal and compliance red flags
    "lawsuit", "legal", "court", "police", "report", "investigation", "violation", "compliance", "filed", "claim",
    "rights violated", "report to authorities"
]


class FeedbackRequest(BaseModel):
    feedback_text: Union[str, List[str]]


class FeedbackListRequest(BaseModel):
    feedback_text: List[str]


class SentimentResponse(BaseModel):
    feedback: str
    sentiment: str


class TopicResponse(BaseModel):
    topic_id: int
    top_words: List[str]


class TopicsResponse(BaseModel):
    topics: List[TopicResponse]


class UrgentResponse(BaseModel):
    urgent_feedback: List[str]
    count: int


def map_sentiment(label):
    label = label.lower()
    if "1 star" in label or "2 star" in label:
        return "negative"
    elif "3 star" in label:
        return "neutral"
    else:
        return "positive"


def extract_topics_lda(feedbacks, n_topics=5, n_top_words=7):
    vectorizer = CountVectorizer(stop_words='english', max_df=0.95, min_df=1, lowercase=True)
    dtm = vectorizer.fit_transform(feedbacks)

    if dtm.shape[0] < n_topics:
        n_topics = max(1, dtm.shape[0])

    lda = LatentDirichletAllocation(n_components=n_topics, random_state=42)
    lda.fit(dtm)

    feature_names = vectorizer.get_feature_names_out()
    topics = []

    for topic_idx, topic in enumerate(lda.components_):
        top_indices = topic.argsort()[:-n_top_words - 1:-1]
        top_words = [feature_names[i] for i in top_indices]
        topics.append({
            "topic_id": topic_idx,
            "top_words": top_words
        })

    return topics


@app.post("/predict")
def predict(request: FeedbackRequest):
    feedbacks = request.feedback_text

    if isinstance(feedbacks, str):
        feedbacks = [feedbacks]
    elif not isinstance(feedbacks, list):
        raise HTTPException(status_code=400, detail="feedback_text must be a string or list of strings")

    results = []
    for text in feedbacks:
        result = sentiment_model(text[:512])[0]
        sentiment = map_sentiment(result["label"])
        results.append({"feedback": text, "sentiment": sentiment})

    if len(results) == 1:
        return results[0]
    else:
        return results


@app.post("/topics")
def topics(request: FeedbackListRequest):
    feedbacks = request.feedback_text

    if not feedbacks or not isinstance(feedbacks, list):
        raise HTTPException(status_code=400, detail="feedback_text must be provided as a list of feedback strings")

    try:
        topics = extract_topics_lda(feedbacks)
        return {"topics": topics}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Topic extraction failed: {str(e)}")


@app.post("/urgent")
def urgent(request: FeedbackListRequest):
    feedbacks = request.feedback_text

    if not feedbacks or not isinstance(feedbacks, list):
        raise HTTPException(status_code=400, detail="feedback_text must be provided as a list of feedback strings")

    flagged = []
    for feedback in feedbacks:
        lowered = feedback.lower()
        if any(word in lowered for word in URGENT_KEYWORDS):
            flagged.append(feedback)
    return {
        "urgent_feedback": flagged,
        "count": len(flagged)
    }
