from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import market, user
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Crypto Trading Bot API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(market.router)
app.include_router(user.router)

@app.get("/")
async def root():
    return {"message": "Crypto Trading Bot API is running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
