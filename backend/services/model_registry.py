# backend/services/model_registry.py
import joblib, os
from functools import lru_cache

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_STORE = os.path.join(BASE_DIR, "models_store")

@lru_cache(maxsize=1)
def get_rf():
    return joblib.load(os.path.join(MODEL_STORE, "random_forest_fire.joblib"))

@lru_cache(maxsize=1)
def get_nb():
    return joblib.load(os.path.join(MODEL_STORE, "naive_bayes_risk.joblib"))
