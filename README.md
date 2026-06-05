# StudyPilot 

##  Description

StudyPilot is a full-stack AI-powered learning platform designed to enhance the studying experience by integrating artificial intelligence into daily learning workflows.

Users can upload PDF files or input text, and the system automatically generates:
- Smart summaries
- Interactive quizzes
- AI-powered chat responses based on study content

The application also supports session-based chat history, authentication, and persistent storage using PostgreSQL with Prisma.

The project is fully containerized using Docker and follows a modern client-server architecture.

##  Features

- AI-powered chat with study materials  
- Automatic PDF text extraction  
- AI-based summary generation  
- Interactive quiz generation from content  
- Multiple-choice quiz evaluation with scoring  
- Session-based chat history management  
- User authentication (JWT login/register)  
- Persistent storage using PostgreSQL (Prisma)  
- Dockerized full-stack application (Frontend + Backend)

##  Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- Nginx (production server)

### Backend
- Node.js
- Express.js
- Prisma ORM
- PostgreSQL (Neon)
- JWT Authentication
- Multer (file upload)
- PDF Parse

### AI & Services
- OpenRouter API (GPT-4o-mini)
- Custom AI service layer

### DevOps
- Docker
- Docker Compose

##  Environment Variables

### Backend (.env)
- DATABASE_URL="your_postgres_url"
- JWT_SECRET=your_secret_key 
- OPENROUTER_API_KEY=your_api_key 
- PORT=5000


### Frontend
VITE_API_URL="http://localhost:5000"


##  Run with Docker

### 1. Clone the repository
### 2. Create backend .env file
### 3. Run the project
docker compose up --build


##  Access the App

- Frontend: http://localhost:5173  
- Backend: http://localhost:5000  



##  Architecture
Frontend (React + Nginx) | Backend (Express API) | PostgreSQL (Neon DB) | OpenRouter AI (GPT-4o-mini)


##  Notes

- The project uses Docker Compose to run both frontend and backend together.
- Prisma migrations are handled automatically during build.
- AI responses are generated via OpenRouter API.
- PDF files are parsed using pdf-parse.



##  Author

Built by Amin as a Full-stack AI learning platform project.
