import pandas as pd
import json
from geopy.geocoders import Nominatim
from geopy.extra.rate_limiter import RateLimiter

# Load the original CSV
df = pd.read_csv("medical_amenities.csv")

# Geocoder setup
geolocator = Nominatim(user_agent="medical_data_enricher")
geocode = RateLimiter(geolocator.geocode, min_delay_seconds=1)
reverse = RateLimiter(geolocator.reverse, min_delay_seconds=1)


# Helper function to parse and clean metadata field
def parse_metadata(metadata_str):
    try:
        return json.loads(metadata_str.replace("'", '"'))
    except Exception:
        return {}


# Enrich each row
enriched_rows = []

for _, row in df.iterrows():
    metadata = parse_metadata(row.get("metadata", "{}"))

    lat = row.get("lat", None)
    lon = row.get("lon", None)
    address = row.get("address", None)
    name = metadata.get("name")

    # Add lat/lon if missing and address is present
    if pd.isna(lat) or pd.isna(lon):
        if pd.notna(address):
            location = geocode(address)
            if location:
                lat = location.latitude
                lon = location.longitude

    # Add address if missing and lat/lon is present
    if (pd.isna(address) or row.get("is_address_null", False)) and pd.notna(lat) and pd.notna(lon):
        location = reverse((lat, lon), language="en")
        if location and location.address:
            address = location.address

    # Fill in other missing metadata fields
    if not metadata.get("name") and pd.notna(row.get("name")):
        metadata["name"] = row["name"]

    if not metadata.get("website") and pd.notna(row.get("website")):
        metadata["website"] = row["website"]

    if not metadata.get("phone") and pd.notna(row.get("phone")):
        metadata["phone"] = row["phone"]

    if not metadata.get("email") and pd.notna(row.get("email")):
        metadata["email"] = row["email"]

    if not metadata.get("opening_hours") and pd.notna(row.get("opening_hours")):
        metadata["opening_hours"] = row["opening_hours"]

    enriched_rows.append({
        "id": row["id"],
        "type": row["type"],
        "metadata": metadata,
        "lat": lat,
        "lon": lon,
        "amenity": row["amenity"],
        "website": row.get("website", ""),
        "phone": row.get("phone", ""),
        "email": row.get("email", ""),
        "is_address_null": row.get("is_address_null", False),
        "address": address,
    })

# Save to new CSV
new_df = pd.DataFrame(enriched_rows)
new_df.to_csv("medical_amenities_cleaned.csv", index=False, quoting=1)
