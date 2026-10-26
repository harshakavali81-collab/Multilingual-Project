"""Insert small multilingual demo documents into the configured database."""
from main import DBDocument, SessionLocal, _DOCUMENT_EMBEDDINGS, embed_text

SAMPLES = [
    ("Platform introduction (English)", "The knowledge base stores useful articles and lets users ask questions about uploaded information. Documents are searched by similarity and relevant passages are used as evidence.", "English"),
    ("సౌర శక్తి (Telugu)", "సౌర శక్తి సూర్యకాంతి నుండి ఉత్పత్తి అవుతుంది. సౌర ప్యానెల్లు సూర్యకాంతిని విద్యుత్తుగా మారుస్తాయి. ఈ శక్తి పునరుత్పాదకమైనది మరియు కాలుష్యాన్ని తగ్గించడంలో సహాయపడుతుంది.", "Telugu"),
    ("सौर ऊर्जा (Hindi)", "सौर ऊर्जा सूर्य के प्रकाश से प्राप्त होती है। सौर पैनल सूर्य के प्रकाश को बिजली में बदलते हैं। यह नवीकरणीय ऊर्जा स्रोत है और प्रदूषण कम करने में मदद करता है।", "Hindi"),
    ("சூரிய ஆற்றல் (Tamil)", "சூரிய ஆற்றல் சூரிய ஒளியிலிருந்து கிடைக்கிறது. சோலார் பலகைகள் சூரிய ஒளியை மின்சாரமாக மாற்றுகின்றன. இது புதுப்பிக்கத்தக்க ஆற்றல் மூலமாகும்.", "Tamil"),
    ("ಸೌರ ಶಕ್ತಿ (Kannada)", "ಸೌರ ಶಕ್ತಿಯನ್ನು ಸೂರ್ಯನ ಬೆಳಕಿನಿಂದ ಪಡೆಯಲಾಗುತ್ತದೆ. ಸೌರ ಫಲಕಗಳು ಸೂರ್ಯನ ಬೆಳಕನ್ನು ವಿದ್ಯುತ್ ಆಗಿ ಪರಿವರ್ತಿಸುತ್ತವೆ. ಇದು ನವೀಕರಿಸಬಹುದಾದ ಶಕ್ತಿಯ ಮೂಲವಾಗಿದೆ.", "Kannada"),
]


def main() -> None:
    with SessionLocal() as db:
        if db.query(DBDocument).count():
            print("Demo seed skipped: the knowledge base already contains documents.")
            return
        for title, content, language in SAMPLES:
            db.add(DBDocument(title=title, content=content, language=language, category="Demo"))
        db.commit()
        for document in db.query(DBDocument).filter(DBDocument.category == "Demo").all():
            _DOCUMENT_EMBEDDINGS[document.id] = embed_text(document.content)
        print("Inserted " + str(len(SAMPLES)) + " sample documents.")


if __name__ == "__main__":
    main()
