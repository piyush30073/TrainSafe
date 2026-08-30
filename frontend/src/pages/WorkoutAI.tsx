import LivePoseCamera from "../components/ai/LivePoseCamera";

const WorkoutAI = () => {
  return (
    <div className="min-h-screen bg-slate-50">

      <div className="p-6">

        <h1 className="text-3xl font-bold text-slate-900">
          AI Workout Analysis
        </h1>

        <p className="mt-2 text-slate-500">
          Turn on your camera and perform your exercise.
          TrainSafe AI will analyze your posture in real time.
        </p>

        <div className="mt-6">
          <LivePoseCamera />
        </div>

      </div>

    </div>
  );
};

export default WorkoutAI;