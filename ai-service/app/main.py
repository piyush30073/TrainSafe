from fastapi import FastAPI

from app.api.routes.health import router as health_router
from app.api.routes.pose import router as pose_router
from app.api.routes.analysis import router as analysis_router


app = FastAPI(
    title="TrainSafe AI Service",
    description="AI-powered injury prevention and movement analysis service",
    version="1.0.0",
)


app.include_router(health_router, prefix="/api")
app.include_router(pose_router, prefix="/api")
app.include_router(analysis_router, prefix="/api")


@app.get("/")
def root():
    return {
        "service": "TrainSafe AI Service",
        "status": "running",
        "version": "1.0.0",
    }