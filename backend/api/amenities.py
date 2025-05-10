from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_amenities():
    return {"message": "List of amenities"}
