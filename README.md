# Trading_Bot

Sanitized trading bot packaging. This repository contains a cleaned copy of the user's trading bot (`update.py`) with secrets moved to environment variables.

Important: Do NOT commit real API keys. Use a `.env` file or your environment to provide the following variables:

- BINANCE_API_KEY
- BINANCE_API_SECRET
- DISCORD_BOT_TOKEN
- OPENAI_API_KEY (optional)

Files:
- `update.py` - main bot code (sanitized).
- `requirements.txt` - Python dependencies.
- `.env.example` - example environment variables.

How to run (PowerShell):

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
# set environment variables, then:
python update.py
```