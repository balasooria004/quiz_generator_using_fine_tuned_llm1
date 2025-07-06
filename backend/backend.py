# backend.py
import PyPDF2
from typing import Dict, Any
from io import BytesIO
import logging
import nltk
from nltk.tokenize import sent_tokenize
import spacy
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import requests
import json
from dotenv import load_dotenv
import os

# Setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class QuestionGenerator:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.model = "sonar"  # Updated model name
        self.base_url = "https://api.perplexity.ai"
        nltk.download('punkt', quiet=True)
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except:
            import subprocess
            subprocess.run(["python", "-m", "spacy", "download", "en_core_web_sm"])
            self.nlp = spacy.load("en_core_web_sm")

    def extract_text(self, pdf_file):
        try:
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            return " ".join([page.extract_text() for page in pdf_reader.pages])
        except Exception as e:
            logger.error(f"PDF error: {e}")
            return ""

    def generate_with_gpt(self, prompt):
        try:
            headers = {
                "accept": "application/json",
                "content-type": "application/json",
                "Authorization": f"Bearer {self.api_key}"
            }
            
            payload = {
                "model": self.model,
                "messages": [
                    {
                        "role": "system",
                        "content": "You are an AI assistant that helps generate educational questions and answers."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "temperature": 0.7,
                "max_tokens": 1000
            }
            
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload
            )
            
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]
        except requests.exceptions.HTTPError as err:
            logger.error(f"Perplexity API HTTP error: {err}")
            logger.error(f"Response content: {err.response.text}")
            if err.response.status_code == 401:
                logger.error("Authentication failed. Please check your API key.")
            return ""
        except Exception as e:
            logger.error(f"Perplexity API error: {e}")
            return ""

    def generate_all_questions(self, text: str, num_questions: int = 5):
        chunks = self._chunk_text(text)
        results = {
            "quiz": [],
            "short_answers": [],
            "long_answers": []
        }

        for chunk in chunks[:num_questions*3]:  # Generate extra
            # Quiz Questions (MCQ)
            mcq_prompt = f"""Create a multiple choice question with 4 options and mark the correct answer with (*):
            Text: {chunk}
            Format exactly like:
            Q: [question]
            A) [option1]
            B) [option2] (*)
            C) [option3]
            D) [option4]"""
            
            mcq_result = self.generate_with_gpt(mcq_prompt)
            if mcq_result and "(*)" in mcq_result:
                parsed = self._parse_mcq(mcq_result)
                if parsed:  # Only add if parsing succeeded
                    results["quiz"].append(parsed)

            # Short Answer
            short_prompt = f"Create one concise question and answer (1-2 sentence answer) from: {chunk}\nFormat: Q: [question]? A: [answer]"
            short_result = self.generate_with_gpt(short_prompt)
            if short_result and "Q:" in short_result and "A:" in short_result:
                parsed = self._parse_qa(short_result)
                if parsed:
                    results["short_answers"].append(parsed)

            # Long Answer
            long_prompt = f"Create one conceptual question requiring paragraph-length answer from: {chunk}\nFormat: Q: [question]? A: [answer]"
            long_result = self.generate_with_gpt(long_prompt)
            if long_result and "Q:" in long_result and "A:" in long_result:
                parsed = self._parse_qa(long_result)
                if parsed:
                    results["long_answers"].append(parsed)

        return {k: v[:num_questions] for k, v in results.items()}

    def _parse_mcq(self, text):
        try:
            lines = [line.strip() for line in text.split('\n') if line.strip()]
            if not lines:
                return None
                
            question = lines[0].replace("Q:", "").strip()
            options = []
            correct = ""
            
            for line in lines[1:5]:
                if "(*)" in line:
                    correct = line[0]
                    options.append(line.replace("(*)", "").strip())
                else:
                    options.append(line.strip())
            
            if not question or len(options) < 4 or not correct:
                return None
                
            return {
                "question": question,
                "options": options,
                "correct": correct
            }
        except Exception as e:
            logger.error(f"MCQ parsing error: {e}")
            return None

    def _parse_qa(self, text):
        try:
            parts = text.split("Q:")[1].split("A:")
            if len(parts) != 2:
                return None
                
            q, a = parts
            return {
                "question": q.strip(),
                "answer": a.strip()
            }
        except Exception as e:
            logger.error(f"QA parsing error: {e}")
            return None

    def _chunk_text(self, text):
        sentences = sent_tokenize(text)
        chunks, current = [], ""
        for sent in sentences:
            if len(current + sent) < 1500:
                current += " " + sent
            else:
                chunks.append(current.strip())
                current = sent
        if current.strip():
            chunks.append(current.strip())
        return chunks

# Initialize with your Perplexity API key
# Get your key from https://perplexity.ai/
generator = QuestionGenerator(api_key=API_KEY)

@app.post("/generate")
async def generate(file: UploadFile = File(...), count: int = 5):
    try:
        text = generator.extract_text(BytesIO(await file.read()))
        return generator.generate_all_questions(text, count)
    except Exception as e:
        raise HTTPException(500, str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)