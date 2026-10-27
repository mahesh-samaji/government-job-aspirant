# GovPrep — Government Exam Preparation Platform

GovPrep is a full-stack web application designed to help government job aspirants explore job opportunities, prepare for competitive exams, organize study plans, and track their preparation progress.

## Features

- **Authentication:** User registration, email OTP verification, login, and password recovery.
- **Government Jobs:** Browse and explore government job opportunities.
- **Competitive Exams:** View exam-related information and preparation resources.
- **Personalized Study Plans:** Organize preparation based on study goals.
- **Study Roadmaps:** Follow structured preparation steps and track progress.
- **Notifications:** Receive relevant updates and reminders.
- **User Dashboard:** Access preparation information in one place.

## Tech Stack

**Frontend**
- React
- Tailwind CSS
- Vite

**Backend**
- Node.js
- Express.js
- REST APIs

**Database and Services**
- MongoDB
- Mongoose
- Nodemailer for email notifications

## Project Structure

```text
government-job-aspirant/
├── Client/                 # React frontend
│   ├── public/
│   └── src/
├── server/                 # Express backend
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── utils/
├── test-api.js             # Login API test
└── .gitignore
```

## Getting Started

### Prerequisites

- Node.js and npm
- MongoDB Atlas account or a local MongoDB instance
- Git

### 1. Clone the repository

```bash
git clone https://github.com/mahesh-samaji/government-job-aspirant.git
cd government-job-aspirant
```

### 2. Install backend dependencies

```bash
cd server
npm install
```

Configure the required environment variables in `server/.env`. Refer to the environment variable names used by the backend source code. Never commit real credentials.

### 3. Start the backend

Use the start command defined in `server/package.json`, for example:

```bash
npm start
```

### 4. Install frontend dependencies

Open another terminal:

```bash
cd Client
npm install
```

### 5. Start the frontend

Use the development command defined in `Client/package.json`, typically:

```bash
npm run dev
```

## Security

- Store database credentials, email passwords, and other secrets in environment variables.
- Do not commit `.env` files or API keys.
- Validate and protect sensitive API endpoints.

## Project Status

GovPrep is an ongoing full-stack project focused on government job discovery and competitive exam preparation.

## Author

**Mahesh Samaji**

GitHub: [@mahesh-samaji](https://github.com/mahesh-samaji)
