import cv2
import mediapipe as mp
import math
from pathlib import Path


# ============================================================
# CONFIGURATION
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = (
    BASE_DIR
    / "models"
    / "pose_landmarker_full.task"
)


# ============================================================
# CHECK MODEL
# ============================================================

print("=" * 50)
print("TrainSafe Pose Detection Test")
print("=" * 50)

print("MediaPipe version:", mp.__version__)
print("Model path:", MODEL_PATH)
print("Model exists:", MODEL_PATH.exists())

if not MODEL_PATH.exists():
    raise FileNotFoundError(
        f"""
Pose model not found:

{MODEL_PATH}

Make sure the model exists at:

ai-service/models/pose_landmarker_full.task
"""
    )


# ============================================================
# MEDIA PIPE IMPORTS
# ============================================================

from mediapipe.tasks import python
from mediapipe.tasks.python import vision


# ============================================================
# CREATE POSE LANDMARKER
# ============================================================

base_options = python.BaseOptions(
    model_asset_path=str(MODEL_PATH)
)

options = vision.PoseLandmarkerOptions(
    base_options=base_options,

    # We are processing a live camera/video stream
    running_mode=vision.RunningMode.VIDEO,

    # Detect one person
    num_poses=1,

    # Confidence settings
    min_pose_detection_confidence=0.5,
    min_pose_presence_confidence=0.5,
    min_tracking_confidence=0.5,
)


detector = vision.PoseLandmarker.create_from_options(
    options
)

print("✅ MediaPipe Pose Landmarker loaded!")
print()


# ============================================================
# COCO / MEDIAPIPE POSE CONNECTIONS
# ============================================================

POSE_CONNECTIONS = [
    (0, 1),
    (1, 2),
    (2, 3),
    (3, 7),

    (0, 4),
    (4, 5),
    (5, 6),
    (6, 8),

    (9, 10),

    (11, 12),

    (11, 13),
    (13, 15),

    (12, 14),
    (14, 16),

    (11, 23),
    (12, 24),

    (23, 24),

    (23, 25),
    (25, 27),

    (24, 26),
    (26, 28),

    (27, 29),
    (29, 31),

    (28, 30),
    (30, 32),

    (27, 31),
    (28, 32),
]


# ============================================================
# JOINT ANGLE FUNCTION
# ============================================================

def calculate_angle(a, b, c):
    """
    Calculate angle ABC.

    a = first point
    b = middle/joint point
    c = third point
    """

    ba = (
        a[0] - b[0],
        a[1] - b[1]
    )

    bc = (
        c[0] - b[0],
        c[1] - b[1]
    )

    dot_product = (
        ba[0] * bc[0]
        + ba[1] * bc[1]
    )

    magnitude_ba = math.sqrt(
        ba[0] ** 2
        + ba[1] ** 2
    )

    magnitude_bc = math.sqrt(
        bc[0] ** 2
        + bc[1] ** 2
    )

    if magnitude_ba == 0 or magnitude_bc == 0:
        return 0

    cosine_angle = (
        dot_product
        / (magnitude_ba * magnitude_bc)
    )

    # Avoid floating point errors
    cosine_angle = max(
        -1,
        min(1, cosine_angle)
    )

    angle = math.degrees(
        math.acos(cosine_angle)
    )

    return angle


# ============================================================
# DRAW POSE
# ============================================================

def draw_pose(frame, landmarks):
    """
    Draw 33 MediaPipe landmarks and skeleton.
    """

    height, width, _ = frame.shape

    points = []

    # --------------------------------------------------------
    # Convert normalized landmarks to pixel coordinates
    # --------------------------------------------------------

    for landmark in landmarks:

        x = int(landmark.x * width)
        y = int(landmark.y * height)

        points.append((x, y))

    # --------------------------------------------------------
    # Draw skeleton
    # --------------------------------------------------------

    for start_idx, end_idx in POSE_CONNECTIONS:

        if start_idx >= len(points):
            continue

        if end_idx >= len(points):
            continue

        start = points[start_idx]
        end = points[end_idx]

        cv2.line(
            frame,
            start,
            end,
            (0, 255, 0),
            3
        )

    # --------------------------------------------------------
    # Draw landmarks
    # --------------------------------------------------------

    for index, point in enumerate(points):

        cv2.circle(
            frame,
            point,
            5,
            (0, 0, 255),
            -1
        )

        # Optional landmark number
        cv2.putText(
            frame,
            str(index),
            (
                point[0] + 5,
                point[1] - 5
            ),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.35,
            (255, 255, 255),
            1
        )

    return points


# ============================================================
# CAMERA
# ============================================================

cap = cv2.VideoCapture(0)

if not cap.isOpened():

    raise RuntimeError(
        "❌ Could not open camera."
    )


print("📷 Camera opened.")
print("Press Q to quit.")
print()


# ============================================================
# TIMESTAMP
# ============================================================

frame_timestamp = 0


# ============================================================
# FPS
# ============================================================

previous_time = cv2.getTickCount()


# ============================================================
# MAIN LOOP
# ============================================================

try:

    while True:

        # ----------------------------------------------------
        # Read frame
        # ----------------------------------------------------

        success, frame = cap.read()

        if not success:

            print(
                "❌ Failed to read camera frame"
            )

            break


        # ----------------------------------------------------
        # Mirror camera
        # ----------------------------------------------------

        frame = cv2.flip(
            frame,
            1
        )


        # ----------------------------------------------------
        # Frame information
        # ----------------------------------------------------

        brightness = frame.mean()


        # ----------------------------------------------------
        # Convert BGR → RGB
        # ----------------------------------------------------

        rgb = cv2.cvtColor(
            frame,
            cv2.COLOR_BGR2RGB
        )


        # ----------------------------------------------------
        # Create MediaPipe Image
        # ----------------------------------------------------

        mp_image = mp.Image(
            image_format=mp.ImageFormat.SRGB,
            data=rgb
        )


        # ----------------------------------------------------
        # Timestamp
        #
        # 33 ms ≈ 30 FPS
        # ----------------------------------------------------

        frame_timestamp += 33


        # ----------------------------------------------------
        # RUN POSE DETECTION
        # ----------------------------------------------------

        result = detector.detect_for_video(
            mp_image,
            frame_timestamp
        )


        # ====================================================
        # PERSON DETECTED
        # ====================================================

        if result.pose_landmarks:

            landmarks = result.pose_landmarks[0]


            print(
                f"✅ Person detected | "
                f"Landmarks: {len(landmarks)}"
            )


            # ------------------------------------------------
            # Draw skeleton
            # ------------------------------------------------

            points = draw_pose(
                frame,
                landmarks
            )


            # =================================================
            # JOINT ANGLES
            # =================================================

            # MediaPipe landmark indexes:
            #
            # 11 = LEFT SHOULDER
            # 13 = LEFT ELBOW
            # 15 = LEFT WRIST
            #
            # 12 = RIGHT SHOULDER
            # 14 = RIGHT ELBOW
            # 16 = RIGHT WRIST
            #
            # 23 = LEFT HIP
            # 25 = LEFT KNEE
            # 27 = LEFT ANKLE
            #
            # 24 = RIGHT HIP
            # 26 = RIGHT KNEE
            # 28 = RIGHT ANKLE


            # ------------------------------------------------
            # LEFT ELBOW
            # ------------------------------------------------

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


            # ------------------------------------------------
            # RIGHT ELBOW
            # ------------------------------------------------

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


            # ------------------------------------------------
            # LEFT KNEE
            # ------------------------------------------------

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


            # ------------------------------------------------
            # RIGHT KNEE
            # ------------------------------------------------

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


            # =================================================
            # DISPLAY ANGLES
            # =================================================

            cv2.putText(
                frame,
                f"Left Elbow: {int(left_elbow)}",
                (20, 40),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (255, 255, 255),
                2
            )


            cv2.putText(
                frame,
                f"Right Elbow: {int(right_elbow)}",
                (20, 70),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (255, 255, 255),
                2
            )


            cv2.putText(
                frame,
                f"Left Knee: {int(left_knee)}",
                (20, 100),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (255, 255, 255),
                2
            )


            cv2.putText(
                frame,
                f"Right Knee: {int(right_knee)}",
                (20, 130),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (255, 255, 255),
                2
            )


            # =================================================
            # BASIC POSTURE STATUS
            # =================================================

            # Simple demonstration rule.
            # We will replace this with exercise-specific
            # injury analysis later.

            if (
                left_knee > 160
                and right_knee > 160
            ):

                posture_status = "GOOD POSTURE"

            else:

                posture_status = "CHECK FORM"


            cv2.putText(
                frame,
                posture_status,
                (20, 170),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.9,
                (0, 255, 0)
                if posture_status == "GOOD POSTURE"
                else (0, 165, 255),
                2
            )


        # ====================================================
        # NO PERSON
        # ====================================================

        else:

            print(
                "⚠️ No person detected"
            )


            cv2.putText(
                frame,
                "NO PERSON DETECTED",
                (20, 50),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.9,
                (0, 0, 255),
                2
            )


        # ====================================================
        # CAMERA INFO
        # ====================================================

        cv2.putText(
            frame,
            f"Brightness: {brightness:.1f}",
            (20, 210),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (255, 255, 255),
            2
        )


        cv2.putText(
            frame,
            "TrainSafe AI Pose Detection",
            (20, 460),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (255, 255, 255),
            2
        )


        # ====================================================
        # SHOW CAMERA
        # ====================================================

        cv2.imshow(
            "TrainSafe - AI Pose Detection",
            frame
        )


        # ====================================================
        # QUIT
        # ====================================================

        key = cv2.waitKey(1) & 0xFF

        if key == ord("q"):

            break


finally:

    # ========================================================
    # CLEANUP
    # ========================================================

    cap.release()

    cv2.destroyAllWindows()

    detector.close()

    print()
    print("=" * 50)
    print("✅ Test finished")
    print("=" * 50)