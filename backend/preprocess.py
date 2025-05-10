import pandas as pd
import json

df = pd.read_csv("medical_data.csv")

def parse_tags(x):
    try:
        return json.loads(x.replace("'", '"'))
    except:
        return {}

df["tags"] = df["tags"].apply(parse_tags)
df["name"] = df["tags"].apply(lambda d: d.get("name", "Unknown"))
df["address"] = df["tags"].apply(lambda d: f"{d.get('addr:street', '')} {d.get('addr:housenumber', '')}".strip())
df["website"] = df["tags"].apply(lambda d: d.get("website"))
df["opening_hours"] = df["tags"].apply(lambda d: d.get("opening_hours"))
df["location"] = df.apply(lambda row: f'POINT({row["lon"]} {row["lat"]})' if pd.notnull(row["lon"]) else None, axis=1)

clean_df = df[["name", "address", "website", "opening_hours", "location", "amenity_type"]]
clean_df.to_csv("clean_medical_places.csv", index=False)
