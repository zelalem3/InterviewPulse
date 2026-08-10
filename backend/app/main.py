from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.auth import router as auth_router
from app.database.session import engine
from app.models.models import Base
from app.api.v1.interview import router as interview_router
from app.api.v1.resume import router as resume_router
from app.api.v1.question import router as question_router
from app.api.v1.evaluations import router as evaluation_router
from app.api.v1.answers import router as answer_router  
from app.api.v1.Submissions import router as code_router
from app.api.v1 import tts
from fastapi.staticfiles import StaticFiles




app = FastAPI(title="InterviewPulse API", version="1.0.0")
app.mount(
    "/audio",
    StaticFiles(directory="audio"),
    name="audio"
)

app.include_router(auth_router, prefix="/api")
app.include_router(interview_router, prefix="/api")
app.include_router(resume_router, prefix="/api")
app.include_router(question_router, prefix="/api")
app.include_router(evaluation_router, prefix="/api")
app.include_router(answer_router, prefix="/api") 
app.include_router(code_router, prefix="/api") 
app.include_router(
    tts.router,
    prefix="/api"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost","https://interview-pulse-five.vercel.app",],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "FastAPI Backend"}

@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)