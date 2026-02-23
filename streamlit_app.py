import streamlit as st
import pandas as pd
import numpy as np
import joblib
import json
import plotly.express as px
from pathlib import Path
from datetime import datetime
import sys
sys.path.append('src')
from features import build_features
from utils_time import add_month

# Page config
st.set_page_config(
    page_title="Sri Lanka Tourism Forecast",
    page_icon="✈️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Load models and data
@st.cache_resource
def load_models_and_data():
    model = joblib.load("outputs/model.pkl")
    model_country = joblib.load("outputs/model_country.pkl")
    
    with open("outputs/model_meta.json") as f:
        meta = json.load(f)
    
    df = pd.read_csv("data/total_features.csv").sort_values("date")
    df_country = pd.read_csv("data/country_features.csv").sort_values(["country", "date"])
    
    return model, model_country, meta, df, df_country

try:
    model, model_country, meta, df, df_country = load_models_and_data()
    countries = ['Total'] + sorted(df_country["country"].unique().tolist())
except Exception as e:
    st.error(f"Error loading models: {e}")
    st.stop()

# Header
st.markdown("""
<div style="text-align: center; padding: 2rem 0;">
    <h1 style="color: #1F4E79; font-size: 3rem; margin-bottom: 0.5rem;">
        ✈️ Sri Lanka Tourism Forecast
    </h1>
    <p style="color: #666; font-size: 1.2rem;">
        AI-Powered Tourism Arrival Predictions & Analytics
    </p>
</div>
""", unsafe_allow_html=True)

# Sidebar controls
st.sidebar.header(" Forecast Settings")

selected_country = st.sidebar.selectbox(
    "Select Country/Region",
    countries,
    index=0,
    help="Choose 'Total' for overall predictions or specific country"
)

col1, col2 = st.sidebar.columns(2)
with col1:
    start_year = st.number_input("Start Year", 2024, 2030, 2026)
with col2:
    start_month = st.number_input("Start Month", 1, 12, 3)

horizon = st.sidebar.slider("Forecast Horizon (months)", 3, 24, 12)

# Generate forecast
if st.sidebar.button(" Generate Forecast", type="primary"):
    with st.spinner("Generating forecast..."):
        try:
            if selected_country == 'Total':
                # Total forecast
                history = df["arrivals"].tolist()
                results = []
                
                y, m = start_year, start_month
                for step in range(horizon):
                    lag_1 = history[-1]
                    lag_12 = history[-12] if len(history) >= 12 else lag_1
                    rolling_mean_3 = sum(history[-3:]) / min(3, len(history))
                    
                    X_input = build_features(y, m, {
                        "lag_1": lag_1,
                        "lag_12": lag_12,
                        "rolling_mean_3": rolling_mean_3
                    })
                    
                    pred = float(model.predict(X_input[meta["feature_cols"]])[0])
                    results.append({
                        "year": y,
                        "month": m,
                        "predicted_arrivals": round(pred, 2)
                    })
                    
                    history.append(pred)
                    y, m = add_month(y, m)
            
            else:
                # Country-specific forecast
                country_df = df_country[df_country["country"] == selected_country.upper()]
                if country_df.empty:
                    st.error(f"No data found for {selected_country}")
                    st.stop()
                
                history = country_df["arrivals"].tolist()
                results = []
                
                y, m = start_year, start_month
                for _ in range(horizon):
                    lag_1 = history[-1]
                    lag_12 = history[-12] if len(history) >= 12 else lag_1
                    rolling_mean_3 = sum(history[-3:]) / min(3, len(history))
                    
                    month_sin = np.sin(2 * np.pi * m / 12)
                    month_cos = np.cos(2 * np.pi * m / 12)
                    
                    X_input = pd.DataFrame([{
                        "year": y, "month": m,
                        "month_sin": month_sin, "month_cos": month_cos,
                        "lag_1": lag_1, "lag_12": lag_12,
                        "rolling_mean_3": rolling_mean_3
                    }])
                    
                    pred = float(model_country.predict(X_input)[0])
                    results.append({
                        "year": y,
                        "month": m,
                        "predicted_arrivals": round(pred, 2)
                    })
                    
                    history.append(pred)
                    y, m = add_month(y, m)
            
            # Store results in session state
            st.session_state.forecast_results = results
            st.session_state.selected_country = selected_country
            
        except Exception as e:
            st.error(f"Forecast generation failed: {e}")

# Display results
if hasattr(st.session_state, 'forecast_results'):
    results = st.session_state.forecast_results
    
    # Create DataFrame for visualization
    df_results = pd.DataFrame(results)
    df_results['date'] = df_results.apply(lambda row: f"{int(row['year'])}-{int(row['month']):02d}", axis=1)
    
    # Statistics
    total_arrivals = df_results['predicted_arrivals'].sum()
    avg_monthly = df_results['predicted_arrivals'].mean()
    peak_month = df_results.loc[df_results['predicted_arrivals'].idxmax()]
    growth = ((df_results['predicted_arrivals'].iloc[-1] - df_results['predicted_arrivals'].iloc[0]) / 
              df_results['predicted_arrivals'].iloc[0] * 100)
    
    # Display metrics
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("Total Forecast", f"{total_arrivals:,.0f}", delta=f"{growth:.1f}%")
    with col2:
        st.metric("Avg Monthly", f"{avg_monthly:,.0f}")
    with col3:
        st.metric("Peak Month", peak_month['date'])
    with col4:
        st.metric("Peak Arrivals", f"{peak_month['predicted_arrivals']:,.0f}")
    
    # Chart
    fig = px.line(df_results, x='date', y='predicted_arrivals',
                  title=f"Tourism Arrivals Forecast - {st.session_state.selected_country}",
                  labels={'predicted_arrivals': 'Predicted Arrivals', 'date': 'Date'})
    
    fig.update_traces(line=dict(color='#1F4E79', width=3))
    fig.update_layout(height=500, showlegend=False)
    st.plotly_chart(fig, width='stretch')
    
    # Detailed results
    st.subheader(" Detailed Forecast Results")
    
    # Format the results table
    display_df = df_results.copy()
    display_df['Month Name'] = display_df.apply(lambda row: 
        datetime(row['year'], row['month'], 1).strftime('%B %Y'), axis=1)
    display_df['Predicted Arrivals'] = display_df['predicted_arrivals'].apply(lambda x: f"{x:,.0f}")
    
    st.dataframe(
        display_df[['Month Name', 'Predicted Arrivals']],
        width='stretch',
        hide_index=True
    )

else:
    # Welcome state
    st.info("👈 Configure your forecast settings and click 'Generate Forecast' to begin!")
    
    # Show sample data
    st.subheader("📈 Recent Historical Data")
    recent_data = df.tail(12)[['date', 'arrivals']]
    recent_data['arrivals'] = recent_data['arrivals'].apply(lambda x: f"{x:,.0f}")
    st.dataframe(recent_data, width='stretch', hide_index=True)

# Footer
st.markdown("""
---
<div style="text-align: center; color: #666; padding: 1rem;">
    <p>🤖 Powered by Machine Learning | Built with Streamlit</p>
</div>
""", unsafe_allow_html=True)