import ast
import json
import os

import numpy as np
import pandas as pd
from dotenv import load_dotenv
from supabase import create_client
from sentence_transformers import SentenceTransformer

load_dotenv()

# Get Supabase credentials
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Create Supabase client
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Load the CSV data into pandas DataFrame
df = pd.read_csv('../data/medical_amenities.csv', na_values=['nan', 'null', 'None', None, np.nan])
df['metadata'] = df['metadata'].apply(lambda x: ast.literal_eval(x) if isinstance(x, str) else x)

model = SentenceTransformer("BAAI/bge-m3")


def combine_metadata(metadata: dict) -> str:
    """Flatten and stringify metadata for embedding."""
    return " ".join([f"{k}: {v}" for k, v in metadata.items()])


def upload_data_to_supabase(df):
    for _, row in df.iterrows():
        amenity_type = row.get('amenity', None)
        metadata = row.get('metadata', None)
        metadata_vec = combine_metadata(metadata) if metadata else None
        embedding = model.encode(metadata_vec, normalize_embeddings=True) if metadata_vec else None
        lat = row.get('lat', None)
        lon = row.get('lon', None)

        data = {
            'amenity_type': amenity_type,
            'metadata': json.dumps(metadata) if metadata else None,
            "embedding": embedding.tolist() if embedding is not None else None,
        }

        if not pd.isna(lat) and not pd.isna(lon):
            data['lat'] = lat
            data['lon'] = lon

        try:
            supabase.table('medical_amenity').insert(data).execute()
        except Exception:
            print(f"Error inserting data: {data}")


if __name__ == '__main__':
    upload_data_to_supabase(df)
