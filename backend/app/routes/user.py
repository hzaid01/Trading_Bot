from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
from supabase import create_client
import os

router = APIRouter(prefix="/api/user", tags=["user"])

supabase = create_client(
    os.getenv("SUPABASE_URL", ""),
    os.getenv("SUPABASE_ANON_KEY", "")
)

class APIKeysUpdate(BaseModel):
    binance_api_key: Optional[str] = ""
    binance_secret_key: Optional[str] = ""
    openai_api_key: Optional[str] = ""

@router.get("/settings")
async def get_user_settings(authorization: str = Header(...)):
    try:
        token = authorization.replace("Bearer ", "")
        user = supabase.auth.get_user(token)
        user_id = user.user.id

        result = supabase.table("user_api_keys").select("*").eq("user_id", user_id).maybeSingle().execute()

        if result.data:
            return {
                "success": True,
                "data": {
                    "binance_api_key": result.data.get("binance_api_key", ""),
                    "binance_secret_key": result.data.get("binance_secret_key", ""),
                    "openai_api_key": result.data.get("openai_api_key", "")
                }
            }
        else:
            return {
                "success": True,
                "data": {
                    "binance_api_key": "",
                    "binance_secret_key": "",
                    "openai_api_key": ""
                }
            }
    except Exception as e:
        raise HTTPException(status_code=401, detail="Unauthorized")

@router.post("/settings")
async def update_user_settings(
    keys: APIKeysUpdate,
    authorization: str = Header(...)
):
    try:
        token = authorization.replace("Bearer ", "")
        user = supabase.auth.get_user(token)
        user_id = user.user.id

        existing = supabase.table("user_api_keys").select("*").eq("user_id", user_id).maybeSingle().execute()

        data = {
            "user_id": user_id,
            "binance_api_key": keys.binance_api_key or "",
            "binance_secret_key": keys.binance_secret_key or "",
            "openai_api_key": keys.openai_api_key or "",
            "updated_at": "now()"
        }

        if existing.data:
            result = supabase.table("user_api_keys").update(data).eq("user_id", user_id).execute()
        else:
            result = supabase.table("user_api_keys").insert(data).execute()

        return {
            "success": True,
            "message": "API keys updated successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
