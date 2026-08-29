import cv2
import numpy as np

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    HTTPException,
)

from app.vision.pose_detector import PoseDetector
from app.vision.landmark_processor import (
    LandmarkProcessor,
)
from app.vision.movement_analyzer import (
    MovementAnalyzer,
)


router = APIRouter(
    prefix="/pose",
    tags=["Pose Detection"],
)


pose_detector = PoseDetector()

landmark_processor = LandmarkProcessor()

movement_analyzer = MovementAnalyzer()


@router.post("/detect")
async def detect_pose(
    file: UploadFile = File(...)
):

    try:

        image_bytes = await file.read()

        image_array = np.frombuffer(
            image_bytes,
            dtype=np.uint8,
        )

        frame = cv2.imdecode(
            image_array,
            cv2.IMREAD_COLOR,
        )

        if frame is None:

            raise HTTPException(
                status_code=400,
                detail="Invalid image file.",
            )

        result = pose_detector.detect(
            frame
        )

        landmarks = (
            landmark_processor
            .extract_landmarks(result)
        )

        movement = (
            movement_analyzer
            .analyze(landmarks)
        )

        return {
            "success": True,

            "landmark_count": len(
                landmarks
            ),

            "landmarks": landmarks,

            "movement": movement,
        }

    except HTTPException:
        raise

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error),
        )