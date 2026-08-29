import cv2
import mediapipe as mp

from mediapipe.tasks import python
from mediapipe.tasks.python import vision


class PoseDetector:

    def __init__(self):

        self.model_path = (
            "models/pose_landmarker_full.task"
        )

        print("Loading MediaPipe Pose Landmarker...")

        base_options = python.BaseOptions(
            model_asset_path=self.model_path
        )

        options = vision.PoseLandmarkerOptions(
            base_options=base_options,
            running_mode=vision.RunningMode.IMAGE,
            num_poses=1,
            min_pose_detection_confidence=0.5,
            min_pose_presence_confidence=0.5,
            min_tracking_confidence=0.5,
        )

        self.detector = (
            vision.PoseLandmarker.create_from_options(
                options
            )
        )

        print("✅ MediaPipe Pose Landmarker ready")

    def detect(self, frame):

        # OpenCV BGR → RGB
        rgb_frame = cv2.cvtColor(
            frame,
            cv2.COLOR_BGR2RGB
        )

        # Convert to MediaPipe image
        mp_image = mp.Image(
            image_format=mp.ImageFormat.SRGB,
            data=rgb_frame
        )

        # Detect pose
        result = self.detector.detect(
            mp_image
        )

        if not result.pose_landmarks:
            return []

        landmarks = result.pose_landmarks[0]

        output = []

        for index, landmark in enumerate(
            landmarks
        ):

            output.append({
                "id": index,
                "x": round(landmark.x, 5),
                "y": round(landmark.y, 5),
                "z": round(landmark.z, 5),
                "visibility": round(
                    landmark.visibility,
                    5
                ),
            })

        return output

    def close(self):

        self.detector.close()