from fastapi import APIRouter
from db import supabase

router = APIRouter()

@router.get("/")
async def get_amenities():
    """
    Fetch all amenities from the database.
    """
    response = supabase.table("medical_amenity").select("*").execute()
    return response.data
