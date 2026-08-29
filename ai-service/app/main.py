from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(
    title="TrainSafe AI Service",
    version="1.0.0"
)


# ==========================================
# CORS
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# ROOT
# ==========================================

@app.get("/")
async def root():
    return {
        "success": True,
        "service": "TrainSafe AI Service",
        "status": "running"
    }


# ==========================================
# HEALTH CHECK
# ==========================================

@app.get("/health")
async def health():
    return {
        "success": True,
        "status": "healthy"
    }


# ==========================================
# WEBSOCKET TEST
# ==========================================

@app.websocket("/ws/pose")
async def websocket_pose(websocket: WebSocket):

    print("🔵 WebSocket request received")

    await websocket.accept()

    print("🟢 WebSocket ACCEPTED")

    try:

        while True:

            data = await websocket.receive_text()

            print(
                "📥 Received:",
                len(data),
                "characters"
            )

            await websocket.send_json({
                "success": True,
                "message": "WebSocket working",
                "received": len(data)
            })

    except Exception as e:

        print("🔴 WebSocket closed:", e)