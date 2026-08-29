from app.vision.angle_calculator import calculate_angle


# MediaPipe landmark indices

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


class MovementAnalyzer:

    def __init__(self):

        self.required_landmarks = [
            LEFT_SHOULDER,
            RIGHT_SHOULDER,
            LEFT_HIP,
            RIGHT_HIP,
            LEFT_KNEE,
            RIGHT_KNEE,
            LEFT_ANKLE,
            RIGHT_ANKLE,
        ]

    def analyze(self, landmarks):

        if not landmarks:
            return {
                "detected": False,
                "message": "No human pose detected.",
            }

        landmark_map = {
            landmark["id"]: landmark
            for landmark in landmarks
        }

        missing = [
            index
            for index in self.required_landmarks
            if index not in landmark_map
        ]

        if missing:

            return {
                "detected": False,
                "message": "Required body landmarks are missing.",
                "missing_landmarks": missing,
            }

        left_knee_angle = calculate_angle(
            landmark_map[LEFT_HIP],
            landmark_map[LEFT_KNEE],
            landmark_map[LEFT_ANKLE],
        )

        right_knee_angle = calculate_angle(
            landmark_map[RIGHT_HIP],
            landmark_map[RIGHT_KNEE],
            landmark_map[RIGHT_ANKLE],
        )

        left_hip_angle = calculate_angle(
            landmark_map[LEFT_SHOULDER],
            landmark_map[LEFT_HIP],
            landmark_map[LEFT_KNEE],
        )

        right_hip_angle = calculate_angle(
            landmark_map[RIGHT_SHOULDER],
            landmark_map[RIGHT_HIP],
            landmark_map[RIGHT_KNEE],
        )

        knee_difference = abs(
            left_knee_angle -
            right_knee_angle
        )

        hip_difference = abs(
            left_hip_angle -
            right_hip_angle
        )

        return {
            "detected": True,

            "angles": {
                "left_knee": left_knee_angle,
                "right_knee": right_knee_angle,
                "left_hip": left_hip_angle,
                "right_hip": right_hip_angle,
            },

            "symmetry": {
                "knee_difference": round(
                    knee_difference,
                    2
                ),
                "hip_difference": round(
                    hip_difference,
                    2
                ),
            },
        }