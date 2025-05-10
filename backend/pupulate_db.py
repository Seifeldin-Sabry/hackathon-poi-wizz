import pandas as pd
import os
import uuid
from dotenv import load_dotenv
from supabase import create_client

# Load environment variables
load_dotenv()

# Get Supabase credentials
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Create Supabase client
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Load the CSV data into pandas DataFrame
df = pd.read_csv('data/examples.csv')

# Strip any potential leading/trailing spaces from column names
df.columns = df.columns.str.strip()

# Function to upload data to Supabase
def upload_data_to_supabase(df):
    for _, row in df.iterrows():
        # Generate UUID for the id if needed
        new_id = str(uuid.uuid4())  # Generate a new UUID for each row

        # Access the correct columns (ensure the column names match)
        amenity_type = row.get('amenity', None)
        metadata = row.get('metadata', None)
        lat = row.get('lat', None)
        lon = row.get('lon', None)

        # Prepare data to insert (ensure column names match)
        data = {
            'id': new_id,  # Include the new generated UUID here
            'amenity_type': amenity_type,
            'metadata': metadata,
            'lat': lat,
            'lon': lon
        }

        # Insert into Supabase
        try:
            response = supabase.table('medical_places').insert(data).execute()
            print("Response:", response)
        except Exception as e:
            print(f"Error uploading data: {e}")

# Call the function
upload_data_to_supabase(df)
