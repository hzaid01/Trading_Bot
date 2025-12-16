from fastapi import APIRouter, HTTPException, Header
from typing import Optional
from app.services.binance_service import BinanceService
from app.services.indicators import (
    calculate_indicators,
    calculate_support_resistance,
    detect_breaker_blocks,
    prepare_lstm_features
)
from app.models.lstm_model import get_lstm_signal
from app.services.openai_service import OpenAIService
from app.services.trade_calculator import calculate_trade_setup
from supabase import create_client
import os

router = APIRouter(prefix="/api/market", tags=["market"])

supabase = create_client(
    os.getenv("SUPABASE_URL", ""),
    os.getenv("SUPABASE_ANON_KEY", "")
)

@router.get("/top-coins")
async def get_top_coins(limit: int = 100):
    try:
        binance_service = BinanceService()
        coins = binance_service.get_top_coins(limit)
        return {"success": True, "data": coins}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analyze/{symbol}")
async def analyze_symbol(
    symbol: str,
    authorization: Optional[str] = Header(None)
):
    try:
        user_keys = None

        if authorization and authorization.startswith("Bearer "):
            token = authorization.replace("Bearer ", "")
            try:
                user = supabase.auth.get_user(token)
                user_id = user.user.id

                result = supabase.table("user_api_keys").select("*").eq("user_id", user_id).maybeSingle().execute()
                if result.data:
                    user_keys = result.data
            except Exception as e:
                print(f"Auth error: {e}")

        binance_api_key = user_keys.get("binance_api_key") if user_keys else None
        binance_secret = user_keys.get("binance_secret_key") if user_keys else None
        openai_api_key = user_keys.get("openai_api_key") if user_keys else None

        binance_service = BinanceService(binance_api_key, binance_secret)
        df = binance_service.get_klines(symbol)

        if df.empty:
            raise HTTPException(status_code=404, detail="No data available for this symbol")

        current_price = float(df['close'].iloc[-1])

        indicators = calculate_indicators(df)
        support_resistance = calculate_support_resistance(df)
        breaker_blocks = detect_breaker_blocks(df)

        lstm_features = prepare_lstm_features(df)
        lstm_signal, lstm_confidence = get_lstm_signal(lstm_features)

        openai_service = OpenAIService(openai_api_key)
        ai_decision = openai_service.get_trading_decision(
            symbol,
            lstm_signal,
            indicators,
            support_resistance
        )

        final_signal = ai_decision['signal']

        trade_setup = calculate_trade_setup(
            final_signal,
            current_price,
            support_resistance['support'],
            support_resistance['resistance']
        )

        return {
            "success": True,
            "data": {
                "symbol": symbol,
                "current_price": current_price,
                "indicators": indicators,
                "support_resistance": support_resistance,
                "breaker_blocks": breaker_blocks,
                "lstm_signal": {
                    "signal": lstm_signal,
                    "confidence": lstm_confidence
                },
                "ai_decision": ai_decision,
                "final_signal": final_signal,
                "trade_setup": trade_setup,
                "mode": "live" if (binance_api_key and openai_api_key) else "simulated"
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
