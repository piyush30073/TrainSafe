import base64
import cv2
import numpy as np

from fastapi import WebSocket, WebSocketDisconnect

from app.vision.pose_detector import PoseDetector


pose_detector = PoseDetector()


async def pose_stream(websocket: WebSocket):

    await websocket.accept()

    print("✅ Pose WebSocket connected")

    try:

        while True:

            data = await websocket.receive_text()

            if "," in data:
                data = data.split(",", 1)[1]

            image_bytes = base64.b64decode(data)

            np_array = np.frombuffer(
                image_bytes,
                dtype=np.uint8
            )

            frame = cv2.imdecode(
                np_array,
                cv2.IMREAD_COLOR
            )

            if frame is None:

                await websocket.send_json({
                    "success": False,
                    "error": "Invalid image frame"
                })

                continue

            result = pose_detector.detect(frame)

            await websocket.send_json({
                "success": True,
                "landmarks": result
            })

    except WebSocketDisconnect:

        print("❌ Pose WebSocket disconnected")

    except Exception as e:

        print("❌ Pose WebSocket error:", e)