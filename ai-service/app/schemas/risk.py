from pydantic import BaseModel
from typing import List


class RiskResponse(BaseModel):

    risk_score: float

    risk_level: str

    risk_factors: List[str]

    recommendations: List[str]