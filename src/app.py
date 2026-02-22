from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import joblib
import json
import pandas as pd
import numpy as np
from pathlib import Path
from src.features import build_features
from src.schemas import ForecastRequest, CountryForecastRequest
from src.utils_time import add_month

app = FastAPI(title="Sri Lanka Tourism Forecast API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve frontend static files if they exist
FRONTEND_BUILD_PATH = Path("frontend/dist")
if FRONTEND_BUILD_PATH.exists():
    app.mount("/static", StaticFiles(directory=str(FRONTEND_BUILD_PATH / "assets")), name="static")

MODEL_PATH = Path("outputs/model.pkl")
META_PATH = Path("outputs/model_meta.json")
DATA_PATH = Path("data/total_features.csv")

# Load model
model = joblib.load(MODEL_PATH)

# Load meta info
meta = json.loads(META_PATH.read_text())
feature_cols = meta["feature_cols"]

# Load latest dataset (to compute lag values)
df = pd.read_csv(DATA_PATH)
df = df.sort_values("date")


@app.get("/api")
def root():
    return {"message": "Tourism Forecast API Running"}


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "message": "Tourism Forecast API is running",
        "version": "1.0.0",
        "endpoints": {
            "predict": "/api/predict",
            "forecast": "/api/forecast", 
            "countries": "/api/countries",
            "forecast_country": "/api/forecast_country"
        }
    }


@app.post("/api/predict")
def predict(year: int, month: int):

    # Get last available values
    lag_1 = df["arrivals"].iloc[-1]
    lag_12 = df["arrivals"].iloc[-12] if len(df) >= 12 else lag_1
    rolling_mean_3 = df["arrivals"].iloc[-3:].mean()

    last_values = {
        "lag_1": lag_1,
        "lag_12": lag_12,
        "rolling_mean_3": rolling_mean_3
    }

    X_input = build_features(year, month, last_values)

    prediction = model.predict(X_input[feature_cols])[0]

    return {
        "year": year,
        "month": month,
        "predicted_arrivals": round(float(prediction), 2)
    }


@app.post("/api/forecast")
def forecast(req: ForecastRequest):
    # Start from the latest known history in total_features.csv
    history = df.copy().sort_values("date")["arrivals"].tolist()

    y, m = req.start_year, req.start_month
    results = []

    for step in range(req.horizon):
        # lag_1: last value in history
        lag_1 = history[-1]

        # lag_12: value 12 months back if available
        lag_12 = history[-12] if len(history) >= 12 else lag_1

        # rolling mean 3 of last 3
        rolling_mean_3 = sum(history[-3:]) / min(3, len(history))

        last_values = {
            "lag_1": lag_1,
            "lag_12": lag_12,
            "rolling_mean_3": rolling_mean_3
        }

        X_input = build_features(y, m, last_values)
        pred = float(model.predict(X_input[feature_cols])[0])

        results.append({
            "year": y,
            "month": m,
            "predicted_arrivals": round(pred, 2)
        })

        # Append prediction into history so next step uses it
        history.append(pred)

        # Move to next month
        y, m = add_month(y, m)

    return {
        "start_year": req.start_year,
        "start_month": req.start_month,
        "horizon": req.horizon,
        "forecast": results
    }

# country level forecast setup

MODEL_COUNTRY_PATH = Path("outputs/model_country.pkl")
COUNTRY_DATA_PATH = Path("data/country_features.csv")

model_country = joblib.load(MODEL_COUNTRY_PATH)
df_country = pd.read_csv(COUNTRY_DATA_PATH)
df_country = df_country.sort_values(["country", "date"])


@app.get("/api/countries")
def get_countries():
    return {"countries": sorted(df_country["country"].unique().tolist())}


@app.post("/api/forecast_country")
def forecast_country(req: CountryForecastRequest):

    country_df = df_country[df_country["country"] == req.country.upper()].copy()

    if country_df.empty:
        return {"error": "Country not found"}

    history = country_df["arrivals"].tolist()

    y, m = req.start_year, req.start_month
    results = []

    for _ in range(req.horizon):

        lag_1 = history[-1]
        lag_12 = history[-12] if len(history) >= 12 else lag_1
        rolling_mean_3 = sum(history[-3:]) / min(3, len(history))

        month_sin = np.sin(2 * np.pi * m / 12)
        month_cos = np.cos(2 * np.pi * m / 12)

        X_input = pd.DataFrame([{
            "year": y,
            "month": m,
            "month_sin": month_sin,
            "month_cos": month_cos,
            "lag_1": lag_1,
            "lag_12": lag_12,
            "rolling_mean_3": rolling_mean_3
        }])

        pred = float(model_country.predict(X_input)[0])

        results.append({
            "year": y,
            "month": m,
            "predicted_arrivals": round(pred, 2)
        })

        history.append(pred)

        # Move to next month using utility function
        y, m = add_month(y, m)

    return {
        "country": req.country.upper(),
        "start_year": req.start_year,
        "start_month": req.start_month,
        "horizon": req.horizon,
        "forecast": results
    }


# Serve frontend for all non-API routes
@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    """Serve the React frontend for all non-API routes"""
    if full_path.startswith("api/") or full_path in ["docs", "redoc", "openapi.json"]:
        return {"error": "API endpoint not found"}
    
    # Serve React app
    if FRONTEND_BUILD_PATH.exists():
        index_file = FRONTEND_BUILD_PATH / "index.html"
        if index_file.exists():
            return FileResponse(str(index_file))
    
    return {"message": "Frontend not built. Run 'npm run build' in the frontend directory."}


# Serve root path
@app.get("/")
async def serve_root():
    """Serve the React frontend at root path"""
    if FRONTEND_BUILD_PATH.exists():
        index_file = FRONTEND_BUILD_PATH / "index.html"
        if index_file.exists():
            return FileResponse(str(index_file))
    
    return {
        "message": "Tourism Forecast API Running",
        "frontend": "Not built",
        "docs": "/docs",
        "health": "/health"
    }