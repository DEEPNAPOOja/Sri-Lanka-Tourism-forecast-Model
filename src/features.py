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