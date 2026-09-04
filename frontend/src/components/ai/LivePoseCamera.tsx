import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  PoseSocket,
  type PoseAIResponse,
} from "../../services/poseSocket";

interface Landmark {
  id?: number;
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

const VIDEO_WIDTH = 640;
const VIDEO_HEIGHT = 480;

// 10 FPS
const SEND_INTERVAL = 100;

const LivePoseCamera = () => {
  // ============================================================
  // REFS
  // ============================================================

  const videoRef =
    useRef<HTMLVideoElement | null>(null);

  const canvasRef =
    useRef<HTMLCanvasElement | null>(null);

  const socketRef =
    useRef<PoseSocket | null>(null);

  const streamRef =
    useRef<MediaStream | null>(null);

  const frameTimerRef =
    useRef<number | null>(null);

  const isRunningRef =
    useRef(false);

  // ============================================================
  // STATE
  // ============================================================

  const [connected, setConnected] =
    useState(false);

  const [cameraStarted, setCameraStarted] =
    useState(false);

  const [landmarks, setLandmarks] =
    useState<Landmark[]>([]);

  const [risk, setRisk] =
    useState<number | null>(null);

  const [riskLevel, setRiskLevel] =
    useState("Waiting");

  const [feedback, setFeedback] =
    useState(
      "Position yourself in front of the camera."
    );

  const [error, setError] =
    useState("");

  // ============================================================
  // DRAW POSE
  // ============================================================

  const drawPose = useCallback(
    (points: Landmark[]) => {
      const canvas =
        canvasRef.current;

      if (!canvas) return;

      const ctx =
        canvas.getContext("2d");

      if (!ctx) return;

      ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
      );

      if (
        !points ||
        points.length === 0
      ) {
        return;
      }

      // MediaPipe 33-point connections
      const connections: [
        number,
        number
      ][] = [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 7],

        [0, 4],
        [4, 5],
        [5, 6],
        [6, 8],

        [9, 10],

        [11, 12],

        [11, 13],
        [13, 15],

        [12, 14],
        [14, 16],

        [11, 23],
        [12, 24],

        [23, 24],

        [23, 25],
        [25, 27],
        [27, 29],
        [29, 31],

        [24, 26],
        [26, 28],
        [28, 30],
        [30, 32],

        [27, 31],
        [28, 32],
      ];

      // ========================================================
      // DRAW SKELETON
      // ========================================================

      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.strokeStyle = "#22c55e";

      connections.forEach(
        ([start, end]) => {
          const a = points[start];
          const b = points[end];

          if (!a || !b) {
            return;
          }

          if (
            a.visibility !== undefined &&
            a.visibility < 0.4
          ) {
            return;
          }

          if (
            b.visibility !== undefined &&
            b.visibility < 0.4
          ) {
            return;
          }

          const ax =
            a.x * canvas.width;

          const ay =
            a.y * canvas.height;

          const bx =
            b.x * canvas.width;

          const by =
            b.y * canvas.height;

          ctx.beginPath();

          ctx.moveTo(
            ax,
            ay
          );

          ctx.lineTo(
            bx,
            by
          );

          ctx.stroke();
        }
      );

      // ========================================================
      // DRAW JOINTS
      // ========================================================

      points.forEach(
        (point) => {
          if (!point) return;

          if (
            point.visibility !== undefined &&
            point.visibility < 0.4
          ) {
            return;
          }

          const x =
            point.x * canvas.width;

          const y =
            point.y * canvas.height;

          ctx.beginPath();

          ctx.arc(
            x,
            y,
            5,
            0,
            Math.PI * 2
          );

          ctx.fillStyle = "#ffffff";
          ctx.fill();

          ctx.lineWidth = 2;
          ctx.strokeStyle =
            "#22c55e";

          ctx.stroke();
        }
      );
    },
    []
  );

  // ============================================================
  // HANDLE AI RESPONSE
  // ============================================================

  const handleAIResponse =
    useCallback(
      (data: PoseAIResponse) => {
        console.log(
          "🤖 TrainSafe AI:",
          data
        );

        // ======================================================
        // LANDMARKS
        // ======================================================

        if (
          Array.isArray(
            data.landmarks
          )
        ) {
          setLandmarks(
            data.landmarks
          );

          drawPose(
            data.landmarks
          );
        }

        // ======================================================
        // RISK
        // ======================================================

        if (
          typeof data.risk ===
          "number"
        ) {
          setRisk(data.risk);
        }

        // ======================================================
        // RISK LEVEL
        // ======================================================

        if (
          typeof data.risk_level ===
          "string"
        ) {
          setRiskLevel(
            data.risk_level
          );
        }

        // ======================================================
        // FEEDBACK
        // ======================================================

        if (
          typeof data.feedback ===
          "string"
        ) {
          setFeedback(
            data.feedback
          );
        } else if (
          typeof data.recommendation ===
          "string"
        ) {
          setFeedback(
            data.recommendation
          );
        } else if (
          typeof data.message ===
          "string"
        ) {
          setFeedback(
            data.message
          );
        }
      },
      [drawPose]
    );

  // ============================================================
  // CONNECT AI
  // ============================================================

  const connectAI =
    useCallback(() => {
      console.log(
        "🔌 Connecting to TrainSafe AI..."
      );

      const socket =
        new PoseSocket();

      socketRef.current =
        socket;

      socket.connect(
        // ======================================================
        // MESSAGE
        // ======================================================

        handleAIResponse,

        // ======================================================
        // ERROR
        // ======================================================

        (socketError) => {
          console.error(
            "❌ AI WebSocket error:",
            socketError
          );

          setConnected(false);

          setError(
            "Unable to connect to TrainSafe AI."
          );
        },

        // ======================================================
        // DISCONNECT
        // ======================================================

        () => {
          console.log(
            "🔌 AI WebSocket disconnected"
          );

          setConnected(false);
        },

        // ======================================================
        // CONNECTED
        // ======================================================

        () => {
          console.log(
            "✅ AI WebSocket connected"
          );

          setConnected(true);

          setError("");

          // IMPORTANT:
          // Start sending frames ONLY
          // after the socket actually opens.

          startFrameLoop();
        }
      );
    }, [
      handleAIResponse,
    ]);

  // ============================================================
  // FRAME LOOP
  // ============================================================

  const startFrameLoop =
    useCallback(() => {
      if (
        isRunningRef.current
      ) {
        return;
      }

      const canvas =
        canvasRef.current;

      const video =
        videoRef.current;

      if (
        !canvas ||
        !video
      ) {
        console.error(
          "❌ Canvas or video not found."
        );

        return;
      }

      const ctx =
        canvas.getContext("2d");

      if (!ctx) {
        console.error(
          "❌ Canvas context unavailable."
        );

        return;
      }

      canvas.width =
        VIDEO_WIDTH;

      canvas.height =
        VIDEO_HEIGHT;

      isRunningRef.current =
        true;

      console.log(
        "🎥 AI frame stream started"
      );

      const sendFrame =
        () => {
          if (
            !isRunningRef.current
          ) {
            return;
          }

          // ====================================================
          // MAKE SURE SOCKET IS CONNECTED
          // ====================================================

          if (
            !socketRef.current ||
            !socketRef.current.isConnected()
          ) {
            console.warn(
              "⚠️ AI socket not connected yet"
            );

            frameTimerRef.current =
              window.setTimeout(
                sendFrame,
                SEND_INTERVAL
              );

            return;
          }

          // ====================================================
          // MAKE SURE VIDEO IS READY
          // ====================================================

          if (
            video.readyState >=
            HTMLMediaElement.HAVE_CURRENT_DATA
          ) {
            ctx.drawImage(
              video,
              0,
              0,
              VIDEO_WIDTH,
              VIDEO_HEIGHT
            );

            // ==================================================
            // JPEG COMPRESSION
            // ==================================================

            const image =
              canvas.toDataURL(
                "image/jpeg",
                0.6
              );

            // ==================================================
            // SEND TO AI
            // ==================================================

            socketRef.current.sendFrame(
              image
            );
          }

          frameTimerRef.current =
            window.setTimeout(
              sendFrame,
              SEND_INTERVAL
            );
        };

      sendFrame();
    }, []);

  // ============================================================
  // START CAMERA
  // ============================================================

  const startCamera =
    useCallback(
      async () => {
        try {
          setError("");

          console.log(
            "📷 Starting camera..."
          );

          if (
            !navigator.mediaDevices?.getUserMedia
          ) {
            throw new Error(
              "Camera access is not supported by this browser."
            );
          }

          const stream =
            await navigator.mediaDevices.getUserMedia(
              {
                video: {
                  width: {
                    ideal: VIDEO_WIDTH,
                  },

                  height: {
                    ideal: VIDEO_HEIGHT,
                  },

                  frameRate: {
                    ideal: 15,
                    max: 20,
                  },

                  facingMode:
                    "user",
                },

                audio: false,
              }
            );

          streamRef.current =
            stream;

          const video =
            videoRef.current;

          if (!video) {
            throw new Error(
              "Video element not available."
            );
          }

          video.srcObject =
            stream;

          video.muted =
            true;

          video.playsInline =
            true;

          await video.play();

          setCameraStarted(
            true
          );

          console.log(
            "📷 Camera started"
          );

          // ======================================================
          // CONNECT AFTER CAMERA READY
          // ======================================================

          connectAI();

        } catch (err) {
          console.error(
            "❌ Camera error:",
            err
          );

          setError(
            err instanceof Error
              ? err.message
              : "Camera permission was denied or camera is unavailable."
          );
        }
      },
      [connectAI]
    );

  // ============================================================
  // STOP CAMERA
  // ============================================================

  const stopCamera =
    useCallback(() => {
      console.log(
        "🛑 Stopping AI scan..."
      );

      isRunningRef.current =
        false;

      // Stop frame timer
      if (
        frameTimerRef.current !==
        null
      ) {
        window.clearTimeout(
          frameTimerRef.current
        );

        frameTimerRef.current =
          null;
      }

      // Stop camera
      if (
        streamRef.current
      ) {
        streamRef.current
          .getTracks()
          .forEach(
            (track) => {
              track.stop();
            }
          );

        streamRef.current =
          null;
      }

      // Close WebSocket
      if (
        socketRef.current
      ) {
        socketRef.current.disconnect();

        socketRef.current =
          null;
      }

      setConnected(false);

      setCameraStarted(false);

      setLandmarks([]);

      setRisk(null);

      setRiskLevel(
        "Waiting"
      );

      setFeedback(
        "Position yourself in front of the camera."
      );

      const canvas =
        canvasRef.current;

      const ctx =
        canvas?.getContext("2d");

      if (
        canvas &&
        ctx
      ) {
        ctx.clearRect(
          0,
          0,
          canvas.width,
          canvas.height
        );
      }
    }, []);

  // ============================================================
  // INITIALIZE
  // ============================================================

  useEffect(() => {
    startCamera();

    return () => {
      stopCamera();
    };
  }, [
    startCamera,
    stopCamera,
  ]);

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="w-full max-w-5xl mx-auto">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="mb-6">

        <div className="flex items-center justify-between">

          <div>
            <p className="text-sm font-semibold text-emerald-600">
              TrainSafe AI
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              AI Posture Analysis
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Perform your exercise in front of
              the camera and TrainSafe will
              analyze your movement.
            </p>
          </div>

          <div
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              connected
                ? "bg-emerald-50 text-emerald-600"
                : "bg-red-50 text-red-500"
            }`}
          >
            {connected
              ? "● AI Connected"
              : "● AI Disconnected"}
          </div>

        </div>
      </div>

      {/* ======================================================
          CAMERA + PANEL
      ====================================================== */}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">

        {/* CAMERA */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-sm">

          <div
            className="relative"
            style={{
              width: "100%",
              aspectRatio: "4 / 3",
            }}
          >

            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 h-full w-full object-cover"
            />

            <canvas
              ref={canvasRef}
              width={VIDEO_WIDTH}
              height={VIDEO_HEIGHT}
              className="absolute inset-0 h-full w-full object-cover"
            />

            {!cameraStarted && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80">

                <div className="text-center text-white">

                  <div className="text-lg font-semibold">
                    Starting camera...
                  </div>

                  <div className="mt-1 text-sm text-slate-400">
                    Please allow camera access.
                  </div>

                </div>

              </div>
            )}

          </div>
        </div>

        {/* ==================================================
            AI PANEL
        ================================================== */}

        <div className="space-y-4">

          {/* AI STATUS */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <h2 className="font-bold text-slate-900">
                AI Detection
              </h2>

              <div
                className={`h-3 w-3 rounded-full ${
                  connected
                    ? "bg-emerald-500"
                    : "bg-red-500"
                }`}
              />

            </div>

            <div className="mt-5">

              <p className="text-sm text-slate-500">
                Landmarks detected
              </p>

              <p className="mt-1 text-4xl font-bold text-slate-900">
                {landmarks.length}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Expected: up to 33 pose points
              </p>

            </div>
          </div>

          {/* ==================================================
              RISK
          ================================================== */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <p className="text-sm font-medium text-slate-500">
              Injury Risk
            </p>

            <div className="mt-2 flex items-end gap-2">

              <span className="text-4xl font-bold text-slate-900">
                {risk !== null
                  ? `${risk}%`
                  : "--"}
              </span>

              <span className="mb-1 text-sm font-semibold text-emerald-600">
                {riskLevel}
              </span>

            </div>

            {risk !== null && (
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">

                <div
                  className="h-full rounded-full bg-emerald-500 transition-all"
                  style={{
                    width: `${Math.min(
                      Math.max(
                        risk,
                        0
                      ),
                      100
                    )}%`,
                  }}
                />

              </div>
            )}

          </div>

          {/* ==================================================
              FEEDBACK
          ================================================== */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <p className="text-sm font-medium text-slate-500">
              AI Feedback
            </p>

            <p className="mt-3 text-sm leading-6 text-slate-700">
              {feedback}
            </p>

          </div>

          {/* ==================================================
              DETECTION STATUS
          ================================================== */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <p className="text-sm font-medium text-slate-500">
              Detection Status
            </p>

            <div className="mt-3 space-y-2 text-sm">

              <div className="flex justify-between">

                <span className="text-slate-500">
                  Camera
                </span>

                <span className="font-semibold">
                  {cameraStarted
                    ? "Ready"
                    : "Off"}
                </span>

              </div>

              <div className="flex justify-between">

                <span className="text-slate-500">
                  WebSocket
                </span>

                <span
                  className={
                    connected
                      ? "font-semibold text-emerald-600"
                      : "font-semibold text-red-500"
                  }
                >
                  {connected
                    ? "Connected"
                    : "Disconnected"}
                </span>

              </div>

              <div className="flex justify-between">

                <span className="text-slate-500">
                  Pose
                </span>

                <span
                  className={
                    landmarks.length > 0
                      ? "font-semibold text-emerald-600"
                      : "font-semibold text-amber-500"
                  }
                >
                  {landmarks.length > 0
                    ? "Detected"
                    : "Searching..."}
                </span>

              </div>

            </div>
          </div>

          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* ==================================================
              STOP
          ================================================== */}

          {cameraStarted && (
            <button
              type="button"
              onClick={stopCamera}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Stop AI Scan
            </button>
          )}

        </div>
      </div>
    </div>
  );
};

export default LivePoseCamera;