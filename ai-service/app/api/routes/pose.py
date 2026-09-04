import base64
import time

import cv2
import numpy as np
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.vision.pose_detector import PoseDetector


router = APIRouter()

print("🚀 Creating PoseDetector...")
pose_detector = PoseDetector()
print("✅ PoseDetector ready")


@router.websocket("/ws/pose")
async def pose_websocket(websocket: WebSocket):

    await websocket.accept()

    print("🟢 Pose WebSocket connected")

    # MediaPipe VIDEO mode needs increasing timestamps
    last_timestamp = 0

    try:

        while True:

            # ========================================================
            # RECEIVE FRAME
            # ========================================================

            data = await websocket.receive_text()

            if not data:
                continue

            # ========================================================
            # REMOVE DATA URL PREFIX
            # ========================================================

            if "," in data:

                data = data.split(
                    ",",
                    1,
                )[1]

            # ========================================================
            # BASE64 -> BYTES
            # ========================================================

            try:

                image_bytes = base64.b64decode(
                    data
                )

            except Exception as error:

                print(
                    f"❌ Base64 decode error: {error}"
                )

                await websocket.send_json(
                    {
                        "success": False,
                        "detected": False,
                        "risk": None,
                        "risk_level": "WAITING",
                        "message": "Invalid image data.",
                    }
                )

                continue

            # ========================================================
            # BYTES -> NUMPY
            # ========================================================

            np_array = np.frombuffer(
                image_bytes,
                dtype=np.uint8,
            )

            # ========================================================
            # NUMPY -> OPENCV IMAGE
            # ========================================================

            frame = cv2.imdecode(
                np_array,
                cv2.IMREAD_COLOR,
            )

            if frame is None:

                print(
                    "❌ Could not decode image"
                )

                await websocket.send_json(
                    {
                        "success": False,
                        "detected": False,
                        "risk": None,
                        "risk_level": "WAITING",
                        "message": "Could not decode image.",
                    }
                )

                continue

            # ========================================================
            # TIMESTAMP
            # ========================================================

            current_timestamp = int(
                time.time() * 1000
            )

            if current_timestamp <= last_timestamp:

                current_timestamp = (
                    last_timestamp + 1
                )

            last_timestamp = (
                current_timestamp
            )

            # ========================================================
            # POSE DETECTION
            # ========================================================

            try:

                result = pose_detector.detect(
                    frame,
                    timestamp_ms=current_timestamp,
                )

            except Exception as error:

                print(
                    f"❌ Pose detection error: {error}"
                )

                await websocket.send_json(
                    {
                        "success": False,
                        "detected": False,
                        "risk": None,
                        "risk_level": "WAITING",
                        "message": str(error),
                    }
                )

                continue

            # ========================================================
            # SEND RESULT
            # ========================================================

            response = {
                "success": True,

                "detected": result.get(
                    "detected",
                    False,
                ),

                "landmarks": result.get(
                    "landmarks",
                    [],
                ),

                "angles": result.get(
                    "angles",
                    {},
                ),

                "risk": result.get(
                    "risk",
                    None,
                ),

                "risk_level": result.get(
                    "risk_level",
                    "WAITING",
                ),

                "warnings": result.get(
                    "warnings",
                    [],
                ),

                "feedback": result.get(
                    "feedback",
                    "",
                ),

                "recommendation": result.get(
                    "recommendation",
                    "",
                ),

                "metrics": result.get(
                    "metrics",
                    {},
                ),

                "status": result.get(
                    "status",
                    "",
                ),

                "message": result.get(
                    "message",
                    "",
                ),
            }

            await websocket.send_json(
                response
            )

            # ========================================================
            # DEBUG
            # ========================================================

            print(
                f"📤 Pose: "
                f"detected={response['detected']} | "
                f"risk={response['risk']} | "
                f"level={response['risk_level']}"
            )

    except WebSocketDisconnect:

        print(
            "🔴 Pose WebSocket disconnected"
        )

    except Exception as error:

        print(
            f"❌ Pose WebSocket error: {error}"
        )

        try:

            await websocket.close()

        except Exception:

            pass