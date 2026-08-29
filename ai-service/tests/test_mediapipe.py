import mediapipe as mp
from mediapipe.tasks import python
from mediapipe.tasks.python import vision

MODEL_PATH = "models/pose_landmarker_full.task"

print("MediaPipe version:", mp.__version__)
print("Loading model...")

base_options = python.BaseOptions(
    model_asset_path=MODEL_PATH
)

options = vision.PoseLandmarkerOptions(
    base_options=base_options,
    running_mode=vision.RunningMode.IMAGE,
    num_poses=1,
)

detector = vision.PoseLandmarker.create_from_options(
    options
)

print("✅ Pose Landmarker initialized successfully!")

detector.close()

print("✅ MediaPipe setup is working!")