import json
from pathlib import Path
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import matplotlib.pyplot as plt


DATA_PATH = Path("data/total_features.csv")
OUT_DIR = Path("outputs")
FIG_DIR = OUT_DIR / "figures"
MODEL_PATH = OUT_DIR / "model.pkl"
META_PATH = OUT_DIR / "model_meta.json"
METRICS_PATH = OUT_DIR / "metrics.json"
PLOT_PATH = FIG_DIR / "actual_vs_predicted.png"


def time_split(df, test_size=12):
    """Last N rows as test (time-based split)."""
    df = df.sort_values("date").reset_index(drop=True)
    if len(df) <= test_size:
        raise ValueError("Not enough rows for time split.")
    train = df.iloc[:-test_size]
    test = df.iloc[-test_size:]
    return train, test


def main():
    OUT_DIR.mkdir(exist_ok=True)
    FIG_DIR.mkdir(parents=True, exist_ok=True)

    df = pd.read_csv(DATA_PATH)
    df["date"] = pd.to_datetime(df["date"])

    # Target column (adjust if your total target column name differs)
    # Example expected: "total_arrivals"
    # If your file uses "arrivals" as total, change it here.
    target_col = "arrivals" if "arrivals" in df.columns else "total_arrivals"

    # Features: drop date + target
    feature_cols = [c for c in df.columns if c not in ["date", target_col]]
    X = df[feature_cols]
    y = df[target_col]

    # ---- Evaluate using time split ----
    train_df, test_df = time_split(df, test_size=12)

    X_train = train_df[feature_cols]
    y_train = train_df[target_col]
    X_test = test_df[feature_cols]
    y_test = test_df[target_col]

    lr = LinearRegression()
    lr.fit(X_train, y_train)

    y_pred = lr.predict(X_test)

    mae = float(mean_absolute_error(y_test, y_pred))
    rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
    r2 = float(r2_score(y_test, y_pred))

    metrics = {"MAE": mae, "RMSE": rmse, "R2": r2, "test_size": 12}
    METRICS_PATH.write_text(json.dumps(metrics, indent=2))

    # ---- Plot Actual vs Predicted ----
    plt.figure()
    plt.plot(test_df["date"], y_test.values, label="Actual")
    plt.plot(test_df["date"], y_pred, label="Predicted")
    plt.xlabel("Date")
    plt.ylabel("Total Arrivals")
    plt.title("Actual vs Predicted (Linear Regression)")
    plt.legend()
    plt.xticks(rotation=45)
    plt.tight_layout()
    plt.savefig(PLOT_PATH)
    plt.close()

    # ---- Train FINAL model on FULL dataset ----
    lr_final = LinearRegression()
    lr_final.fit(X, y)

    joblib.dump(lr_final, MODEL_PATH)

    meta = {
        "feature_cols": feature_cols,
        "target_col": target_col
    }
    META_PATH.write_text(json.dumps(meta, indent=2))

    print("Model saved:", MODEL_PATH.resolve())
    print("Meta saved:", META_PATH.resolve())
    print("Metrics saved:", METRICS_PATH.resolve())
    print("Plot saved:", PLOT_PATH.resolve())
    print("Metrics:", metrics)


if __name__ == "__main__":
    main()