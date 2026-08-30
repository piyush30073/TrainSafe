import base64
import json

import cv2
import numpy as np

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.vision.pose_detector import PoseDetector


router = APIRouter()


pose_detector = PoseDetector()


# ============================================================
# WEBSOCKET
# ============================================================

@router.websocket("/ws/pose")
async def pose_stream(websocket: WebSocket):

    await websocket.accept()

    print("🟢 Pose WebSocket connected")

    try:

        while True:

            # ------------------------------------------------
            # Receive frame from React
            # ------------------------------------------------

            data = await websocket.receive_text()


            # ------------------------------------------------
            # Remove data URL prefix
            # ------------------------------------------------

            if "," in data:

                data = data.split(",", 1)[1]


            # ------------------------------------------------
            # Base64 → bytes
            # ------------------------------------------------

            image_bytes = base64.b64decode(
                data
            )


            # ------------------------------------------------
            # bytes → numpy
            # ------------------------------------------------

            np_array = np.frombuffer(
                image_bytes,
                dtype=np.uint8
            )


            # ------------------------------------------------
            # Decode JPEG
            # ------------------------------------------------

            frame = cv2.imdecode(
                np_array,
                cv2.IMREAD_COLOR
            )


            if frame is None:

                await websocket.send_json({

                    "success": False,

                    "message": "Invalid image"
                })

                continue


            # ------------------------------------------------
            # BGR → RGB
            # ------------------------------------------------

            rgb = cv2.cvtColor(
                frame,
                cv2.COLOR_BGR2RGB
            )


            # ------------------------------------------------
            # MediaPipe Image
            # ------------------------------------------------

            mp_image = __import__(
                "mediapipe"
            ).Image(

                image_format=(
                    __import__(
                        "mediapipe"
                    ).ImageFormat.SRGB
                ),

                data=rgb
            )


            # ------------------------------------------------
            # AI DETECTION
            # ------------------------------------------------

            result = pose_detector.detect(
                mp_image
            )


            # ------------------------------------------------
            # Send result to React
            # ------------------------------------------------

            await websocket.send_json({

                "success": True,

                "detected": result["detected"],

                "landmarks": result["landmarks"],

                "angles": result["angles"],

                "status": result["status"],

                "message": result["message"]
            })


    except WebSocketDisconnect:

        print(
            "🔴 Pose WebSocket disconnected"
        )


    except Exception as error:

        print(
            "❌ Pose WebSocket error:",
            error
        )

        try:

            await websocket.close()

        except Exception:

            pass