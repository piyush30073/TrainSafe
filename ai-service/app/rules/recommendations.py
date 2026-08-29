def generate_recommendations(
    risk_level,
    risk_factors,
    rule_recommendations,
):

    recommendations = list(
        rule_recommendations
    )

    if risk_level == "HIGH":

        recommendations.append(
            "Consider reducing workout intensity."
        )

        recommendations.append(
            "Allow additional recovery before another high-intensity session."
        )

    elif risk_level == "MODERATE":

        recommendations.append(
            "Focus on controlled movement and proper technique."
        )

    else:

        recommendations.append(
            "Continue with controlled technique and monitor your form."
        )

    if not risk_factors:

        recommendations.append(
            "No major risk factors were detected from the available data."
        )

    return list(
        dict.fromkeys(
            recommendations
        )
    )