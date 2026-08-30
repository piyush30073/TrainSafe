import math
from pathlib import Path

import cv2
import mediapipe as mp

from mediapipe.tasks import python
from mediapipe.tasks.python import vision


# ============================================================
# MODEL PATH
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[2]

MODEL_PATH = (
    BASE_DIR
    / "models"
    / "pose_landmarker_full.task"
)


# ============================================================
# POSE CONNECTIONS
# ============================================================

POSE_CONNECTIONS = [
    (0, 1), (1, 2), (2, 3), (3, 7),
    (0, 4), (4, 5), (5, 6), (6, 8),
    (9, 10),

    (11, 12),

    (11, 13), (13, 15),
    (12, 14), (14, 16),

    (11, 23), (12, 24),

    (23, 24),

    (23, 25), (25, 27),
    (24, 26), (26, 28),

    (27, 29), (29, 31),
    (28, 30), (30, 32),
]


# ============================================================
# ANGLE
# ============================================================

def calculate_angle(a, b, c):

    ba = (
        a[0] - b[0],
        a[1] - b[1]
    )

    bc = (
        c[0] - b[0],
        c[1] - b[1]
    )

    dot = (
        ba[0] * bc[0]
        + ba[1] * bc[1]
    )

    mag_ba = math.sqrt(
        ba[0] ** 2
        + ba[1] ** 2
    )

    mag_bc = math.sqrt(
        bc[0] ** 2
        + bc[1] ** 2
    )

    if mag_ba == 0 or mag_bc == 0:
        return 0

    cosine = dot / (mag_ba * mag_bc)

    cosine = max(
        -1,
        min(1, cosine)
    )

    return math.degrees(
        math.acos(cosine)
    )


# ============================================================
# POSE DETECTOR
# ============================================================

class PoseDetector:

    def __init__(self):

        if not MODEL_PATH.exists():

            raise FileNotFoundError(
                f"""
Pose model not found:

{MODEL_PATH}

Expected:

ai-service/models/pose_landmarker_full.task
"""
            )

        print("Loading MediaPipe model:")
        print(MODEL_PATH)

        base_options = python.BaseOptions(
            model_asset_path=str(MODEL_PATH)
        )

        options = vision.PoseLandmarkerOptions(

            base_options=base_options,

            running_mode=vision.RunningMode.VIDEO,

            num_poses=1,

            min_pose_detection_confidence=0.5,

            min_pose_presence_confidence=0.5,

            min_tracking_confidence=0.5,
        )

        self.detector = (
            vision.PoseLandmarker
            .create_from_options(options)
        )

        self.timestamp = 0

        print("✅ Pose detector ready")


    # ========================================================
    # DETECT
    # ========================================================

    def detect(self, image):

        self.timestamp += 33

        result = self.detector.detect_for_video(
            image,
            self.timestamp
        )

        if not result.pose_landmarks:

            return {
                "detected": False,
                "landmarks": [],
                "angles": {},
                "status": "NO_PERSON",
                "message": "No person detected"
            }


        landmarks = result.pose_landmarks[0]


        # ====================================================
        # LANDMARK DATA
        # ====================================================

        landmark_data = []

        for index, landmark in enumerate(landmarks):

            landmark_data.append({

                "id": index,

                "x": float(landmark.x),

                "y": float(landmark.y),

                "z": float(landmark.z),

                "visibility": float(
                    getattr(
                        landmark,
                        "visibility",
                        1.0
                    )
                )
            })


        # ====================================================
        # ANGLES
        # ====================================================

        left_elbow = calculate_angle(

            (
                landmarks[11].x,
                landmarks[11].y
            ),

            (
                landmarks[13].x,
                landmarks[13].y
            ),

            (
                landmarks[15].x,
                landmarks[15].y
            )
        )


        right_elbow = calculate_angle(

            (
                landmarks[12].x,
                landmarks[12].y
            ),

            (
                landmarks[14].x,
                landmarks[14].y
            ),

            (
                landmarks[16].x,
                landmarks[16].y
            )
        )


        left_knee = calculate_angle(

            (
                landmarks[23].x,
                landmarks[23].y
            ),

            (
                landmarks[25].x,
                landmarks[25].y
            ),

            (
                landmarks[27].x,
                landmarks[27].y
            )
        )


        right_knee = calculate_angle(

            (
                landmarks[24].x,
                landmarks[24].y
            ),

            (
                landmarks[26].x,
                landmarks[26].y
            ),

            (
                landmarks[28].x,
                landmarks[28].y
            )
        )


        angles = {

            "left_elbow": round(
                left_elbow,
                1
            ),

            "right_elbow": round(
                right_elbow,
                1
            ),

            "left_knee": round(
                left_knee,
                1
            ),

            "right_knee": round(
                right_knee,
                1
            )
        }


        # ====================================================
        # BASIC SAFETY ANALYSIS
        # ====================================================

        status = "SAFE"

        message = "Good posture"


        # Very basic initial rules.
        # We will make this exercise-specific later.

        if (
            left_knee < 45
            or right_knee < 45
        ):

            status = "WARNING"

            message = (
                "Extreme knee angle detected"
            )


        return {

            "detected": True,

            "landmarks": landmark_data,

            "angles": angles,

            "status": status,

            "message": message
        }


    # ========================================================
    # CLOSE
    # ========================================================

    def close(self):

        if self.detector:

            self.detector.close()