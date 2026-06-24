# EduQuest

AI-powered quiz and contest platform built with **React**, **Java Spring Boot**, and **MongoDB**.

## Features

- User registration, login, and profile management with photo upload
- Secure contest rooms with unique 6-character Room IDs
- Manual and AI-generated question creation (OpenAI optional)
- Per-question or full-contest timer modes
- Real-time leaderboard via WebSocket (STOMP)
- Podium and bar chart results page
- Per-contest scoring, ranking, and analytics

## Project Structure

```
project/
├── backend/          # Spring Boot API (port 8080)
├── frontend/         # React + Vite app (port 5173)
├── docker-compose.yml
└── README.md
```

## Prerequisites

- Java 17+
- Maven 3.8+
- Node.js 18+
- MongoDB 6+ (or Docker)

## Quick Start

### 1. Start MongoDB

```bash
docker compose up -d
```

Or use a local MongoDB instance at `mongodb://localhost:27017/eduquest`.

### 2. Start Backend

```bash
cd backend
mvn spring-boot:run
```

API runs at `http://localhost:8080`.

### 3. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`.

## Optional: AI Question Generation

Set your OpenAI API key in `backend/src/main/resources/application.properties`:

```properties
openai.api.key=sk-your-key-here
```

Without a key, the system uses built-in template questions.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/users/me` | Get profile |
| POST | `/api/contests` | Create contest |
| GET | `/api/contests/room/{roomId}` | Get contest by room |
| POST | `/api/contests/room/{roomId}/join` | Join contest |
| POST | `/api/contests/room/{roomId}/start` | Start contest (host) |
| POST | `/api/contests/room/{roomId}/end` | End contest (host) |
| POST | `/api/contests/room/{roomId}/answer` | Submit answer |
| GET | `/api/contests/room/{roomId}/leaderboard` | Get leaderboard |
| POST | `/api/contests/generate-questions` | AI generate questions |
| GET | `/api/analytics/history` | User contest history |
| GET | `/api/analytics/stats` | User stats |

WebSocket: `ws://localhost:8080/ws` — subscribe to `/topic/contest/{roomId}/leaderboard` and `/topic/contest/{roomId}/status`.

## Usage Flow

1. **Register** an account and optionally upload a profile photo.
2. **Host**: Create a contest → share Room ID → start when participants join.
3. **Participant**: Enter Room ID → wait in lobby → answer questions when live.
4. **Results**: View podium, rankings, and personal analytics after the contest ends.

## Tech Stack

- **Frontend**: React 19, Vite, React Router, Axios, STOMP/WebSocket, Recharts
- **Backend**: Spring Boot 3, Spring Security (JWT), Spring Data MongoDB, WebSocket
- **Database**: MongoDB
