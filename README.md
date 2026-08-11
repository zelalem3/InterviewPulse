# InterviewPulse

> **AI-powered mock interview platform with adaptive text and video interview modes, contextual follow-up questions, and automated performance evaluation.**

InterviewPulse is a full-stack AI interview platform designed to simulate realistic technical and behavioral interviews.

Candidates can choose between **Text Interview** and **Video Interview** depending on how they want to practice.

The platform maintains interview context, analyzes candidate answers, generates contextual follow-up questions, and provides detailed feedback at the end of the interview.

---

## ✨ Features

### 💬 Text Interview

Practice interviews through a conversational text-based interface.

* AI interviewer asks questions through text.
* Candidate responds by typing.
* Answers are analyzed by the AI.
* Follow-up questions can be generated based on previous answers.
* Interview context is maintained throughout the session.
* Final performance evaluation is provided at the end.

Example:

```text
AI Interviewer:
Explain the difference between a process and a thread.

Candidate:
A process is an independent program with its own memory space,
while threads share memory within the same process.

AI Interviewer:
Good. What advantages do threads have over processes?
```

---

### 🎥 Video Interview

Practice in an environment closer to a real interview.

* Camera support
* Microphone support
* AI interviewer
* Spoken questions
* Candidate video/audio interaction
* Speech-to-text transcription
* Text-to-speech
* Interview timer
* Contextual follow-up questions
* Automated evaluation

The video mode is designed to help candidates practice not only their technical knowledge, but also their ability to communicate under realistic interview conditions.

---

## 🧠 Adaptive AI Interviewer

InterviewPulse is designed to go beyond a fixed list of questions.

Instead of:

```text
Question 1
    ↓
Question 2
    ↓
Question 3
    ↓
Question 4
```

InterviewPulse maintains the conversation:

```text
Question
    ↓
Candidate Answer
    ↓
AI analyzes answer
    ↓
┌─────────────────────┐
│ Continue topic      │
│ Ask follow-up       │
│ Move to new topic   │
└──────────┬──────────┘
           ↓
     Next Question
           ↓
      Candidate Answer
           ↓
      ...
```

This allows the interviewer to ask questions based on what the candidate actually said.

For example:

```text
AI:
What is database indexing?

Candidate:
An index helps the database find records faster.

AI:
What are some disadvantages of using too many indexes?
```

The follow-up question is related to the candidate's previous answer rather than simply being the next question in a predefined list.

---

# 🎤 Two Interview Modes

InterviewPulse provides two ways to conduct an interview.

| Feature             | Text Interview | Video Interview |
| ------------------- | :------------: | :-------------: |
| Text questions      |        ✅       |        ✅        |
| Typed answers       |        ✅       |        ❌        |
| Camera              |        ❌       |        ✅        |
| Microphone          |        ❌       |        ✅        |
| Speech-to-text      |        ❌       |        ✅        |
| Text-to-speech      |        ❌       |        ✅        |
| Interview timer     |        ✅       |        ✅        |
| Follow-up questions |        ✅       |        ✅        |
| AI evaluation       |        ✅       |        ✅        |
| Interview feedback  |        ✅       |        ✅        |

Both modes use the same underlying interview engine and evaluation system.

---

# 📹 Video Interview Flow

```text
             Start Interview
                    │
                    ▼
          Select Video Interview
                    │
                    ▼
          Camera + Microphone
                    │
                    ▼
            AI asks question
                    │
                    ▼
            Candidate speaks
                    │
                    ▼
            Speech-to-Text
                    │
                    ▼
            Answer Analysis
                    │
                    ▼
        Generate Next Question
                    │
                    ▼
              Continue
                    │
                    ▼
          Final Evaluation
```

---

# 💬 Text Interview Flow

```text
             Start Interview
                    │
                    ▼
           Select Text Interview
                    │
                    ▼
            AI asks question
                    │
                    ▼
            Candidate types
                    │
                    ▼
            Answer Analysis
                    │
                    ▼
        Generate Next Question
                    │
                    ▼
              Continue
                    │
                    ▼
          Final Evaluation
```

---

# 📊 Automated Evaluation

After the interview, InterviewPulse evaluates the candidate's performance.

Evaluation can include:

* Overall score
* Individual answer scores
* Technical accuracy
* Depth of understanding
* Communication quality
* Strengths
* Weaknesses
* Feedback summary
* Suggested improvements
* Model/reference answers

Example:

```json
{
  "overall_score": 78,
  "feedback_summary": "Good understanding of the topic, but the explanation could be more detailed.",
  "answers": [
    {
      "score": 82,
      "feedback": "Correct explanation with a good understanding of the fundamentals."
    }
  ]
}
```

The goal is not simply to give candidates a score, but to explain **why** they received that score and how they can improve.

---

# 🧩 Interview Types

InterviewPulse is designed to support different types of interviews.

Potential interview categories include:

* 💻 Technical Interviews
* 🧠 Behavioral Interviews
* 🏗️ System Design Interviews
* 🗄️ Database Interviews
* 🌐 Backend Interviews
* ⚛️ Frontend Interviews
* 🔧 Full-Stack Interviews
* 🐍 Python Interviews
* 🟢 Node.js Interviews
* ☕ General Software Engineering Interviews

The interview mode and interview type can be selected independently.

For example:

```text
Technical Interview
        +
Video Mode
```

or:

```text
Backend Interview
        +
Text Mode
```

---

# 🏗️ Architecture

InterviewPulse follows a client-server architecture.

```text
┌─────────────────────────────────────┐
│             React Client            │
│                                     │
│  ┌─────────────┐  ┌─────────────┐  │
│  │ Text Mode   │  │ Video Mode  │  │
│  │             │  │             │  │
│  │ Chat UI     │  │ Camera      │  │
│  │ Text Input  │  │ Microphone  │  │
│  └──────┬──────┘  └──────┬──────┘  │
│         │                │         │
└─────────┼────────────────┼─────────┘
          │                │
          └───────┬────────┘
                  │
             REST API
                  │
                  ▼
┌─────────────────────────────────────┐
│          Python Backend             │
│                                     │
│  Authentication                     │
│  Interview Management               │
│  Interview State                    │
│  Question Generation                │
│  Follow-up Generation               │
│  Answer Evaluation                  │
│  Results                            │
└────────────────┬────────────────────┘
                 │
          ┌──────┴──────┐
          ▼             ▼
┌────────────────┐ ┌─────────────────┐
│   PostgreSQL   │ │   AI Provider   │
│                │ │                 │
│ Users          │ │ Questions       │
│ Interviews     │ │ Follow-ups      │
│ Questions      │ │ Evaluation      │
│ Answers        │ │ Feedback        │
│ Results        │ │                 │
└────────────────┘ └─────────────────┘
```

---

# 🛠️ Tech Stack

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Axios
* Web Speech APIs
* MediaDevices API

## Backend

* Python
* FastAPI
* SQLAlchemy
* Alembic
* Pydantic

## Database

* PostgreSQL

## AI

The AI layer is responsible for:

* Interview question generation
* Follow-up question generation
* Answer analysis
* Candidate evaluation
* Feedback generation
* Interview summaries

The AI integration is separated from the core interview logic so the underlying model can be changed without redesigning the entire platform.

## Infrastructure

* Docker
* Docker Compose
* PostgreSQL
* Alembic
* Git

---

# 📁 Project Structure

```text
InterviewPulse/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── database/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── main.py
│   │
│   ├── alembic/
│   │   ├── versions/
│   │   └── env.py
│   │
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   └── ...
│   │
│   ├── package.json
│   └── vite.config.ts
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

Make sure you have:

* Git
* Docker
* Docker Compose
* Node.js
* Python 3.11+

---

## Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/InterviewPulse.git

cd InterviewPulse
```

---

## Configure Environment Variables

```bash
cp .env.example .env
```

Configure the required variables:

```env
DATABASE_URL=postgresql://postgres:postgres@db:5432/interviewpulse

SECRET_KEY=your-secret-key

AI_API_KEY=your-api-key
```

Never commit `.env` or API keys to the repository.

---

# 🐳 Running with Docker

Build and start the application:

```bash
docker compose up --build
```

Run in the background:

```bash
docker compose up -d
```

Stop the application:

```bash
docker compose down
```

---

# 🗃️ Database Migrations

InterviewPulse uses **Alembic** for database migrations.

Apply migrations:

```bash
docker compose exec backend alembic upgrade head
```

Create a new migration:

```bash
docker compose exec backend alembic revision --autogenerate -m "describe change"
```

Check the current migration:

```bash
docker compose exec backend alembic current
```

---

# 🧪 Testing

Run backend tests:

```bash
pytest
```

Run frontend tests:

```bash
npm test
```

Build the frontend:

```bash
npm run build
```

---

# 🔐 Security

InterviewPulse follows common application security practices:

* Password hashing
* Protected API endpoints
* Environment-based secrets
* Input validation
* Database-level constraints
* CORS configuration
* Authentication and authorization

For production deployments, additional security measures such as HTTPS, rate limiting, secure token configuration, monitoring, and secret management should be added.

---

# 🗺️ Roadmap

### Phase 1 — Core Platform

* [x] Project setup
* [x] Authentication
* [x] PostgreSQL database
* [x] Database migrations
* [x] Interview sessions
* [x] Interview questions
* [x] Candidate answers

### Phase 2 — Text Interviews

* [x] Text interview interface
* [x] AI questions
* [x] Answer submission
* [x] Context-aware follow-ups
* [x] AI evaluation
* [x] Feedback

### Phase 3 — Video Interviews

* [x] Camera integration
* [x] Microphone integration
* [x] Speech recognition
* [x] Text-to-speech
* [x] Interview timer
* [x] Spoken AI questions
* [x] Spoken candidate answers

### Phase 4 — Advanced Interviews

* [ ] Better conversational memory
* [ ] Dynamic interview difficulty
* [ ] Topic-specific interviews
* [ ] Behavioral interview mode
* [ ] System-design interview mode
* [ ] Coding interview mode

### Phase 5 — Analytics

* [ ] Interview history
* [ ] Performance trends
* [ ] Skill analysis
* [ ] Weak-topic detection
* [ ] Personalized recommendations
* [ ] Progress tracking

### Phase 6 — Production

* [ ] CI/CD
* [ ] Production deployment
* [ ] Automated testing pipeline
* [ ] Monitoring
* [ ] Error tracking
* [ ] Performance optimization

---

# 🎯 Project Goals

InterviewPulse aims to make interview preparation more accessible and realistic.

### Practice your way

Candidates can choose:

**Text Mode**

> Best for focused practice and quickly going through multiple questions.

**Video Mode**

> Best for simulating a real interview and practicing verbal communication.

### Practice → Analyze → Improve

```text
              ┌──────────────┐
              │    Practice  │
              └──────┬───────┘
                     │
                     ▼
              ┌──────────────┐
              │   Interview  │
              └──────┬───────┘
                     │
                     ▼
              ┌──────────────┐
              │   Evaluate   │
              └──────┬───────┘
                     │
                     ▼
              ┌──────────────┐
              │   Feedback   │
              └──────┬───────┘
                     │
                     ▼
              ┌──────────────┐
              │    Improve   │
              └──────────────┘
```

---

# 🤝 Contributing

Contributions are welcome.

Create a feature branch:

```bash
git checkout -b feature/my-feature
```

Commit your changes:

```bash
git commit -m "feat: add interview analytics"
```

Push the branch:

```bash
git push origin feature/my-feature
```

Then open a Pull Request.

---

# 📄 License

This project is currently intended for educational and portfolio purposes.

---

# 👨‍💻 Author

**Zelalem Getnet**

Computer Science Graduate & Full-Stack Developer

Interested in:

* Backend Engineering
* Python
* Django / Flask
* Node.js
* React
* PostgreSQL
* AI-powered applications
* Software Architecture

---

## ⭐ InterviewPulse

InterviewPulse combines **AI, conversational interviews, and full-stack engineering** to create a more realistic way to prepare for technical and behavioral interviews.

Whether you prefer typing your answers or practicing face-to-face with a camera and microphone:

**Choose your mode. Start the interview. Get feedback. Improve.**
