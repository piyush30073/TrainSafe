class RiskPredictor:

    def predict(
        self,
        movement,
        training_load,
        recovery_score,
        intensity,
    ):

        if not movement.get("detected"):

            return {
                "risk_score": None,
                "risk_level": "UNKNOWN",
                "risk_factors": [
                    "Pose could not be detected."
                ],
            }

        score = 0

        factors = []

        symmetry = movement["symmetry"]

        knee_difference = (
            symmetry["knee_difference"]
        )

        hip_difference = (
            symmetry["hip_difference"]
        )

        # Movement symmetry

        if knee_difference > 15:

            score += 30

            factors.append(
                "Significant knee asymmetry detected."
            )

        elif knee_difference > 8:

            score += 15

            factors.append(
                "Mild knee asymmetry detected."
            )

        if hip_difference > 15:

            score += 20

            factors.append(
                "Significant hip asymmetry detected."
            )

        elif hip_difference > 8:

            score += 10

            factors.append(
                "Mild hip asymmetry detected."
            )

        # Training load

        if training_load > 80:

            score += 20

            factors.append(
                "High training load."
            )

        elif training_load > 60:

            score += 10

            factors.append(
                "Elevated training load."
            )

        # Recovery

        if recovery_score < 40:

            score += 20

            factors.append(
                "Low recovery score."
            )

        elif recovery_score < 60:

            score += 10

            factors.append(
                "Recovery is below optimal."
            )

        # Intensity

        if intensity >= 9:

            score += 15

            factors.append(
                "Very high workout intensity."
            )

        score = min(score, 100)

        if score >= 70:

            level = "HIGH"

        elif score >= 40:

            level = "MODERATE"

        else:

            level = "LOW"

        return {
            "risk_score": score,
            "risk_level": level,
            "risk_factors": factors,
        }