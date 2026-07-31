from fastapi import FastAPI,APIRouter
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.auth import router as auth_router
from app.database.session import engine
from app.models.models import Base

app = FastAPI(title="InterviewPulse API", version="1.0.0")
app.include_router(auth_router, prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost"],
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