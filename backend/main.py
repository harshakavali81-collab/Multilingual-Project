import os
import hashlib
import numpy as np
from pypdf import PdfReader
from fastapi import FastAPI, Depends, HTTPException, Form, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from groq import Groq
from langdetect import detect
import datetime

# --- SYSTEM CONFIGURATION ---
# Switching from PostgreSQL to a local SQLite database file for native running
DATABASE_URL = "sqlite:///./local_kb.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Initialize AI Core Engineering Models
# LaBSE handles cross-lingual vector spaces (mapping Hindi/Telugu/Tamil/English together)
print("Loading Multilingual LaBSE Embedding Model... (This may take a moment on first launch)")
encoder = SentenceTransformer('sentence-transformers/LabSE')

# Read Groq API Key directly from environment setup
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

print("Groq Key Loaded:", bool(GROQ_API_KEY))

if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY not found")

groq_client = Groq(api_key=GROQ_API_KEY)

app = FastAPI(title="Multilingual Indian Language Knowledge Base Platform")

# CORS Setup for React frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- IN-MEMORY LOCAL VECTOR STORAGE (QDRANT FALLBACK) ---
# Stores { document_id: embedding_vector_list } for semantic cross-lingual matching
LOCAL_VECTOR_INDEX = {}

# --- DATABASE SCHEMAS (SQLite Persistent Storage) ---
class DBDocument(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    language = Column(String(20), nullable=False)
    category = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

# Automatically generate local SQLite database tables if missing
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class QueryRequest(BaseModel):
    query: str
    preferred_language: str

# --- TRANSLATION LAYER (LOCAL CACHE & ACCELERATION) ---
LOCAL_TRANSLATION_CACHE = {}

def translate_fallback(text: str, target_lang: str) -> str:
    """
    Acts as a translation layer preprocessing placeholder.
    In full production mode, this routes to your independent IndicTrans2 microservice.
    """
    cache_key = f"{hashlib.md5(text.encode('utf-8')).hexdigest()}:{target_lang}"
    if cache_key in LOCAL_TRANSLATION_CACHE:
        return LOCAL_TRANSLATION_CACHE[cache_key]

    try:
        from deep_translator import GoogleTranslator
        # Map target long names to short codes if necessary
        lang_codes = {"English": "en", "Hindi": "hi", "Telugu": "te", "Tamil": "ta"}
        code = lang_codes.get(target_lang, "en")
        translated = GoogleTranslator(source='auto', target=code).translate(text)
        LOCAL_TRANSLATION_CACHE[cache_key] = translated
        return translated
    except Exception:
        return text

# --- CORE BACKEND SYSTEM ENDPOINTS ---

@app.get("/health")
def system_health():
    return {"status": "operational", "timestamp": datetime.datetime.utcnow()}

@app.get("/articles")
def read_all_articles(db: Session = Depends(get_db)):
    return db.query(DBDocument).all()

@app.post("/upload")
async def ingest_document(
    title: str = Form(...),
    content: str = Form(...),
    category: str = Form("General"),
    db: Session = Depends(get_db)
):
    # Core Feature: Automatic Language Identification
    try:
        detected_iso = detect(content)
        lang_mapping = {"en": "English", "hi": "Hindi", "te": "Telugu", "ta": "Tamil"}
        language = lang_mapping.get(detected_iso, "English")
    except Exception:
        language = "English"

    # 1. Persistent Storage Save (SQL)
    db_doc = DBDocument(title=title, content=content, language=language, category=category)
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)

    # 2. Multilingual Embedding Vector Extraction via LaBSE
    vector = encoder.encode(content)
    LOCAL_VECTOR_INDEX[db_doc.id] = vector.tolist()

    return {
        "message": "Document processed and indexed successfully", 
        "document_id": db_doc.id, 
        "detected_language": language
    }

@app.post("/ask")
async def cross_language_query(payload: QueryRequest, db: Session = Depends(get_db)):
    query_text = payload.query

    language_map = {
        "en": "English",
        "hi": "Hindi",
        "te": "Telugu",
        "ta": "Tamil",
        "kn": "Kannada"
    }

    selected_language = payload.preferred_language


    try:
        input_lang_iso = detect(query_text)

        if selected_language == "auto":
            selected_language = input_lang_iso

    except Exception:
        input_lang_iso = "en"
        
    user_lang = language_map.get(
        selected_language,
        "English"
    )    

    # Load vectors from DB if memory index is empty
    if not LOCAL_VECTOR_INDEX:
        docs = db.query(DBDocument).all()

        for doc in docs:
            vector = encoder.encode(doc.content)
            LOCAL_VECTOR_INDEX[doc.id] = vector.tolist()

    if not LOCAL_VECTOR_INDEX:
        return {
            "answer": "The platform database is currently empty. Please upload documents first.",
            "sources": []
        }

    # Create query embedding
    query_vector = encoder.encode(query_text)

    scores = []

    for doc_id, doc_vec in LOCAL_VECTOR_INDEX.items():

        dot_product = np.dot(query_vector, doc_vec)

        norm_q = np.linalg.norm(query_vector)
        norm_d = np.linalg.norm(doc_vec)

        similarity = (
            dot_product / (norm_q * norm_d)
            if (norm_q * norm_d) > 0
            else 0
        )

        scores.append((doc_id, similarity))

    scores.sort(key=lambda x: x[1], reverse=True)

    top_matches = scores[:3]

    context_segments = []
    retrieved_sources = []

    for doc_id, sim_score in top_matches:

        if sim_score < 0.15:
            continue

        db_doc = (
            db.query(DBDocument)
            .filter(DBDocument.id == doc_id)
            .first()
        )

        if db_doc:
            context_segments.append(
                f"Document Title: {db_doc.title} "
                f"(Language: {db_doc.language})\n"
                f"Content: {db_doc.content}"
            )

            retrieved_sources.append({
                "id": db_doc.id,
                "title": db_doc.title,
                "language": db_doc.language
            })

    if not context_segments:
        return {
            "answer": "No relevant cross-lingual context matched your query.",
            "sources": []
        }

    unified_context = "\n\n".join(context_segments)

    prompt = f"""
    You are a helpful AI assistant.

    Use ONLY the provided context.

    Rules:
    - Give a short answer.
    - Never repeat Document Title.
    - Never repeat Content.
    - Answer naturally.
    - Use {user_lang} language.

    Context:
    {unified_context}

    Question:
    {query_text}

    Answer:
    """

    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.2
        )

        final_answer = completion.choices[0].message.content.strip()

    except Exception as e:
        return {
            "answer": f"Groq Error: {str(e)}",
            "sources": []
        }

    return {
        "answer": final_answer,
        "sources": retrieved_sources,
        "detected_query_iso": input_lang_iso
    }
    
@app.post("/upload-file")
async def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    content = await file.read()

    if file.filename.endswith(".pdf"):

        import io

        pdf = PdfReader(
            io.BytesIO(content)
        )

        text = ""

        for page in pdf.pages:
            text += page.extract_text() + "\n"

    else:
        text = content.decode("utf-8")

    try:
        detected_iso = detect(text)

        lang_mapping = {
            "en": "English",
            "hi": "Hindi",
            "te": "Telugu",
            "ta": "Tamil"
        }

        language = lang_mapping.get(
            detected_iso,
            "English"
        )

    except Exception:
        language = "English"

    db_doc = DBDocument(
        title=file.filename,
        content=text,
        language=language,
        category="Uploaded"
    )

    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)

    vector = encoder.encode(text)

    LOCAL_VECTOR_INDEX[
        db_doc.id
    ] = vector.tolist()

    return {
        "message": "File Uploaded Successfully",
        "document_id": db_doc.id,
        "filename": file.filename
    }    