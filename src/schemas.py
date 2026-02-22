from pydantic import BaseModel, Field

class ForecastRequest(BaseModel):
    start_year: int
    start_month: int = Field(ge=1, le=12)
    horizon: int = Field(ge=1, le=60)

class CountryForecastRequest(BaseModel):
    country: str
    start_year: int
    start_month: int = Field(ge=1, le=12)
    horizon: int = Field(ge=1, le=60)  