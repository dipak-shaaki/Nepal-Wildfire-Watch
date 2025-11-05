
from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
import requests
import csv
import io
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# Nepal bounding box coordinates
NEPAL_BBOX = "80,26,88.2,30.4"  # west,south,east,north

@router.get("/fires")
def get_fires(
    sensor: str = Query(default="MODIS_NRT", description="Sensor type"),
    days: int = Query(default=1, ge=1, le=10, description="Number of days (1-10)")
):
    """
    Fetch live fire data from NASA FIRMS API using Area endpoint.
    Country endpoint is deprecated as of 2025.
    """
    
    # Get MAP_KEY from environment variable
    map_key = os.getenv("FIRMS_MAP_KEY", "afb7fe414fb31747d4bc922176e7f96d")
    
    # Construct URL using AREA endpoint
    url = f"https://firms.modaps.eosdis.nasa.gov/api/area/csv/{map_key}/{sensor}/{NEPAL_BBOX}/{days}"
    
    try:
        response = requests.get(url, timeout=30)
        
        if response.status_code != 200:
            return JSONResponse(
                status_code=response.status_code,
                content={"error": f"FIRMS API returned status {response.status_code}"}
            )
        
        csv_text = response.text
        
        if not csv_text or csv_text.strip() == "":
            return {"fires": [], "count": 0, "message": "No fire data available"}
        
        lines = csv_text.strip().split('\n')
        if len(lines) < 2:
            return {"fires": [], "count": 0, "message": "No active fires detected"}
        
        reader = csv.DictReader(io.StringIO(csv_text))
        data = list(reader)
        
        return {"fires": data, "count": len(data), "sensor": sensor, "days": days}
        
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": "Failed to fetch fire data", "details": str(e)}
        )
