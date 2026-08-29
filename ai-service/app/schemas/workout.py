from pydantic import BaseModel, Field


class WorkoutData(BaseModel):

    exercise: str = "squat"

    training_load: float = Field(
        default=0,
        ge=0
    )

    recovery_score: float = Field(
        default=100,
        ge=0,
        le=100
    )

    intensity: float = Field(
        default=5,
        ge=0,
        le=10
    )