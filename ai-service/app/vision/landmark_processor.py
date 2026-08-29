class LandmarkProcessor:

    def extract_landmarks(self, result):

        if not result.pose_landmarks:
            return []

        pose = result.pose_landmarks[0]

        landmarks = []

        for index, landmark in enumerate(pose):

            landmarks.append(
                {
                    "id": index,
                    "x": round(landmark.x, 6),
                    "y": round(landmark.y, 6),
                    "z": round(landmark.z, 6),
                    "visibility": round(
                        getattr(
                            landmark,
                            "visibility",
                            1.0
                        ),
                        4
                    ),
                }
            )

        return landmarks