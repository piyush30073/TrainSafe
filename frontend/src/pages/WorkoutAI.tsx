import LivePoseCamera from "../components/ai/LivePoseCamera";

const WorkoutAI = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-6xl">

        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          TrainSafe AI Form Analysis
        </h1>

        <p className="mb-6 text-gray-600">
          Turn on your camera and perform your exercise.
          TrainSafe AI will analyze your movement in real time.
        </p>

        <div className="rounded-2xl bg-white p-6 shadow">

          <LivePoseCamera />

        </div>

      </div>
    </div>
  );
};

export default WorkoutAI;