# Multilingual Indian Language Knowledge Base Platform

## Project Overview

This project is a multilingual knowledge base platform that allows users to upload documents and ask questions in multiple Indian languages.

Supported Languages:

- English
- Hindi
- Telugu
- Tamil
- Kannada

The system retrieves information from uploaded documents and returns answers in the user's preferred language.

---

## Features

### Document Upload

- Upload text documents
- Automatic language detection
- Store documents in database

### Multilingual Search

- Query documents in different languages
- Cross-language retrieval support

### Translation Support

- English
- Hindi
- Telugu
- Tamil
- Kannada

### Auto Detect Language

- Detect query language automatically

### Chat History

- Stores previous questions and answers

### Source Display

- Shows source documents used to generate answers

### Loading Indicator

- Displays "Thinking..." while processing

### Document Preview

- Shows uploaded document preview

### Language Analytics

- Displays language usage statistics

### Export Chat

- Download chat history as JSON file

---

## Technology Stack

### Frontend

- React.js
- Vite
- JavaScript
- CSS

### Backend

- FastAPI
- Python

### Database

- SQLite

### AI / NLP

- Sentence Transformers
- LangDetect
- Translation APIs
- Groq API

---

## Project Structure

```
Multilingual Project
│
├── frontend
│ ├── src
│ ├── public
│ └── package.json
│
├── backend
│ ├── main.py
│ ├── models.py
│ ├── services.py
│ ├── requirements.txt
│ └── local_kb.db
│
└── README.md
```

---

## Installation

### Backend

Create virtual environment

```bash
python -m venv .venv
```

Activate

```bash
.venv\Scripts\activate
```

Install packages

```bash
pip install -r requirements.txt
```

Run backend

```bash
uvicorn main:app --reload
```

---

### Frontend

Go to frontend folder

```bash
cd frontend
```

Install packages

```bash
npm install
```

Run frontend

```bash
npm run dev
```

---

## API Endpoints

### Ask Question

```http
POST /ask
```

### Upload File

```http
POST /upload-file
```

---

## Screenshots

Add screenshots of:

- Home Page
- File Upload
- Question Answering
- Source Display
- Language Analytics

---

## Future Improvements

- Voice Input
- PDF Support
- Docker Deployment
- Admin Dashboard
- Advanced Analytics

---

## Author

Harsha Kavali

Multilingual Indian Language Knowledge Base Platform