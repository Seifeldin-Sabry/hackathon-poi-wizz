from fastapi import APIRouter

router = APIRouter()

@router.post("/")
async def chat_with_user(message: str):
    return {"reply": f"You said: {message}"}
