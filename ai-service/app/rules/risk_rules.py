def evaluate_rules(
    risk_score,
    movement,
):

    rules = []

    if movement.get("detected"):

        knee_difference = movement[
            "symmetry"
        ]["knee_difference"]

        if knee_difference > 15:

            rules.append(
                "Reduce intensity and focus on symmetrical knee alignment."
            )

        elif knee_difference > 8:

            rules.append(
                "Pay attention to left-right knee alignment."
            )

        left_knee = movement[
            "angles"
        ]["left_knee"]

        right_knee = movement[
            "angles"
        ]["right_knee"]

        if left_knee < 60 or right_knee < 60:

            rules.append(
                "Avoid forcing excessive knee flexion."
            )

    return rules