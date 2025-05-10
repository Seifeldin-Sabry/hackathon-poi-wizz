import json
import os

import google.generativeai as genai
from google.generativeai import GenerativeModel
from google.generativeai.types import GenerateContentResponse
from pydantic import ValidationError, BaseModel
from typing import List, Optional
from dotenv import load_dotenv

load_dotenv()

# Initialize the Generative AI model
genai.configure(api_key=os.getenv("GENAI_API_KEY"))


class AmenityQueryIntent(BaseModel):
    amenity_types: List[str]
    radius_m: int
    valid_query: bool = True
    reason_invalid: Optional[str] = None


DEFAULT_RADIUS = 50000  # Default radius in meters
MEDICAL_AMENITIES = [
    "clinic", "hospital", "pharmacy", "dentist", "doctors",
    "nursing_home", "childcare", "veterinary", "social_facility"
]

BASE_PROMPT = """You are an expert at understanding user queries related to medical amenities.
The user can also provide a query about a specific medical condition or a general inquiry about medical services.
Your task is to extract the intent from the user's query and identify the type of medical amenities they are looking for.
Your task is to analyze the user's query and extract the following information:

- amenity_types: A list of medical amenity types the user is interested in (e.g., ["pharmacy", "hospital", "doctor"]). If the query is not about medical amenities, this list should be empty.
- radius_m: The search radius in meters mentioned in the query. If not specified, provide a reasonable default (e.g., 1000).
- open_now: If the user explicitly asks for currently open amenities, set this to true. Otherwise, leave it as null.
- valid_query: True if the query seems to be about finding medical amenities, False otherwise.
- reason_invalid: If valid_query is False, provide a brief reason why the query is not considered a medical amenity search. All languages are valid queryies.

Output the result as a JSON object.

VALID MEDICAL AMENITY TYPES:
%VALID_AMENITY_TYPES%

Examples:
User query: "I have the flu"
Output: {"amenity_types": ["pharmacy, doctor"], "radius_m": %DEFAULT_RADIUS%, "valid_query": true}

User query: "find a dentist nearby"
Output: {"amenity_types": ["dentist"], "radius_m": %DEFAULT_RADIUS%, "valid_query": true}

User query: "where can I get a COVID test?"
Output: {"amenity_types": ["clinic", "hospital", "doctor", "pharmacy"], "radius_m": %DEFAULT_RADIUS%, "valid_query": true}

User query: "pharmacies open near me"
Output: {"amenity_types": ["pharmacy"], "radius_m": %DEFAULT_RADIUS%, "open_now": true, "valid_query": true}

User query: "I need a doctor for a bad cough"
Output: {"amenity_types": ["doctor"], "radius_m": %DEFAULT_RADIUS%, "valid_query": true}

User query: "find the best pizza place"
Output: {"amenity_types": [], "radius_m": %DEFAULT_RADIUS%, "valid_query": false, "reason_invalid": "The query is about food, not medical amenities."}

User query: "hospital within 5 km"
Output: {"amenity_types": ["hospital"], "radius_m": 5000, "valid_query": true}
"""

BASE_PROMPT = BASE_PROMPT.replace("%DEFAULT_RADIUS%", str(DEFAULT_RADIUS))
VALID_AMENITY_TYPES = ', '.join(MEDICAL_AMENITIES)


model = genai.GenerativeModel(model_name='gemini-2.0-flash-lite')


def analyze_intent(user_query: str) -> AmenityQueryIntent:
    prompt = f"{BASE_PROMPT.strip()}\n\nUser query: {user_query}"
    response = model.generate_content(prompt)
    try:
        # Assuming the model returns a JSON string
        return parse_gemini_response(response)
    except (json.JSONDecodeError, ValidationError) as e:
        print(f"Error parsing model response: {e}")
        # Handle the error appropriately, perhaps return a default or an invalid intent
        return AmenityQueryIntent(amenity_types=[], radius_m=1000, valid_query=False,
                                  reason_invalid="Could not parse the model's response.")


def parse_gemini_response(response: GenerateContentResponse) -> Optional[AmenityQueryIntent]:
    """Parses the GenerateContentResponse and extracts the JSON content."""
    if response and response.candidates:
        first_candidate = response.candidates[0]
        if first_candidate.content and first_candidate.content.parts:
            text_part = first_candidate.content.parts[0].text
            # The JSON might be enclosed in markdown code blocks (```json ... ```)
            # Let's try to remove those if present
            if text_part.startswith("```json") and text_part.endswith("```"):
                json_string = text_part[len("```json"): -len("```")].strip()
            else:
                json_string = text_part.strip()
            try:
                intent_data = json.loads(json_string)
                return AmenityQueryIntent(**intent_data)
            except json.JSONDecodeError as e:
                print(f"Error decoding JSON: {e}")
                return None
            except ValidationError as e:
                print(f"Error validating Pydantic model: {e}")
                return None
    return None

#
# if __name__ == '__main__':
#     # Example usage
#     queries = ["I have the flu", "pharmacies open near me", "find the nearest bakery", "hospital within 2 miles", "Ik moet naar de spoed", "ik heb honger, ik wil eten"]
#     for q in queries:
#         intent = analyze_intent(q)
#         print(f"User query: '{q}'")
#         print(f"Intent: {intent.model_dump_json(indent=2)}")
#         print("-" * 20)
