# InterviewPulse

> **AI-powered mock interview platform for practicing technical and behavioral interviews with real-time voice interaction, adaptive follow-up questions, and automated feedback.**

InterviewPulse is a full-stack AI interview platform designed to simulate realistic technical interviews. Instead of simply presenting a fixed list of questions, InterviewPulse maintains the state of an interview, listens to the candidate's answers, generates contextual follow-up questions, and evaluates the candidate's performance.

The goal is to provide developers and job seekers with a realistic environment where they can practice interviewing without needing a human interviewer.

---

## ✨ Features

### 🎤 Conversational AI Interviews

* AI interviewer asks interview questions using voice.
* Candidate answers using their microphone.
* Speech is converted into text.
* AI analyzes the candidate's answer.
* Follow-up questions can be generated based on previous answers.
* Interview state is maintained throughout the session.

### 🧠 Adaptive Follow-Up Questions

Unlike traditional mock interview applications that use predetermined questions, InterviewPulse can dynamically continue the conversation.

For example:

```text
AI: Explain how database indexing works.

Candidate:
An index improves query performance by allowing the database
to find rows without scanning the entire table.

AI:
Good. What are some disadvantages of adding too many indexes?
```

The next question can depend on what the candidate previously said.

### 📹 Video Interview Experience

InterviewPulse is designed around a realistic interview environment:

* Camera support
* Microphone support
* Live interview interface
* Interview timer
* Question display
* Candidate response recording
* Interview state management

### 🔊 Text-to-Speech

The AI interviewer can speak questions aloud, creating a more natural interview experience.

### 📝 Speech-to-Text

Candidate responses can be transcribed from microphone input so that they can be analyzed by the evaluation system.

### 📊 Automated Evaluation

After answering questions, candidates receive feedback including:

* Overall score
* Answer score
* Strengths
* Weaknesses
* Feedback summary
* Suggested improvements
* Model/reference answer

### 🔐 Authentication

InterviewPulse supports authenticated users so interview history and evaluation results can be associated with individual accounts.

### 🗄️ Persistent Interview Data

Interview sessions can store information such as:

* Interview
* Questions
* Candidate answers
* Follow-up questions
* Scores
* Feedback
* Interview results

---

# 🏗️ Architecture

InterviewPulse follows a client-server architecture:

```text
┌──────────────────────────┐
│        React Client      │
│                          │
│  Interview UI            │
│  Camera / Microphone     │
│  Speech Recognition      │
│  Audio Playback          │
└────────────┬─────────────┘
             │
             │ HTTP / REST API
             ▼
┌──────────────────────────┐
│      Python Backend      │
│                          │
│  Authentication          │
│  Interview Management    │
│  Conversation State      │
│  AI Evaluation           │
│  Follow-up Generation    │
└────────────┬─────────────┘
             │
       ┌─────┴─────┐
       ▼           ▼
┌───────────┐ ┌─────────────┐
│ PostgreSQL│ │ AI Provider │
│           │ │             │
│ Users     │ │ Generation  │
│ Interviews│ │ Evaluation  │
│ Answers   │ │ Follow-ups  │
│ Feedback  │ │             │
└───────────┘ └─────────────┘
```

---

# 🛠️ Tech Stack

## Frontend

* React
* TypeScript
* Vite
* CSS / Tailwind CSS
* Web Speech APIs
* MediaDevices API
* Axios

## Backend

* Python
* FastAPI
* SQLAlchemy
* Alembic
* Pydantic

## Database

* PostgreSQL

## AI

InterviewPulse is designed to work with an LLM provider for:

* Question generation
* Follow-up question generation
* Answer evaluation
* Feedback generation
* Interview summaries

The AI layer is abstracted so that the underlying model can be changed without rewriting the interview system.

## Development / Infrastructure

* Docker
* Docker Compose
* Git
* PostgreSQL
* Alembic migrations

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
│   ├── Dockerfile
│   └── ...
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
│   ├── vite.config.ts
│   └── ...
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

Make sure you have the following installed:

* Git
* Docker
* Docker Compose
* Node.js
* Python 3.11+

---

## 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/InterviewPulse.git

cd InterviewPulse
```

---

## 2. Configure environment variables

Create your environment file:

```bash
cp .env.example .env
```

Configure the required variables:

```env
DATABASE_URL=postgresql://postgres:postgres@db:5432/interviewpulse

SECRET_KEY=your-secret-key

AI_API_KEY=your-api-key
```

> Never commit `.env` or API keys to Git.

---

# 🐳 Running with Docker

Build and start the application:

```bash
docker compose up --build
```

Run in detached mode:

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

Create a migration:

```bash
docker compose exec backend alembic revision --autogenerate -m "describe change"
```

Apply migrations:

```bash
docker compose exec backend alembic upgrade head
```

Check migration status:

```bash
docker compose exec backend alembic current
```

---

# 🖥️ Running Without Docker

## Backend

Navigate to the backend:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it:

### Linux/macOS

```bash
source venv/bin/activate
```

### Windows

```powershell
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the server:

```bash
uvicorn app.main:app --reload
```

---

## Frontend

Navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

---

# 🔄 Interview Flow

A typical InterviewPulse session works like this:

```text
                Start Interview
                       │
                       ▼
              Select Interview Type
                       │
                       ▼
                AI asks Question
                       │
                       ▼
              Text-to-Speech
                       │
                       ▼
             Candidate Responds
                       │
                       ▼
              Speech-to-Text
                       │
                       ▼
               Answer Analysis
                       │
                 ┌─────┴─────┐
                 │           │
              Follow-up   Next Question
                 │           │
                 └─────┬─────┘
                       ▼
                Continue Interview
                       │
                       ▼
                 Final Evaluation
                       │
                       ▼
                Results Dashboard
```

---

# 🧠 Stateful Interview Engine

One of the main goals of InterviewPulse is to avoid treating every question as an isolated interaction.

The backend maintains interview context such as:

```text
Interview
│
├── Question 1
│   └── Answer
│
├── Question 2
│   └── Answer
│
├── Follow-up Question
│   └── Answer
│
├── Question 3
│   └── Answer
│
└── Final Evaluation
```

This allows the AI interviewer to consider previous answers when generating subsequent questions.

---

# 📊 Evaluation

Candidate answers can be evaluated using multiple dimensions.

Example:

```json
{
  "overall_score": 78,
  "technical_accuracy": 82,
  "communication": 75,
  "depth": 76,
  "feedback_summary": "Good understanding of the topic, but the explanation could be more detailed."
}
```

The system can then present the results in a user-friendly dashboard.

---

# 🔌 API

The backend exposes REST endpoints for authentication and interview management.

Example endpoints:

```text
POST   /api/auth/register
POST   /api/auth/login

GET    /api/interviews
POST   /api/interviews

GET    /api/interviews/{id}
POST   /api/interviews/{id}/answers

POST   /api/interviews/{id}/follow-up
POST   /api/interviews/{id}/evaluate

GET    /api/interviews/{id}/results
```

> Endpoint names may change as the application evolves.

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

# 🔒 Security Considerations

InterviewPulse is designed with basic application security practices in mind:

* Passwords are hashed before storage.
* Authentication tokens are used for protected resources.
* Secrets are stored in environment variables.
* API keys are never committed to source control.
* Database access is handled through SQLAlchemy.
* Input validation is handled using Pydantic schemas.

For production deployments, additional protections should be added, including:

* HTTPS
* Rate limiting
* Secure cookie/token configuration
* CORS restrictions
* Request validation
* Production secret management
* Database backups

---

# 🗺️ Roadmap

### Phase 1 — Core Platform

* [x] Project setup
* [x] Authentication
* [x] Database models
* [x] Interview sessions
* [x] Basic interview UI

### Phase 2 — AI Interviewer

* [x] AI-generated questions
* [x] Answer evaluation
* [x] Feedback generation
* [x] Follow-up question logic

### Phase 3 — Voice Interview

* [x] Microphone integration
* [x] Speech recognition
* [x] Text-to-speech
* [x] Interview timer

### Phase 4 — Advanced Interviews

* [ ] Better conversational memory
* [ ] Interview difficulty adjustment
* [ ] Topic-specific interviews
* [ ] Behavioral interview mode
* [ ] System-design interview mode
* [ ] Coding interview mode

### Phase 5 — Analytics

* [ ] Interview history
* [ ] Performance trends
* [ ] Skill-level analysis
* [ ] Weak-topic detection
* [ ] Personalized practice recommendations

### Phase 6 — Production

* [ ] Production deployment
* [ ] CI/CD
* [ ] Automated testing pipeline
* [ ] Monitoring
* [ ] Error tracking
* [ ] Performance optimization

---

# 🎯 Project Goals

InterviewPulse aims to make interview preparation:

* **Accessible** — practice without needing an interviewer.
* **Interactive** — have an actual conversation instead of answering static questions.
* **Adaptive** — questions should respond to previous answers.
* **Measurable** — track performance over time.
* **Practical** — simulate the pressure and flow of a real interview.

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a feature branch.

```bash
git checkout -b feature/my-feature
```

3. Commit your changes.

```bash
git commit -m "feat: add interview analytics"
```

4. Push the branch.

```bash
git push origin feature/my-feature
```

5. Open a Pull Request.

---

# 📄 License

This project is currently intended for educational and portfolio purposes.

Add a license here if the project is later released under an open-source license.

---

# 👨‍💻 Author

**Zelalem Getnet**

Computer Science Graduate | Full-Stack Developer

Focused on:

* Backend Engineering
* Python
* Django / Flask
* Node.js
* React
* PostgreSQL
* AI-powered applications
* Software architecture

---

## ⭐ Why InterviewPulse?

Most mock interview applications follow a simple pattern:

```text
Question → Answer → Score
```

InterviewPulse is designed around:

```text
Question
   ↓
Answer
   ↓
Understand the answer
   ↓
Generate contextual follow-up
   ↓
Continue the conversation
   ↓
Evaluate the complete interview
   ↓
Provide actionable feedback
```

**InterviewPulse is not just a question-and-answer application. It is an attempt to build a conversational interview experience.**
