import { useCallback, useEffect, useRef, useState } from "react";
import { PoseSocket, type PoseAIResponse } from "../services/poseSocket";

const LivePoseCamera = () => {
  // =========================================================
  // REFS
  // =========================================================

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const poseSocketRef = useRef<PoseSocket | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const lastFrameTimeRef = useRef<number>(0);

  // Send approximately 10 FPS instead of every camera frame.
  const FRAME_INTERVAL = 100;

  // =========================================================
  // STATE
  // =========================================================

  const [cameraReady, setCameraReady] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [poseDetected, setPoseDetected] = useState(false);

  const [aiResponse, setAiResponse] =
    useState<PoseAIResponse | null>(null);

  const [error, setError] = useState<string | null>(null);

  // =========================================================
  // HANDLE AI RESPONSE
  // =========================================================

  const handleAIMessage = useCallback(
    (data: PoseAIResponse) => {
      console.log("🤖 AI response:", data);

      setAiResponse(data);

      if (data.landmarks && data.landmarks.length > 0) {
        setPoseDetected(true);
      } else {
        setPoseDetected(false);
      }
    },
    []
  );

  // =========================================================
  // START CAMERA
  // =========================================================

  const startCamera = useCallback(async () => {
    try {
      setError(null);

      console.log("📷 Starting camera...");

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error(
          "Camera access is not supported by this browser."
        );
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: {
              ideal: 640,
            },
            height: {
              ideal: 480,
            },
            frameRate: {
              ideal: 15,
              max: 20,
            },
          },
          audio: false,
        });

      streamRef.current = stream;

      const video = videoRef.current;

      if (!video) {
        throw new Error("Video element not available.");
      }

      video.srcObject = stream;

      video.setAttribute("playsinline", "true");
      video.setAttribute("autoplay", "true");
      video.muted = true;

      await video.play();

      setCameraReady(true);

      console.log("📷 Camera started");
    } catch (err) {
      console.error(
        "❌ Camera error:",
        err
      );

      setCameraReady(false);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to access camera."
      );
    }
  }, []);

  // =========================================================
  // CONNECT AI WEBSOCKET
  // =========================================================

  const connectAI = useCallback(() => {
    console.log(
      "🔌 Connecting to TrainSafe AI..."
    );

    const poseSocket = new PoseSocket();

    poseSocketRef.current = poseSocket;

    poseSocket.connect(
      // =====================================================
      // MESSAGE
      // =====================================================

      (data) => {
        handleAIMessage(data);
      },

      // =====================================================
      // ERROR
      // =====================================================

      (event) => {
        console.error(
          "❌ AI WebSocket error:",
          event
        );

        setWsConnected(false);

        setError(
          "Unable to connect to TrainSafe AI."
        );
      },

      // =====================================================
      // DISCONNECT
      // =====================================================

      () => {
        console.log(
          "🔌 AI WebSocket disconnected"
        );

        setWsConnected(false);
      },

      // =====================================================
      // CONNECTED
      // =====================================================

      () => {
        console.log(
          "✅ AI WebSocket connected"
        );

        setWsConnected(true);

        setError(null);
      }
    );
  }, [handleAIMessage]);

  // =========================================================
  // CAPTURE + SEND FRAME
  // =========================================================

  const sendFrame = useCallback(
    (timestamp: number) => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const socket = poseSocketRef.current;

      if (
        !video ||
        !canvas ||
        !socket
      ) {
        animationFrameRef.current =
          requestAnimationFrame(sendFrame);

        return;
      }

      // Keep frame rate controlled.
      if (
        timestamp - lastFrameTimeRef.current <
        FRAME_INTERVAL
      ) {
        animationFrameRef.current =
          requestAnimationFrame(sendFrame);

        return;
      }

      lastFrameTimeRef.current = timestamp;

      // Only send when everything is ready.
      if (
        video.readyState >=
          HTMLMediaElement.HAVE_CURRENT_DATA &&
        socket.isConnected()
      ) {
        const width = 640;
        const height = 480;

        canvas.width = width;
        canvas.height = height;

        const context =
          canvas.getContext("2d");

        if (context) {
          context.drawImage(
            video,
            0,
            0,
            width,
            height
          );

          // Compress the image before sending.
          const image =
            canvas.toDataURL(
              "image/jpeg",
              0.6
            );

          socket.sendFrame(image);
        }
      }

      animationFrameRef.current =
        requestAnimationFrame(sendFrame);
    },
    []
  );

  // =========================================================
  // INITIALIZE
  // =========================================================

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      if (!mounted) {
        return;
      }

      await startCamera();

      if (!mounted) {
        return;
      }

      connectAI();
    };

    initialize();

    return () => {
      mounted = false;

      // Stop animation
      if (
        animationFrameRef.current !== null
      ) {
        cancelAnimationFrame(
          animationFrameRef.current
        );

        animationFrameRef.current = null;
      }

      // Disconnect WebSocket
      if (poseSocketRef.current) {
        poseSocketRef.current.disconnect();
        poseSocketRef.current = null;
      }

      // Stop camera
      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => {
            track.stop();
          });

        streamRef.current = null;
      }

      setCameraReady(false);
      setWsConnected(false);
      setPoseDetected(false);
    };
  }, [startCamera, connectAI]);

  // =========================================================
  // START FRAME LOOP AFTER CAMERA
  // =========================================================

  useEffect(() => {
    if (!cameraReady) {
      return;
    }

    console.log(
      "🎥 Starting AI frame stream..."
    );

    animationFrameRef.current =
      requestAnimationFrame(sendFrame);

    return () => {
      if (
        animationFrameRef.current !== null
      ) {
        cancelAnimationFrame(
          animationFrameRef.current
        );

        animationFrameRef.current = null;
      }
    };
  }, [cameraReady, sendFrame]);

  // =========================================================
  // RISK INFORMATION
  // =========================================================

  const risk = aiResponse?.risk ?? 0;

  const riskLevel =
    aiResponse?.risk_level ?? "UNKNOWN";

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="w-full max-w-5xl mx-auto">

      {/* =====================================================
          CAMERA
      ===================================================== */}

      <div className="relative overflow-hidden rounded-2xl bg-black shadow-lg">

        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full aspect-video object-cover"
        />

        {/* Hidden canvas used for frame capture */}
        <canvas
          ref={canvasRef}
          className="hidden"
        />

        {/* Camera status */}
        <div className="absolute top-4 left-4">
          <div className="rounded-full bg-black/70 px-4 py-2 text-sm text-white backdrop-blur">
            {cameraReady ? (
              <span className="text-green-400">
                ● Camera Ready
              </span>
            ) : (
              <span className="text-red-400">
                ● Camera Not Ready
              </span>
            )}
          </div>
        </div>

        {/* WebSocket status */}
        <div className="absolute top-4 right-4">
          <div className="rounded-full bg-black/70 px-4 py-2 text-sm text-white backdrop-blur">
            {wsConnected ? (
              <span className="text-green-400">
                ● AI Connected
              </span>
            ) : (
              <span className="text-red-400">
                ● AI Disconnected
              </span>
            )}
          </div>
        </div>
      </div>

      {/* =====================================================
          DETECTION STATUS
      ===================================================== */}

      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm border border-slate-200">

        <h2 className="text-xl font-bold text-slate-900">
          Detection Status
        </h2>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">

          {/* Camera */}
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">
              Camera
            </p>

            <p className="mt-1 font-semibold">
              {cameraReady ? (
                <span className="text-green-600">
                  Ready
                </span>
              ) : (
                <span className="text-red-600">
                  Not Ready
                </span>
              )}
            </p>
          </div>

          {/* WebSocket */}
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">
              WebSocket
            </p>

            <p className="mt-1 font-semibold">
              {wsConnected ? (
                <span className="text-green-600">
                  Connected
                </span>
              ) : (
                <span className="text-red-600">
                  Disconnected
                </span>
              )}
            </p>
          </div>

          {/* Pose */}
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-500">
              Pose
            </p>

            <p className="mt-1 font-semibold">
              {poseDetected ? (
                <span className="text-green-600">
                  Detected
                </span>
              ) : (
                <span className="text-amber-600">
                  Searching...
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="font-semibold text-red-700">
            TrainSafe AI Error
          </p>

          <p className="mt-1 text-sm text-red-600">
            {error}
          </p>
        </div>
      )}

      {/* =====================================================
          RISK CARD
      ===================================================== */}

      {aiResponse && (
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm border border-slate-200">

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Injury Risk
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Real-time movement analysis
              </p>
            </div>

            <div className="text-right">
              <p className="text-3xl font-bold text-slate-900">
                {risk}
              </p>

              <p className="text-sm font-semibold uppercase text-slate-500">
                {riskLevel}
              </p>
            </div>
          </div>

          {/* Risk progress bar */}
          <div className="mt-5">
            <div className="h-3 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-300"
                style={{
                  width: `${Math.min(
                    Math.max(risk, 0),
                    100
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Feedback */}
          {aiResponse.feedback && (
            <div className="mt-5 rounded-xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-700">
                Feedback
              </p>

              <p className="mt-1 text-sm text-slate-600">
                {aiResponse.feedback}
              </p>
            </div>
          )}

          {/* Recommendation */}
          {aiResponse.recommendation && (
            <div className="mt-4 rounded-xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-700">
                Recommendation
              </p>

              <p className="mt-1 text-sm text-slate-600">
                {aiResponse.recommendation}
              </p>
            </div>
          )}

          {/* AI message */}
          {aiResponse.message && (
            <p className="mt-4 text-sm text-slate-500">
              {aiResponse.message}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default LivePoseCamera;