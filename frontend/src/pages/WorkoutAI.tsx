import LivePoseCamera from "../components/ai/LivePoseCamera";

const WorkoutAI = () => {
  return (
    <div className="min-h-screen bg-slate-50">

      {/* ======================================================
          PAGE HEADER
      ======================================================= */}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            {/* Title */}

            <div>
              <div className="mb-2 flex items-center gap-2">

                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  TRAINSAFE AI
                </span>

                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                  ● LIVE ANALYSIS
                </span>

              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                AI Workout Analysis
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Train smarter with real-time computer vision.
                TrainSafe analyzes your body movement and
                provides instant posture and movement-risk
                feedback.
              </p>
            </div>

          </div>

        </div>
      </header>

      {/* ======================================================
          MAIN CONTENT
      ======================================================= */}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ====================================================
            INTRO / INSTRUCTIONS
        ===================================================== */}

        <section className="mb-8">

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">

            <div className="flex gap-4">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-lg text-white">
                🤖
              </div>

              <div>
                <h2 className="font-semibold text-blue-900">
                  How the AI analysis works
                </h2>

                <p className="mt-1 text-sm leading-6 text-blue-800">
                  Your camera captures your movement,
                  MediaPipe detects your body landmarks,
                  and TrainSafe evaluates movement patterns
                  to provide a prototype risk score and
                  corrective feedback.
                </p>
              </div>

            </div>

          </div>

        </section>

        {/* ====================================================
            CAMERA + AI
        ===================================================== */}

        <section>

          <LivePoseCamera />

        </section>

        {/* ====================================================
            HOW TO GET THE BEST RESULT
        ===================================================== */}

        <section className="mt-10">

          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-900">
              Get the best analysis
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Follow these steps before starting your workout.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {/* Card 1 */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-lg">
                📷
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                Position your camera
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Place your phone or laptop far enough away
                to keep your complete body visible.
              </p>

            </div>

            {/* Card 2 */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-lg">
                🧍
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                Keep your body visible
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Keep your head, shoulders, hips, knees
                and feet inside the camera frame.
              </p>

            </div>

            {/* Card 3 */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-lg">
                🏃
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                Move naturally
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Perform your exercise slowly and use
                controlled movements for better analysis.
              </p>

            </div>

            {/* Card 4 */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-lg">
                ⚠️
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                Follow feedback
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Use the AI feedback to identify movement
                deviations and improve your form.
              </p>

            </div>

          </div>

        </section>

        {/* ====================================================
            AI PIPELINE
        ===================================================== */}

        <section className="mt-10">

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-6">
              <h2 className="text-xl font-bold text-slate-900">
                TrainSafe AI Pipeline
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Real-time movement analysis from camera to
                actionable feedback.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-4">

              <div className="rounded-xl bg-slate-50 p-4 text-center">
                <div className="text-2xl">
                  📷
                </div>

                <div className="mt-2 font-semibold text-slate-900">
                  Camera
                </div>

                <div className="mt-1 text-xs text-slate-500">
                  Live video
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 text-center">
                <div className="text-2xl">
                  🧍
                </div>

                <div className="mt-2 font-semibold text-slate-900">
                  Pose Detection
                </div>

                <div className="mt-1 text-xs text-slate-500">
                  33 body landmarks
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 text-center">
                <div className="text-2xl">
                  📐
                </div>

                <div className="mt-2 font-semibold text-slate-900">
                  Movement Analysis
                </div>

                <div className="mt-1 text-xs text-slate-500">
                  Angles & posture
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 text-center">
                <div className="text-2xl">
                  🛡️
                </div>

                <div className="mt-2 font-semibold text-slate-900">
                  Risk Feedback
                </div>

                <div className="mt-1 text-xs text-slate-500">
                  Real-time guidance
                </div>
              </div>

            </div>

          </div>

        </section>

        {/* ====================================================
            DISCLAIMER
        ===================================================== */}

        <section className="mt-8">

          <div className="rounded-xl border border-slate-200 bg-white p-4">

            <p className="text-xs leading-5 text-slate-400">
              <span className="font-semibold text-slate-500">
                Prototype Notice:
              </span>{" "}
              TrainSafe's AI movement-risk score is a
              hackathon prototype based on computer-vision
              movement heuristics. It is intended for
              fitness guidance and demonstration purposes
              and should not be considered a medical
              diagnosis or substitute for professional
              medical advice.
            </p>

          </div>

        </section>

      </main>

    </div>
  );
};

export default WorkoutAI;