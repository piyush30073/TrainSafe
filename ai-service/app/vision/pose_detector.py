from pathlib import Path
from typing import Any, Dict, List, Optional

import cv2
import mediapipe as mp
import numpy as np


class PoseDetector:
    """
    TrainSafe MediaPipe Pose Detector.

    Responsibilities:
    - Detect human pose
    - Extract MediaPipe's 33 landmarks
    - Calculate joint angles
    - Estimate movement/injury risk
    - Generate warnings
    - Generate feedback/recommendations
    """

    # ============================================================
    # MEDIAPIPE LANDMARK INDEXES
    # ============================================================

    NOSE = 0

    LEFT_SHOULDER = 11
    RIGHT_SHOULDER = 12

    LEFT_ELBOW = 13
    RIGHT_ELBOW = 14

    LEFT_WRIST = 15
    RIGHT_WRIST = 16

    LEFT_HIP = 23
    RIGHT_HIP = 24

    LEFT_KNEE = 25
    RIGHT_KNEE = 26

    LEFT_ANKLE = 27
    RIGHT_ANKLE = 28

    LEFT_HEEL = 29
    RIGHT_HEEL = 30

    LEFT_FOOT_INDEX = 31
    RIGHT_FOOT_INDEX = 32

    # ============================================================
    # INITIALIZATION
    # ============================================================

    def __init__(self):

        print("🚀 Initializing MediaPipe PoseLandmarker...")

        # Current file:
        #
        # ai-service/
        # ├── app/
        # │   └── vision/
        # │       └── pose_detector.py
        # │
        # └── models/
        #     └── pose_landmarker_lite.task
        #
        # parents[0] = vision
        # parents[1] = app
        # parents[2] = ai-service

        self.base_dir = Path(
            __file__
        ).resolve().parents[2]

        self.model_path = (
            self.base_dir
            / "models"
            / "pose_landmarker_lite.task"
        )

        print(
            f"📦 Model path: {self.model_path}"
        )

        # --------------------------------------------------------
        # Check model
        # --------------------------------------------------------

        if not self.model_path.exists():

            raise FileNotFoundError(
                "\n"
                "❌ MediaPipe model not found!\n\n"
                f"Expected:\n{self.model_path}\n\n"
                "Your project should contain:\n"
                "ai-service/models/"
                "pose_landmarker_lite.task\n"
            )

        # --------------------------------------------------------
        # MediaPipe configuration
        # --------------------------------------------------------

        BaseOptions = mp.tasks.BaseOptions

        PoseLandmarkerOptions = (
            mp.tasks.vision.PoseLandmarkerOptions
        )

        PoseLandmarker = (
            mp.tasks.vision.PoseLandmarker
        )

        RunningMode = (
            mp.tasks.vision.RunningMode
        )

        options = PoseLandmarkerOptions(

            base_options=BaseOptions(
                model_asset_path=str(
                    self.model_path
                )
            ),

            running_mode=RunningMode.VIDEO,

            num_poses=1,

            min_pose_detection_confidence=0.5,

            min_pose_presence_confidence=0.5,

            min_tracking_confidence=0.5,
        )

        # --------------------------------------------------------
        # Create detector
        # --------------------------------------------------------

        self.detector = (
            PoseLandmarker.create_from_options(
                options
            )
        )

        print(
            "✅ MediaPipe PoseLandmarker initialized"
        )

    # ============================================================
    # DETECT
    # ============================================================

    def detect(
        self,
        image: np.ndarray,
        timestamp_ms: Optional[int] = None,
    ) -> Dict[str, Any]:

        """
        Compatibility method.

        Your existing WebSocket route calls:

            pose_detector.detect(...)

        Therefore this method forwards the request
        to process_frame().
        """

        return self.process_frame(
            image=image,
            timestamp_ms=timestamp_ms,
        )

    # ============================================================
    # PROCESS FRAME
    # ============================================================

    def process_frame(
        self,
        image: np.ndarray,
        timestamp_ms: Optional[int] = None,
    ) -> Dict[str, Any]:

        # --------------------------------------------------------
        # Validate image
        # --------------------------------------------------------

        if image is None:

            return self._empty_result(
                "No image received."
            )

        if image.size == 0:

            return self._empty_result(
                "Empty image received."
            )

        # --------------------------------------------------------
        # Convert BGR -> RGB
        # --------------------------------------------------------

        try:

            rgb_image = cv2.cvtColor(
                image,
                cv2.COLOR_BGR2RGB,
            )

        except Exception as error:

            print(
                f"❌ Image conversion error: {error}"
            )

            return self._empty_result(
                "Unable to process image."
            )

        # --------------------------------------------------------
        # MediaPipe image
        # --------------------------------------------------------

        try:

            mp_image = mp.Image(
                image_format=mp.ImageFormat.SRGB,
                data=rgb_image,
            )

        except Exception as error:

            print(
                f"❌ MediaPipe image error: {error}"
            )

            return self._empty_result(
                "Unable to create MediaPipe image."
            )

        # --------------------------------------------------------
        # Timestamp
        # --------------------------------------------------------

        if timestamp_ms is None:

            timestamp_ms = 0

        # MediaPipe VIDEO mode requires increasing timestamps.
        # The WebSocket normally provides timestamps, but this
        # fallback protects against duplicate/invalid timestamps.

        if not hasattr(
            self,
            "_last_timestamp",
        ):

            self._last_timestamp = -1

        timestamp_ms = int(
            timestamp_ms
        )

        if timestamp_ms <= self._last_timestamp:

            timestamp_ms = (
                self._last_timestamp + 1
            )

        self._last_timestamp = timestamp_ms

        # --------------------------------------------------------
        # Run MediaPipe
        # --------------------------------------------------------

        try:

            result = (
                self.detector.detect_for_video(
                    mp_image,
                    timestamp_ms,
                )
            )

        except Exception as error:

            print(
                f"❌ MediaPipe processing error: {error}"
            )

            return self._empty_result(
                "Pose processing failed."
            )

        # --------------------------------------------------------
        # Check pose
        # --------------------------------------------------------

        if (
            not result.pose_landmarks
            or len(result.pose_landmarks) == 0
        ):

            return self._empty_result(
                "No pose detected."
            )

        # --------------------------------------------------------
        # First person
        # --------------------------------------------------------

        pose_landmarks = (
            result.pose_landmarks[0]
        )

        # --------------------------------------------------------
        # Extract 33 landmarks
        # --------------------------------------------------------

        landmarks = (
            self._extract_landmarks(
                pose_landmarks
            )
        )

        # --------------------------------------------------------
        # Calculate angles
        # --------------------------------------------------------

        angles = (
            self._calculate_angles(
                landmarks
            )
        )

        # --------------------------------------------------------
        # Calculate risk
        # --------------------------------------------------------

        risk_data = (
            self._calculate_risk(
                landmarks,
                angles,
            )
        )

        # --------------------------------------------------------
        # Final response
        # --------------------------------------------------------

        return {

            "detected": True,

            "landmarks": landmarks,

            "angles": angles,

            "risk": risk_data["risk"],

            "risk_level": risk_data[
                "risk_level"
            ],

            "warnings": risk_data[
                "warnings"
            ],

            "feedback": risk_data[
                "feedback"
            ],

            "recommendation": risk_data[
                "recommendation"
            ],

            "metrics": risk_data[
                "metrics"
            ],

            "status": "Pose detected",

            "message": (
                "Pose analyzed successfully."
            ),
        }

    # ============================================================
    # EXTRACT LANDMARKS
    # ============================================================

    def _extract_landmarks(
        self,
        pose_landmarks,
    ) -> List[Dict[str, float]]:

        landmarks = []

        for landmark in pose_landmarks:

            visibility = getattr(
                landmark,
                "visibility",
                1.0,
            )

            landmarks.append(
                {
                    "x": float(
                        landmark.x
                    ),

                    "y": float(
                        landmark.y
                    ),

                    "z": float(
                        landmark.z
                    ),

                    "visibility": float(
                        visibility
                    ),
                }
            )

        return landmarks

    # ============================================================
    # GET LANDMARK
    # ============================================================

    def _get_landmark(
        self,
        landmarks: List[
            Dict[str, float]
        ],
        index: int,
    ):

        if (
            index < 0
            or index >= len(landmarks)
        ):

            return None

        return landmarks[index]

    # ============================================================
    # CALCULATE ANGLE
    # ============================================================

    def _calculate_angle(
        self,
        a: Dict[str, float],
        b: Dict[str, float],
        c: Dict[str, float],
    ) -> Optional[float]:

        if (
            a is None
            or b is None
            or c is None
        ):

            return None

        try:

            point_a = np.array(
                [
                    a["x"],
                    a["y"],
                ],
                dtype=np.float32,
            )

            point_b = np.array(
                [
                    b["x"],
                    b["y"],
                ],
                dtype=np.float32,
            )

            point_c = np.array(
                [
                    c["x"],
                    c["y"],
                ],
                dtype=np.float32,
            )

            ba = point_a - point_b

            bc = point_c - point_b

            norm_ba = np.linalg.norm(
                ba
            )

            norm_bc = np.linalg.norm(
                bc
            )

            denominator = (
                norm_ba * norm_bc
            )

            if denominator == 0:

                return None

            cosine_angle = (
                np.dot(
                    ba,
                    bc,
                )
                / denominator
            )

            cosine_angle = np.clip(
                cosine_angle,
                -1.0,
                1.0,
            )

            angle = np.degrees(
                np.arccos(
                    cosine_angle
                )
            )

            return float(angle)

        except Exception:

            return None

    # ============================================================
    # CALCULATE ALL ANGLES
    # ============================================================

    def _calculate_angles(
        self,
        landmarks: List[
            Dict[str, float]
        ],
    ) -> Dict[
        str,
        Optional[float]
    ]:

        # --------------------------------------------------------
        # Left elbow
        # --------------------------------------------------------

        left_elbow = (
            self._calculate_angle(
                self._get_landmark(
                    landmarks,
                    self.LEFT_SHOULDER,
                ),
                self._get_landmark(
                    landmarks,
                    self.LEFT_ELBOW,
                ),
                self._get_landmark(
                    landmarks,
                    self.LEFT_WRIST,
                ),
            )
        )

        # --------------------------------------------------------
        # Right elbow
        # --------------------------------------------------------

        right_elbow = (
            self._calculate_angle(
                self._get_landmark(
                    landmarks,
                    self.RIGHT_SHOULDER,
                ),
                self._get_landmark(
                    landmarks,
                    self.RIGHT_ELBOW,
                ),
                self._get_landmark(
                    landmarks,
                    self.RIGHT_WRIST,
                ),
            )
        )

        # --------------------------------------------------------
        # Left knee
        # --------------------------------------------------------

        left_knee = (
            self._calculate_angle(
                self._get_landmark(
                    landmarks,
                    self.LEFT_HIP,
                ),
                self._get_landmark(
                    landmarks,
                    self.LEFT_KNEE,
                ),
                self._get_landmark(
                    landmarks,
                    self.LEFT_ANKLE,
                ),
            )
        )

        # --------------------------------------------------------
        # Right knee
        # --------------------------------------------------------

        right_knee = (
            self._calculate_angle(
                self._get_landmark(
                    landmarks,
                    self.RIGHT_HIP,
                ),
                self._get_landmark(
                    landmarks,
                    self.RIGHT_KNEE,
                ),
                self._get_landmark(
                    landmarks,
                    self.RIGHT_ANKLE,
                ),
            )
        )

        # --------------------------------------------------------
        # Left hip
        # --------------------------------------------------------

        left_hip = (
            self._calculate_angle(
                self._get_landmark(
                    landmarks,
                    self.LEFT_SHOULDER,
                ),
                self._get_landmark(
                    landmarks,
                    self.LEFT_HIP,
                ),
                self._get_landmark(
                    landmarks,
                    self.LEFT_KNEE,
                ),
            )
        )

        # --------------------------------------------------------
        # Right hip
        # --------------------------------------------------------

        right_hip = (
            self._calculate_angle(
                self._get_landmark(
                    landmarks,
                    self.RIGHT_SHOULDER,
                ),
                self._get_landmark(
                    landmarks,
                    self.RIGHT_HIP,
                ),
                self._get_landmark(
                    landmarks,
                    self.RIGHT_KNEE,
                ),
            )
        )

        # --------------------------------------------------------
        # Trunk lean
        # --------------------------------------------------------

        trunk_lean = (
            self._calculate_trunk_lean(
                landmarks
            )
        )

        return {

            "left_elbow": left_elbow,

            "right_elbow": right_elbow,

            "left_knee": left_knee,

            "right_knee": right_knee,

            "left_hip": left_hip,

            "right_hip": right_hip,

            "trunk_lean": trunk_lean,
        }

    # ============================================================
    # TRUNK LEAN
    # ============================================================

    def _calculate_trunk_lean(
        self,
        landmarks: List[
            Dict[str, float]
        ],
    ) -> Optional[float]:

        try:

            left_shoulder = (
                self._get_landmark(
                    landmarks,
                    self.LEFT_SHOULDER,
                )
            )

            right_shoulder = (
                self._get_landmark(
                    landmarks,
                    self.RIGHT_SHOULDER,
                )
            )

            left_hip = (
                self._get_landmark(
                    landmarks,
                    self.LEFT_HIP,
                )
            )

            right_hip = (
                self._get_landmark(
                    landmarks,
                    self.RIGHT_HIP,
                )
            )

            if not all(
                [
                    left_shoulder,
                    right_shoulder,
                    left_hip,
                    right_hip,
                ]
            ):

                return None

            shoulder_x = (
                left_shoulder["x"]
                + right_shoulder["x"]
            ) / 2

            shoulder_y = (
                left_shoulder["y"]
                + right_shoulder["y"]
            ) / 2

            hip_x = (
                left_hip["x"]
                + right_hip["x"]
            ) / 2

            hip_y = (
                left_hip["y"]
                + right_hip["y"]
            ) / 2

            dx = (
                shoulder_x
                - hip_x
            )

            dy = (
                shoulder_y
                - hip_y
            )

            if abs(dy) < 0.0001:

                return 90.0

            angle = np.degrees(
                np.arctan2(
                    abs(dx),
                    abs(dy),
                )
            )

            return float(angle)

        except Exception:

            return None

    # ============================================================
    # VISIBILITY
    # ============================================================

    def _average_visibility(
        self,
        landmarks: List[
            Dict[str, float]
        ],
    ) -> float:

        if not landmarks:

            return 0.0

        visibility_values = []

        for landmark in landmarks:

            value = float(
                landmark.get(
                    "visibility",
                    1.0,
                )
            )

            visibility_values.append(
                value
            )

        if not visibility_values:

            return 0.0

        return float(
            np.mean(
                visibility_values
            )
        )

    # ============================================================
    # RISK CALCULATION
    # ============================================================

    def _calculate_risk(
        self,
        landmarks: List[
            Dict[str, float]
        ],
        angles: Dict[
            str,
            Optional[float]
        ],
    ) -> Dict[str, Any]:

        risk = 0

        warnings = []

        # ========================================================
        # VISIBILITY
        # ========================================================

        visibility = (
            self._average_visibility(
                landmarks
            )
        )

        if visibility < 0.45:

            risk += 20

            warnings.append(
                "Pose visibility is low."
            )

        elif visibility < 0.60:

            risk += 10

            warnings.append(
                "Some body landmarks are difficult to detect."
            )

        # ========================================================
        # KNEES
        # ========================================================

        left_knee = angles.get(
            "left_knee"
        )

        right_knee = angles.get(
            "right_knee"
        )

        if (
            left_knee is not None
            and left_knee < 45
        ):

            risk += 20

            warnings.append(
                "Left knee is deeply bent."
            )

        if (
            right_knee is not None
            and right_knee < 45
        ):

            risk += 20

            warnings.append(
                "Right knee is deeply bent."
            )

        # ========================================================
        # KNEE ASYMMETRY
        # ========================================================

        if (
            left_knee is not None
            and right_knee is not None
        ):

            difference = abs(
                left_knee
                - right_knee
            )

            if difference > 35:

                risk += 15

                warnings.append(
                    "Significant left/right knee asymmetry detected."
                )

            elif difference > 20:

                risk += 8

                warnings.append(
                    "Moderate knee asymmetry detected."
                )

        # ========================================================
        # HIPS
        # ========================================================

        left_hip = angles.get(
            "left_hip"
        )

        right_hip = angles.get(
            "right_hip"
        )

        if (
            left_hip is not None
            and left_hip < 50
        ):

            risk += 10

            warnings.append(
                "Left hip is highly flexed."
            )

        if (
            right_hip is not None
            and right_hip < 50
        ):

            risk += 10

            warnings.append(
                "Right hip is highly flexed."
            )

        # ========================================================
        # TRUNK LEAN
        # ========================================================

        trunk_lean = angles.get(
            "trunk_lean"
        )

        if (
            trunk_lean is not None
            and trunk_lean > 30
        ):

            risk += 20

            warnings.append(
                "Excessive trunk lean detected."
            )

        elif (
            trunk_lean is not None
            and trunk_lean > 20
        ):

            risk += 10

            warnings.append(
                "Moderate trunk lean detected."
            )

        # ========================================================
        # LIMIT RISK
        # ========================================================

        risk = max(
            0,
            min(
                100,
                int(round(risk)),
            ),
        )

        # ========================================================
        # RISK LEVEL
        # ========================================================

        if risk < 25:

            risk_level = "LOW"

        elif risk < 50:

            risk_level = "MODERATE"

        elif risk < 75:

            risk_level = "HIGH"

        else:

            risk_level = "CRITICAL"

        # ========================================================
        # FEEDBACK
        # ========================================================

        if risk_level == "LOW":

            feedback = (
                "Your movement currently looks "
                "relatively stable."
            )

            recommendation = (
                "Continue with controlled movement "
                "and maintain good posture."
            )

        elif risk_level == "MODERATE":

            feedback = (
                "Some movement patterns may "
                "increase injury risk."
            )

            recommendation = (
                "Slow down and focus on controlled "
                "movement and balanced posture."
            )

        elif risk_level == "HIGH":

            feedback = (
                "Potentially risky movement detected."
            )

            recommendation = (
                "Reduce intensity and correct "
                "your movement technique."
            )

        else:

            feedback = (
                "High-risk movement pattern detected."
            )

            recommendation = (
                "Pause the exercise and reset "
                "your posture before continuing."
            )

        # ========================================================
        # LOW VISIBILITY OVERRIDE
        # ========================================================

        if visibility < 0.45:

            feedback = (
                "Pose confidence is low. "
                "Move fully into the camera frame."
            )

            recommendation = (
                "Make sure your complete body is "
                "visible and the camera has a clear view."
            )

        # ========================================================
        # METRICS
        # ========================================================

        metrics = {

            "left_knee_angle": left_knee,

            "right_knee_angle": right_knee,

            "left_hip_angle": left_hip,

            "right_hip_angle": right_hip,

            "trunk_lean": trunk_lean,

            "visibility": visibility,
        }

        return {

            "risk": risk,

            "risk_level": risk_level,

            "warnings": warnings,

            "feedback": feedback,

            "recommendation": recommendation,

            "metrics": metrics,
        }

    # ============================================================
    # EMPTY RESULT
    # ============================================================

    def _empty_result(
        self,
        message: str,
    ) -> Dict[str, Any]:

        return {

            "detected": False,

            "landmarks": [],

            "angles": {

                "left_elbow": None,

                "right_elbow": None,

                "left_knee": None,

                "right_knee": None,

                "left_hip": None,

                "right_hip": None,

                "trunk_lean": None,
            },

            "risk": None,

            "risk_level": "WAITING",

            "warnings": [],

            "feedback": message,

            "recommendation": (
                "Move your full body into "
                "the camera frame."
            ),

            "metrics": {

                "left_knee_angle": None,

                "right_knee_angle": None,

                "left_hip_angle": None,

                "right_hip_angle": None,

                "trunk_lean": None,

                "visibility": 0.0,
            },

            "status": "No pose",

            "message": message,
        }