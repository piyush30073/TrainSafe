from app.vision.angle_calculator import calculate_angle


def test_right_angle():

    a = {
        "x": 0,
        "y": 0,
    }

    b = {
        "x": 0,
        "y": 1,
    }

    c = {
        "x": 1,
        "y": 1,
    }

    angle = calculate_angle(
        a,
        b,
        c
    )

    assert angle == 90