import os
import pandas as pd

# Base directory of the backend
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, "data", "nepal_fire_data_cleaned.csv")

def load_fire_data():
    candidates = [
        DATA_PATH,
        os.path.join(BASE_DIR, "..", "everything else", "nepal_fire_data_cleaned.csv"),
        os.path.join(BASE_DIR, "..", "everything else", "nepal fire data cleaned.csv"),
        os.path.join(BASE_DIR, "data", "nepal_fire_data_cleaned.csv"),
    ]
    for path in candidates:
        if os.path.exists(path):
            return pd.read_csv(path)
    raise FileNotFoundError("Nepal fire data CSV not found in expected locations.")

def get_yearly_fire_counts():
    df = load_fire_data()
    df['acq_date'] = pd.to_datetime(df['acq_date'], errors='coerce')
    df['year'] = df['acq_date'].dt.year
    yearly_counts = df.groupby('year').size().reset_index(name='count')

    return yearly_counts.to_dict(orient='records')

def get_monthly_fire_counts():
    df = load_fire_data()
    df['acq_date'] = pd.to_datetime(df['acq_date'], errors='coerce')
    df['month'] = df['acq_date'].dt.month
    return df.groupby('month').size().reset_index(name='count').to_dict(orient='records')

def get_confidence_level_counts():
    df = load_fire_data()

    if 'confidence' not in df.columns:
        return {"error": "Confidence data not found."}

    # Normalize column (if it's numeric, you can bin it instead)
    return df['confidence'].value_counts().reset_index(name='count') \
             .rename(columns={'index': 'confidence'}) \
             .to_dict(orient='records')


def get_elevation_fire_counts():
    df = load_fire_data()

    bins = [0, 500, 1000, 2000, 3000, 4000, 9000]
    labels = ["0-500m", "500-1000m", "1000-2000m", "2000-3000m", "3000-4000m", "4000m+"]

    df['elevation_bin'] = pd.cut(df['elevation'], bins=bins, labels=labels, include_lowest=True)
    result = df.groupby('elevation_bin').size().reset_index(name='count')

    return result.to_dict(orient='records')


def get_year_month_matrix():
    df = load_fire_data()
    if 'acq_date' not in df.columns:
        return {"labels": [], "series": []}
    df['acq_date'] = pd.to_datetime(df['acq_date'], errors='coerce')
    df['year'] = df['acq_date'].dt.year
    df['month'] = df['acq_date'].dt.month
    pivot = df.pivot_table(index='year', columns='month', values='acq_date', aggfunc='count', fill_value=0)
    years = list(map(int, pivot.index.tolist()))
    # Ensure months 1..12 order
    months = list(range(1, 13))
    matrix = []
    for y in years:
        row = []
        for m in months:
            try:
                row.append(int(pivot.loc[y, m]))
            except Exception:
                row.append(0)
        matrix.append(row)
    return {"years": years, "months": months, "matrix": matrix}


def get_geo_sample(limit: int = 3000):
    df = load_fire_data()
    lat_col = None
    lon_col = None
    for lc in ["latitude", "lat", "y", "Latitude"]:
        if lc in df.columns:
            lat_col = lc
            break
    for lc in ["longitude", "lon", "x", "Longitude", "long"]:
        if lc in df.columns:
            lon_col = lc
            break
    if not lat_col or not lon_col:
        return []
    cols = [lat_col, lon_col]
    extras = []
    for c in ["confidence", "acq_date", "district", "province"]:
        if c in df.columns:
            extras.append(c)
    cols = cols + extras
    df_small = df[cols].dropna().sample(n=min(limit, len(df)), random_state=42)
    # Normalize keys
    df_small = df_small.rename(columns={lat_col: "latitude", lon_col: "longitude"})
    if "acq_date" in df_small.columns:
        df_small["acq_date"] = pd.to_datetime(df_small["acq_date"], errors="coerce").dt.strftime("%Y-%m-%d")
    return df_small.to_dict(orient="records")

# Added function: top districts by fire count
def get_top_districts(n: int = 10):
    """
    Return top n districts by number of fire incidents.
    Looks for common district column names and returns error if not found.
    """
    df = load_fire_data()
    district_col = None
    for c in ["district", "District", "district_name", "admin1", "province_district", "DISTRICT"]:
        if c in df.columns:
            district_col = c
            break
    if not district_col:
        return {"error": "District column not found in data."}

    top = df[district_col].fillna("Unknown").value_counts().head(n).reset_index()
    top.columns = [district_col, "count"]
    # normalize column name to 'district' in result
    top = top.rename(columns={district_col: "district"})
    return top.to_dict(orient="records")