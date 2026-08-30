from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.pose import router as pose_router


app = FastAPI(
    title="TrainSafe AI Service",
    version="1.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(

    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# ============================================================
# ROUTES
# ============================================================

app.include_router(
    pose_router
)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
async def root():

    return {
        "success": True,
        "service": "TrainSafe AI",
        "status": "running"
    }


@app.get("/health")
async def health():

    return {
        "success": True,
        "status": "healthy"
    }