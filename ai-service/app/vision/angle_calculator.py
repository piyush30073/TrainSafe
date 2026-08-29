import math


def calculate_angle(
    point_a,
    point_b,
    point_c
):
    """
    Calculates angle ABC.

    B is the joint/center point.
    """

    angle = math.degrees(
        math.atan2(
            point_c["y"] - point_b["y"],
            point_c["x"] - point_b["x"],
        )
        -
        math.atan2(
            point_a["y"] - point_b["y"],
            point_a["x"] - point_b["x"],
        )
    )

    angle = abs(angle)

    if angle > 180:
        angle = 360 - angle

    return round(angle, 2)