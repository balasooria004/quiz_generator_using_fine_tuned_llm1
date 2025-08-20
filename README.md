# quiz_generator_using_fine_tuned_llm1
# QuizApp

A web application for generating quizzes, short answer, and long answer questions from PDF study materials using AI (Perplexity API + GPT).

---

## Features

- Upload a PDF and automatically generate:
  - Multiple Choice Questions (MCQs)
  - Short Answer Questions
  - Long Answer (Conceptual) Questions
- FastAPI backend with CORS support
- React frontend for interactive quiz experience

---

## Requirements

- Python 3.10, 3.11, or 3.12 (recommended)
- Node.js & npm (for frontend)
- Perplexity API key (get from [perplexity.ai](https://www.perplexity.ai/))
- [en_core_web_sm](https://spacy.io/models/en) spaCy model (auto-downloaded)
- [PyPDF2](https://pypi.org/project/PyPDF2/), [nltk](https://www.nltk.org/), [spacy](https://spacy.io/), [fastapi](https://fastapi.tiangolo.com/), [uvicorn](https://www.uvicorn.org/), [requests](https://docs.python-requests.org/)

---

## Setup

### 1. Backend

```sh
cd backend
python -m venv venv
venv\Scripts\activate  # On Windows
pip install -r requirements.txt
```

Create a `.env` file in the backend directory:
```
API_KEY=your_perplexity_api_key_here
```

#### Run the backend:
```sh
python backend.py
```
or
```sh
uvicorn backend:app --reload
```

The backend will be available at [http://localhost:8000](http://localhost:8000).

---

### 2. Frontend

```sh
cd frontend
npm install
npm start
```

The frontend will be available at [http://localhost:3000](http://localhost:3000).

---

## Usage

1. Open the frontend in your browser.
2. Upload a PDF file.
3. Wait for the AI to generate quiz, short answer, and long answer questions.
4. Take the quiz or review the generated questions and answers.

---

## Project Structure

```
quizapp/
├── backend/
│   ├── backend.py
│   ├── requirements.txt
│   └── .env
└── frontend/
    ├── src/
    ├── package.json
    └── ...
```

---
## Screeshots
<img width="1841" height="997" alt="Screenshot 2025-08-20 220245" src="https://github.com/user-attachments/assets/09c21859-1e3c-4402-8cb9-03b42406e5df" />
<img width="1853" height="1004" alt="Screenshot 2025-08-20 220227" src="https://github.com/user-attachments/assets/f1a8f9f5-ee1f-4b5a-931b-de9e7e6f9e67" />
<img width="1687" height="999" alt="Screenshot 2025-08-20 220209" src="https://github.com/user-attachments/assets/b68fe5dc-ffb8-4917-9b43-3b1b94a19828" />
<img width="1764" height="919" alt="Screenshot 2025-08-20 195427" src="https://github.com/user-attachments/assets/13f67be2-ef88-4bda-bbb0-ffa792c25eca" />

## Notes

- Make sure you have enough disk space for model downloads.
- If you encounter issues with `sentencepiece` or other dependencies, use Python 3.10–3.12.
- The backend uses the Perplexity API for question generation. You must provide a valid API key.

---



## Credits

- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://react.dev/)
- [Perplexity AI](https://www.perplexity.ai/)
- [spaCy](https://spacy.io/)
- [NLTK](https://www.nltk.org/)
