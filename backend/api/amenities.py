from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List, Dict, Any
from db import supabase
import math

router = APIRouter(
)


def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0  # Earth radius in km
    φ1, φ2 = map(math.radians, (lat1, lat2))
    Δφ = math.radians(lat2 - lat1)
    Δλ = math.radians(lon2 - lon1)
    a = (math.sin(Δφ / 2) ** 2 +
         math.cos(φ1) * math.cos(φ2) * math.sin(Δλ / 2) ** 2)
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


@router.get("/", response_model=List[Dict[str, Any]])
async def get_amenities(
        amenity: Optional[str] = Query(None, description="Amenity type (substring match)"),
        name: Optional[str] = Query(None, description="Metadata name (substring match)"),
        lat: Optional[float] = Query(None),
        lon: Optional[float] = Query(None)
):
    try:
        query = supabase.table("medical_amenity").select("*")

        if amenity:
            query = query.ilike("amenity_type", f"%{amenity}%")
        if name:
            query = query.ilike("metadata->>name", f"%{name}%")

        response = query.execute()
        if not response.data:
            return []

        results = response.data

        # Proximity filter (hardcoded radius = 20km)
        if lat is not None and lon is not None:
            def within_radius(item):
                try:
                    return haversine(lat, lon, float(item["lat"]), float(item["lon"])) <= 20  # Hardcoded radius
                except (ValueError, TypeError):
                    return False

            results = [item for item in results if within_radius(item)]

        return results

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))