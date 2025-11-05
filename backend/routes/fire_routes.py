
from fastapi import APIRouter
from fastapi.responses import JSONResponse
import requests
import csv
import io

from services.fire_stats import (
    get_confidence_level_counts,
    get_elevation_fire_counts,
    get_yearly_fire_counts,
    get_monthly_fire_counts,
    get_top_districts,
    get_year_month_matrix,
    get_geo_sample,
  
)

router = APIRouter()

from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
import requests
import csv
import io
import os
from dotenv import load_dotenv

from services.fire_stats import (
    get_confidence_level_counts,
    get_elevation_fire_counts,
    get_yearly_fire_counts,
    get_monthly_fire_counts,
    get_top_districts,
    get_year_month_matrix,
    get_geo_sample,
  
)

load_dotenv()

router = APIRouter()

# Nepal bounding box coordinates
NEPAL_BBOX = "80,26,88.2,30.4"  # west,south,east,north

#  Live NASA FIRMS API (real-time fires) - Updated to use AREA endpoint
@router.get("/fires")
def get_fires(
    sensor: str = Query(default="MODIS_NRT", description="Sensor type"),
    days: int = Query(default=1, ge=1, le=10, description="Number of days (1-10)")
):
    """
    Fetch live fire data from NASA FIRMS API using Area endpoint.
    Country endpoint is deprecated as of 2025.
    
    Supported sensors:
    - MODIS_NRT: MODIS Near Real-Time
    - VIIRS_SNPP_NRT: VIIRS Suomi-NPP
    - VIIRS_NOAA20_NRT: VIIRS NOAA-20
    - VIIRS_NOAA21_NRT: VIIRS NOAA-21
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
                content={"error": f"FIRMS API returned status {response.status_code}", "details": response.text}
            )
        
        # Parse CSV response
        csv_text = response.text
        
        if not csv_text or csv_text.strip() == "":
            return {"fires": [], "count": 0, "message": "No fire data available"}
        
        lines = csv_text.strip().split('\n')
        
        # Check if we have data beyond header
        if len(lines) < 2:
            return {"fires": [], "count": 0, "message": "No active fires detected"}
        
        # Parse CSV
        reader = csv.DictReader(io.StringIO(csv_text))
        data = list(reader)
        
        return {
            "fires": data,
            "count": len(data),
            "sensor": sensor,
            "days": days,
            "bbox": NEPAL_BBOX
        }
        
    except requests.exceptions.Timeout:
        return JSONResponse(
            status_code=504,
            content={"error": "Request to NASA FIRMS API timed out"}
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": "Failed to fetch fire data", "details": str(e)}
        )


#  Local CSV-based Historical Stats
@router.get("/fires/yearly")
def yearly_fire_counts():
    return get_yearly_fire_counts()

@router.get("/fires/monthly")
def monthly_fire_counts():
    return get_monthly_fire_counts()

@router.get("/fires/confidence")
def confidence():
    return get_confidence_level_counts()

@router.get("/fires/elevation")
def get_fire_counts_by_elevation():
    try:
        return get_elevation_fire_counts()
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@router.get("/fires/top-districts")
def top_districts():
    return get_top_districts()

@router.get("/fires/heatmap")
def year_month_heatmap():
    return get_year_month_matrix()

@router.get("/fires/geo-sample")
def fires_geo_sample():
    return get_geo_sample()
