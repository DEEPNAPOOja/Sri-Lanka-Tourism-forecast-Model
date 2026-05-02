import json
from functools import lru_cache
from pathlib import Path

import joblib
import numpy as np
import pandas as pd


def build_features(year: int, month: int, last_values: dict):
    """
    last_values must include:
    {
        "lag_1": float,
        "lag_12": float,
        "rolling_mean_3": float
    }
    """
    month_sin = np.sin(2 * np.pi * month / 12)
    month_cos = np.cos(2 * np.pi * month / 12)

    features = {
        "year": year,
        "month": month,
        "month_sin": month_sin,
        "month_cos": month_cos,
        "lag_1": last_values["lag_1"],
        "lag_12": last_values["lag_12"],
        "rolling_mean_3": last_values["rolling_mean_3"]
    }

    return pd.DataFrame([features])


def add_month(year: int, month: int):
    month += 1
    if month > 12:
        month = 1
        year += 1
    return year, month


BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "outputs" / "model.pkl"
MODEL_COUNTRY_PATH = BASE_DIR / "outputs" / "model_country.pkl"
META_PATH = BASE_DIR / "outputs" / "model_meta.json"
DATA_PATH = BASE_DIR / "data" / "total_features.csv"
COUNTRY_DATA_PATH = BASE_DIR / "data" / "country_features.csv"


@lru_cache(maxsize=1)
def get_state():
    model = joblib.load(MODEL_PATH)
    model_country = joblib.load(MODEL_COUNTRY_PATH)
    meta = json.loads(META_PATH.read_text())
    feature_cols = meta["feature_cols"]

    df = pd.read_csv(DATA_PATH).sort_values("date")
    df_country = pd.read_csv(COUNTRY_DATA_PATH).sort_values(["country", "date"])
    return model, model_country, feature_cols, df, df_country


def health_payload():
    return {
        "status": "healthy",
        "message": "Tourism Forecast API is running",
        "version": "1.0.0",
        "endpoints": {
            "predict": "/api/predict",
            "forecast": "/api/forecast",
            "countries": "/api/countries",
            "forecast_country": "/api/forecast_country",
        },
    }


def predict_total(year: int, month: int):
    model, _, feature_cols, df, _ = get_state()
    lag_1 = df["arrivals"].iloc[-1]
    lag_12 = df["arrivals"].iloc[-12] if len(df) >= 12 else lag_1
    rolling_mean_3 = df["arrivals"].iloc[-3:].mean()

    last_values = {
        "lag_1": lag_1,
        "lag_12": lag_12,
        "rolling_mean_3": rolling_mean_3,
    }

    x_input = build_features(year, month, last_values)
    prediction = model.predict(x_input[feature_cols])[0]
    return {
        "year": year,
        "month": month,
        "predicted_arrivals": round(float(prediction), 2),
    }


def forecast_total(start_year: int, start_month: int, horizon: int):
    model, _, feature_cols, df, _ = get_state()
    history = df.copy().sort_values("date")["arrivals"].tolist()

    y, m = start_year, start_month
    results = []

    for _ in range(horizon):
        lag_1 = history[-1]
        lag_12 = history[-12] if len(history) >= 12 else lag_1
        rolling_mean_3 = sum(history[-3:]) / min(3, len(history))

        last_values = {
            "lag_1": lag_1,
            "lag_12": lag_12,
            "rolling_mean_3": rolling_mean_3,
        }

        x_input = build_features(y, m, last_values)
        pred = float(model.predict(x_input[feature_cols])[0])

        results.append({
            "year": y,
            "month": m,
            "predicted_arrivals": round(pred, 2),
        })

        history.append(pred)
        y, m = add_month(y, m)

    return {
        "start_year": start_year,
        "start_month": start_month,
        "horizon": horizon,
        "forecast": results,
    }


def countries_list():
    _, _, _, _, df_country = get_state()
    return {"countries": sorted(df_country["country"].unique().tolist())}


def forecast_country(country: str, start_year: int, start_month: int, horizon: int):
    _, model_country, _, _, df_country = get_state()
    country_df = df_country[df_country["country"] == country.upper()].copy()

    if country_df.empty:
        return {"error": "Country not found"}

    history = country_df["arrivals"].tolist()
    y, m = start_year, start_month
    results = []

    for _ in range(horizon):
        lag_1 = history[-1]
        lag_12 = history[-12] if len(history) >= 12 else lag_1
        rolling_mean_3 = sum(history[-3:]) / min(3, len(history))

        month_sin = np.sin(2 * np.pi * m / 12)
        month_cos = np.cos(2 * np.pi * m / 12)

        x_input = pd.DataFrame([
            {
                "year": y,
                "month": m,
                "month_sin": month_sin,
                "month_cos": month_cos,
                "lag_1": lag_1,
                "lag_12": lag_12,
                "rolling_mean_3": rolling_mean_3,
            }
        ])

        pred = float(model_country.predict(x_input)[0])

        results.append({
            "year": y,
            "month": m,
            "predicted_arrivals": round(pred, 2),
        })

        history.append(pred)
        y, m = add_month(y, m)

    return {
        "country": country.upper(),
        "start_year": start_year,
        "start_month": start_month,
        "horizon": horizon,
        "forecast": results,
    }