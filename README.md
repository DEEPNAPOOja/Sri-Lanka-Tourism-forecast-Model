# Sri Lanka Tourism Forecasting Model

## Project Overview
This project predicts future monthly tourist arrivals in Sri Lanka using machine learning (CatBoost Regressor).

## Dataset
Monthly tourist arrivals from 2019–2025.

##  Model
- CatBoost Regressor
- Time-series lag features
- Rolling statistics

##  Evaluation Metrics
- MAE
- RMSE
- MAPE

##  Explainability
- SHAP values
- Feature importance
- Partial Dependence Plots

##  Run Project

Install dependencies:

pip install -r requirements.txt

Run training:

python src/train.py

Run Streamlit app:

streamlit run src/app.py
