import pandas as pd
import random
import os

# Save path
DATASET_PATH = os.path.join(os.path.dirname(__file__), "forest_dataset.csv")

# Major forests/national parks in Nepal with coordinates (approximate)
FORESTS = [
    {"name": "Chitwan National Park", "district": "Chitwan", "lat": 27.5341, "lon": 84.4380},
    {"name": "Bardiya National Park", "district": "Bardiya", "lat": 28.3850, "lon": 81.3008},
    {"name": "Banke National Park", "district": "Banke", "lat": 28.2000, "lon": 81.7333},
    {"name": "Shuklaphanta National Park", "district": "Kanchanpur", "lat": 28.8372, "lon": 80.1519},
    {"name": "Parsa National Park", "district": "Parsa", "lat": 27.3670, "lon": 84.5036},
    {"name": "Shivapuri Nagarjun National Park", "district": "Kathmandu", "lat": 27.8333, "lon": 85.3333},
    {"name": "Langtang National Park", "district": "Rasuwa", "lat": 28.2500, "lon": 85.7500},
    {"name": "Makalu Barun National Park", "district": "Sankhuwasabha", "lat": 27.6670, "lon": 87.2500},
    {"name": "Sagarmatha National Park", "district": "Solukhumbu", "lat": 27.9333, "lon": 86.7333},
    {"name": "Rara National Park", "district": "Mugu", "lat": 29.5000, "lon": 82.0833},
    {"name": "Khaptad National Park", "district": "Bajhang", "lat": 29.2833, "lon": 81.1333},
    {"name": "Shey Phoksundo National Park", "district": "Dolpa", "lat": 29.3333, "lon": 82.9500},
    {"name": "Koshi Tappu Wildlife Reserve", "district": "Sunsari", "lat": 26.6500, "lon": 87.1667},
    {"name": "Annapurna Conservation Area", "district": "Kaski", "lat": 28.6000, "lon": 83.8000},
    {"name": "Kanchenjunga Conservation Area", "district": "Taplejung", "lat": 27.7167, "lon": 88.1000},
]

def generate_weather_data():
    """Generate synthetic weather + risk features."""
    temp = random.uniform(15, 40)       # °C
    humidity = random.uniform(20, 90)   # %
    rainfall = random.uniform(0, 20)    # mm
    wind_speed = random.uniform(0, 20)  # km/h

    # Simple rule-based risk (for labeling)
    if temp > 30 and humidity < 40 and rainfall < 5:
        fire_risk = 1  # High risk
    else:
        fire_risk = 0  # Low risk

    return temp, humidity, rainfall, wind_speed, fire_risk

def build_dataset():
    rows = []
    for forest in FORESTS:
        for _ in range(50):  # 50 samples per forest (synthetic dataset)
            temp, humidity, rainfall, wind, risk = generate_weather_data()
            rows.append({
                "forest_name": forest["name"],
                "district": forest["district"],
                "latitude": forest["lat"],
                "longitude": forest["lon"],
                "temperature": round(temp, 2),
                "humidity": round(humidity, 2),
                "rainfall": round(rainfall, 2),
                "wind_speed": round(wind, 2),
                "fire_risk": risk
            })

    df = pd.DataFrame(rows)
    df.to_csv(DATASET_PATH, index=False)
    print(f"✅ Dataset created with {len(df)} records at {DATASET_PATH}")

if __name__ == "__main__":
    build_dataset()
