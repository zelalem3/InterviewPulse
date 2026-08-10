from datetime import datetime, timezone

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    JSON,
    String,
    Text,
)

from sqlalchemy.orm import relationship

from app.database.session import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )

    resumes = relationship(
        "Resume",
        back_populates="user"
    )

    interviews = relationship(
        "Interview",
        back_populates="user"
    )


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    file_path = Column(String, nullable=False)
    parsed_content = Column(Text, nullable=True)
    extracted_data = Column(JSON, nullable=True)

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )

    user = relationship(
        "User",
        back_populates="resumes"
    )

    interviews = relationship(
        "Interview",
        back_populates="resume"
    )


class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    resume_id = Column(
        Integer,
        ForeignKey("resumes.id"),
        nullable=False
    )

    job_role = Column(String, nullable=False)

    status = Column(
        String,
        default="pending"
    )

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )

    user = relationship(
        "User",
        back_populates="interviews"
    )

    resume = relationship(
        "Resume",
        back_populates="interviews"
    )

    questions = relationship(
        "Question",
        back_populates="interview",
        cascade="all, delete-orphan"
    )

    result = relationship(
        "Result",
        back_populates="interview",
        uselist=False,
        cascade="all, delete-orphan"
    )

    codequestions = relationship(
        "CodingQuestion",
        back_populates="interview",
        cascade="all, delete-orphan"
    )


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)

    interview_id = Column(
        Integer,
        ForeignKey("interviews.id"),
        nullable=False
    )

    question_text = Column(
        Text,
        nullable=False
    )

    expected_topics = Column(
        Text,
        nullable=True
    )

    question_type = Column(
        String,
        nullable=True
    )

    topic = Column(
        String,
        nullable=True
    )

    sequence_number = Column(
        Integer,
        nullable=False
    )

    is_follow_up = Column(
        Boolean,
        default=False
    )

    interview = relationship(
        "Interview",
        back_populates="questions"
    )

    answer = relationship(
        "Answer",
        back_populates="question",
        uselist=False,
        cascade="all, delete-orphan"
    )


class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, index=True)

    question_id = Column(
        Integer,
        ForeignKey("questions.id"),
        nullable=False,
        unique=True
    )

    answer_text = Column(
        Text,
        nullable=False
    )

    score = Column(
        Float,
        nullable=True
    )

    feedback = Column(
        Text,
        nullable=True
    )

    model_answer = Column(
        Text,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )

    question = relationship(
        "Question",
        back_populates="answer"
    )


class Result(Base):
    __tablename__ = "results"

    id = Column(Integer, primary_key=True, index=True)

    interview_id = Column(
        Integer,
        ForeignKey("interviews.id"),
        nullable=False,
        unique=True
    )

    overall_score = Column(
        Float,
        nullable=True
    )

    feedback_summary = Column(
        Text,
        nullable=True
    )

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )

    interview = relationship(
        "Interview",
        back_populates="result"
    )


class CodingQuestion(Base):
    __tablename__ = "coding_questions"

    id = Column(Integer, primary_key=True, index=True)

    interview_id = Column(
        Integer,
        ForeignKey("interviews.id"),
        nullable=False
    )

    question_text = Column(
        Text,
        nullable=False
    )

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )

    interview = relationship(
        "Interview",
        back_populates="codequestions"
    )

    answer = relationship(
        "CodingAnswer",
        back_populates="question",
        uselist=False,
        cascade="all, delete-orphan"
    )


class CodingAnswer(Base):
    __tablename__ = "coding_answers"

    id = Column(Integer, primary_key=True, index=True)

    question_id = Column(
        Integer,
        ForeignKey("coding_questions.id"),
        nullable=False,
        unique=True
    )

    answer_text = Column(
        Text,
        nullable=False
    )

    submitted_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )

    question = relationship(
        "CodingQuestion",
        back_populates="answer"
    )