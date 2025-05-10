import json
import os
from typing import List, Dict

import google.generativeai as genai
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from db import supabase
from geopy.distance import geodesic

from query_intent.analyze import analyze_intent

load_dotenv()

router = APIRouter()

# Initialize Google Generative AI
genai.configure(api_key=os.getenv("GENAI_API_KEY"))
model = genai.GenerativeModel("gemini-2.0-flash-lite")


class ChatRequest(BaseModel):
    message: str = Field(..., description="The user's input message.")
    user_lat: float = Field(..., description="The user's latitude.")
    user_lon: float = Field(..., description="The user's longitude.")


class ChatResponse(BaseModel):
    reply: str = Field(..., description="The bot's response.")


def get_relevant_locations(
        amenity_type: str,
        user_lat: float,
        user_lon: float,
        radius_m: int,
) -> List[Dict]:
    """
    Fetches locations from Supabase based on amenity type and filters them
    by distance from the given coordinates and within the specified radius.

    Args:
        amenity_type (str): The type of amenity to search for.
        user_lat (float): The user's latitude.
        user_lon (float): The user's longitude.
        radius_m (int): The radius in meters to search within.
        supabase (Client):  Supabase client instance.

    Returns:
        List[Dict]: A list of dictionaries, where each dictionary represents
                    a location that matches the criteria.
    """
    # Fetch data from Supabase
    response = supabase.from_("medical_amenity").select("*").eq("amenity_type", amenity_type).execute()
    locations = response.data  # This will be a list of dictionaries

    relevant_locations = []
    for location in locations:
        location_lat = location["lat"]
        location_lon = location["lon"]
        # Calculate distance
        distance = geodesic((user_lat, user_lon), (location_lat, location_lon)).meters
        if distance <= radius_m:
            relevant_locations.append(location)

    return relevant_locations


def is_open(metadata: str, current_time_str: str) -> bool:
    """
    Determines if a location is open based on its opening hours
    in the metadata and the current time.

    Args:
        metadata (str):  The metadata string containing opening_hours.
        current_time_str (str): A string representing the current time
                          in the format "Day HH:MM" (e.g., "Mon 09:00").

    Returns:
        bool: True if the location is open, False otherwise.
              Returns True if opening_hours is not provided.

    NOTE:  This is a simplified version.  A robust implementation
           would require a more sophisticated library like 'opening_hours'
           to handle complex opening hour formats.
    """

    try:
        metadata_dict = json.loads(metadata)
        opening_hours = metadata_dict.get("opening_hours")

        if not opening_hours:
            return True  # Assume open if no info is available

        day = current_time_str[:2]  # e.g., "Mo"
        time_str = current_time_str[3:]  # e.g., "09:00"

        # Very basic parsing - assumes "Mo 09:00-17:00" format
        schedule = opening_hours.split(",")
        for day_schedule in schedule:
            if day in day_schedule:
                open_time_str, close_time_str = day_schedule.split(" ")[1].split("-")
                open_time = int(open_time_str.replace(":", ""))
                close_time = int(close_time_str.replace(":", ""))
                current_time = int(time_str.replace(":", ""))
                if open_time <= current_time <= close_time:
                    return True
                else:
                    return False
        return False  # If the day isn't found

    except (json.JSONDecodeError, ValueError, KeyError) as e:
        print(f"Error parsing opening hours: {e}")
        return True  # Be safe, assume open if parsing fails


def rank_and_format_locations(
        locations: List[Dict],
        user_lat: float,
        user_lon: float,
        current_time_str: str,
        top_n: int = 5
) -> str:
    """
    Ranks locations by distance and open status, and formats the top N results
    into a user-friendly string.

    Args:
        locations (List[Dict]): A list of location dictionaries.
        user_lat (float): The user's latitude.
        user_lon (float): The user's longitude.
        current_time_str (str): The current time string ("Day HH:MM").
        top_n (int, optional): The number of top locations to return. Defaults to 5.

    Returns:
        str: A formatted string with the top N locations, ranked by
             distance and open status.
    """

    def calculate_distance(loc):
        return geodesic((user_lat, user_lon), (loc["lat"], loc["lon"])).meters

    # Rank by distance
    ranked_locations = sorted(locations, key=calculate_distance)

    # Further prioritize by "open now"
    open_locations = [loc for loc in ranked_locations if is_open(loc["metadata"], current_time_str)]
    closed_locations = [loc for loc in ranked_locations if loc not in open_locations]
    final_ranked = open_locations + closed_locations  # Open ones come first

    formatted_results = f"Here are the top {top_n} {final_ranked[0]['amenity_type']} locations:\n\n"
    for i, loc in enumerate(final_ranked[:top_n]):
        distance_km = calculate_distance(loc) / 1000
        metadata = json.loads(loc["metadata"])
        name = metadata.get("name", "Unknown")
        address = metadata.get("address", "No address provided")
        is_currently_open = "✅ Open Now" if is_open(loc["metadata"], current_time_str) else "Currently Closed"
        formatted_results += (
            f"{i + 1}. {name} - {address} ({distance_km:.2f} km away) - {is_currently_open}\n"
        )
    return formatted_results


def get_current_time_str() -> str:
    """
    Gets the current time string in the format "Day HH:MM".

    Returns:
        str: The current time string.
    """
    from datetime import datetime
    return datetime.now().strftime("%a %H:%M")  # e.g., "Mon 09:00"


@router.post("/", response_model=ChatResponse)
async def chat(
        request: ChatRequest,
):
    """
    Handles user messages, analyzes intent, retrieves and ranks locations,
    and generates a response.
    """

    user_query = request.message
    user_lat = request.user_lat
    user_lon = request.user_lon

    try:
        # 1.  Determine intent (using your existing LLM code)
        intent = analyze_intent(user_query)

        if not intent.valid_query:
            return ChatResponse(reply=intent.reason_invalid)  # Or a more user-friendly message

        amenity_type = intent.amenity_types[0]  # Or handle multiple types if needed
        radius_m = intent.radius_m

        # 2.  Get relevant locations from Supabase
        locations = get_relevant_locations(
            amenity_type, user_lat, user_lon, radius_m
        )

        if not locations:
            return ChatResponse(reply=f"Sorry, I couldn't find any {amenity_type}s within the specified radius.")

        current_time_str = get_current_time_str()

        # 4.  Rank and format the locations
        response = rank_and_format_locations(
            locations, user_lat, user_lon, current_time_str
        )

        return ChatResponse(reply=response)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
