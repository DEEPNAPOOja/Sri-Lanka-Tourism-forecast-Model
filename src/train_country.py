import pandas as pd
import joblib
from sklearn.linear_model import LinearRegression
from pathlib import Path

DATA_PATH = Path("data/country_features.csv")
MODEL_PATH = Path("outputs/model_country.pkl")

df = pd.read_csv(DATA_PATH)

feature_cols = [
    "year", "month", "month_sin", "month_cos",
    "lag_1", "lag_12", "rolling_mean_3"
]

X = df[feature_cols]
y = df["arrivals"]

model = LinearRegression()
model.fit(X, y)

joblib.dump(model, MODEL_PATH)

print("Country model saved")