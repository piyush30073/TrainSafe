from fastapi import APIRouter

from app.schemas.workout import WorkoutData
from app.vision.pose_detector import PoseDetector
from app.vision.landmark_processor import LandmarkProcessor
from app.vision.movement_analyzer import MovementAnalyzer
from app.ml.predictor import RiskPredictor
from app.rules.risk_rules import evaluate_rules
from app.rules.recommendations import (
    generate_recommendations,
)


router = APIRouter(
    prefix="/analysis",
    tags=["AI Analysis"],
)


pose_detector = PoseDetector()

landmark_processor = LandmarkProcessor()

movement_analyzer = MovementAnalyzer()

risk_predictor = RiskPredictor()


@router.post("/risk")
def analyze_risk(
    workout: WorkoutData,
):

    # This endpoint currently expects
    # movement features to be added later.

    return {
        "success": True,
        "message": (
            "Risk analysis endpoint is ready. "
            "Connect pose/movement features next."
        ),
        "exercise": workout.exercise,
        "training_load": workout.training_load,
        "recovery_score": workout.recovery_score,
        "intensity": workout.intensity,
    }