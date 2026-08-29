def build_features(
    movement,
    training_load,
    recovery_score,
    intensity,
):

    if not movement.get("detected"):

        return None

    angles = movement["angles"]

    symmetry = movement["symmetry"]

    features = [
        angles["left_knee"],
        angles["right_knee"],

        angles["left_hip"],
        angles["right_hip"],

        symmetry["knee_difference"],
        symmetry["hip_difference"],

        training_load,
        recovery_score,
        intensity,
    ]

    return features