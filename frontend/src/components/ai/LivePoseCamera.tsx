import { useCallback, useEffect, useRef, useState } from "react";
import { PoseSocket } from "../../services/poseSocket";
import type { PoseAIResponse } from "../../services/poseSocket";
const VIDEO_WIDTH = 640;
const VIDEO_HEIGHT = 480;

// 5 FPS - better for mobile and Render
const SEND_INTERVAL = 200;

interface Landmark {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

const LivePoseCamera = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const socketRef = useRef<PoseSocket | null>(null);

  const frameTimerRef = useRef<number | null>(null);

  const mountedRef = useRef(false);
  const startingRef = useRef(false);

  const [cameraStarted, setCameraStarted] = useState(false);
  const [connected, setConnected] = useState(false);

  const [landmarks, setLandmarks] = useState<Landmark[]>([]);

  const [risk, setRisk] = useState<number | null>(null);
  const [riskLevel, setRiskLevel] = useState("WAITING");

  const [feedback, setFeedback] = useState(
    "Start your camera to begin AI analysis."
  );

  const [recommendation, setRecommendation] = useState("");

  const [warnings, setWarnings] = useState<string[]>([]);

  const [error, setError] = useState("");

  // ============================================================
  // STOP FRAME LOOP
  // ============================================================

  const stopFrameLoop = useCallback(() => {
    if (frameTimerRef.current !== null) {
      window.clearTimeout(frameTimerRef.current);
      frameTimerRef.current = null;
    }
  }, []);

  // ============================================================
  // HANDLE AI RESPONSE
  // ============================================================

  const handleAIResponse = useCallback(
    (data: PoseAIResponse) => {
      if (!mountedRef.current) {
        return;
      }

      console.log("📥 RECEIVED FROM AI:", data);

      // Pose landmarks
      if (Array.isArray(data.landmarks)) {
        setLandmarks(data.landmarks);
      }

      // Risk
      if (typeof data.risk === "number") {
        const value = Math.round(data.risk);

        setRisk(value);

        console.log(
          `🚨 INJURY RISK = ${value}%`
        );
      }

      // Risk level
      if (typeof data.risk_level === "string") {
        setRiskLevel(data.risk_level);
      }

      // Feedback
      if (
        typeof data.feedback === "string" &&
        data.feedback.trim()
      ) {
        setFeedback(data.feedback);
      }

      // Recommendation
      if (
        typeof data.recommendation === "string" &&
        data.recommendation.trim()
      ) {
        setRecommendation(data.recommendation);
      }

      // Warnings
      if (Array.isArray(data.warnings)) {
        setWarnings(data.warnings);
      }

      // No pose
      if (data.detected === false) {
        setFeedback(
          "No pose detected. Keep your full body inside the frame."
        );
      }

      // Backend error
      if (data.success === false) {
        setError(
          data.message || "AI processing failed."
        );
      } else {
        setError("");
      }
    },
    []
  );

  // ============================================================
  // SEND ONE FRAME
  // ============================================================

  const sendFrame = useCallback(() => {
    if (!mountedRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const socket = socketRef.current;

    if (!video || !canvas || !socket) {
      return;
    }

    if (!socket.isConnected()) {
      return;
    }

    if (
      video.readyState <
      HTMLMediaElement.HAVE_CURRENT_DATA
    ) {
      frameTimerRef.current = window.setTimeout(
        sendFrame,
        SEND_INTERVAL
      );

      return;
    }

    if (
      video.videoWidth === 0 ||
      video.videoHeight === 0
    ) {
      frameTimerRef.current = window.setTimeout(
        sendFrame,
        SEND_INTERVAL
      );

      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    canvas.width = VIDEO_WIDTH;
    canvas.height = VIDEO_HEIGHT;

    context.drawImage(
      video,
      0,
      0,
      VIDEO_WIDTH,
      VIDEO_HEIGHT
    );

    const image = canvas.toDataURL(
      "image/jpeg",
      0.55
    );

    socket.sendFrame(image);

    frameTimerRef.current = window.setTimeout(
      sendFrame,
      SEND_INTERVAL
    );
  }, []);

  // ============================================================
  // START FRAME LOOP
  // ============================================================

  const startFrameLoop = useCallback(() => {
    stopFrameLoop();

    console.log(
      "📡 Starting AI frame stream..."
    );

    sendFrame();
  }, [sendFrame, stopFrameLoop]);

  // ============================================================
  // START CAMERA
  // ============================================================

  const startCamera = useCallback(async () => {
    if (startingRef.current) {
      return;
    }

    if (streamRef.current) {
      return;
    }

    startingRef.current = true;

    try {
      setError("");
      setRisk(null);
      setRiskLevel("WAITING");
      setLandmarks([]);
      setWarnings([]);
      setRecommendation("");

      setFeedback(
        "Requesting camera permission..."
      );

      console.log(
        "📷 Requesting camera permission..."
      );

      // --------------------------------------------------------
      // Camera permission
      // --------------------------------------------------------

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: {
              ideal: VIDEO_WIDTH,
            },
            height: {
              ideal: VIDEO_HEIGHT,
            },
          },
          audio: false,
        });

      if (!mountedRef.current) {
        stream
          .getTracks()
          .forEach((track) => track.stop());

        return;
      }

      streamRef.current = stream;

      const video = videoRef.current;

      if (!video) {
        stream
          .getTracks()
          .forEach((track) => track.stop());

        streamRef.current = null;

        throw new Error(
          "Video element not found."
        );
      }

      // --------------------------------------------------------
      // Mobile-safe settings
      // --------------------------------------------------------

      video.muted = true;
      video.autoplay = true;
      video.playsInline = true;

      video.setAttribute(
        "autoplay",
        ""
      );

      video.setAttribute(
        "muted",
        ""
      );

      video.setAttribute(
        "playsinline",
        ""
      );

      // Attach stream
      video.srcObject = stream;

      console.log(
        "📷 Camera stream attached"
      );

      // --------------------------------------------------------
      // Wait for metadata
      // --------------------------------------------------------

      await new Promise<void>((resolve) => {
        if (
          video.readyState >=
          HTMLMediaElement.HAVE_METADATA
        ) {
          resolve();
          return;
        }

        const onMetadata = () => {
          video.removeEventListener(
            "loadedmetadata",
            onMetadata
          );

          resolve();
        };

        video.addEventListener(
          "loadedmetadata",
          onMetadata
        );
      });

      if (!mountedRef.current) {
        return;
      }

      // --------------------------------------------------------
      // Start video
      // --------------------------------------------------------

      try {
        await video.play();

        console.log(
          "▶️ Camera video started"
        );
      } catch (playError) {
        if (
          playError instanceof DOMException &&
          playError.name === "AbortError"
        ) {
          console.log(
            "📷 play() interrupted. Retrying..."
          );

          await new Promise<void>((resolve) => {
            window.setTimeout(
              resolve,
              300
            );
          });

          if (
            mountedRef.current &&
            video.srcObject
          ) {
            await video.play();

            console.log(
              "▶️ Camera started after retry"
            );
          }
        } else {
          throw playError;
        }
      }

      if (!mountedRef.current) {
        return;
      }

      setCameraStarted(true);

      setFeedback(
        "Camera ready. Connecting to TrainSafe AI..."
      );

      console.log(
        "📷 Camera started"
      );

      // --------------------------------------------------------
      // WebSocket
      // --------------------------------------------------------

      const socket = new PoseSocket();

      socketRef.current = socket;

      socket.connect(
        // ======================================================
        // MESSAGE
        // ======================================================

        (data: PoseAIResponse) => {
          handleAIResponse(data);
        },

        // ======================================================
        // ERROR
        // ======================================================

        (socketError: Event) => {
          console.error(
            "❌ AI WebSocket error:",
            socketError
          );

          if (!mountedRef.current) {
            return;
          }

          setConnected(false);

          setError(
            "Unable to connect to TrainSafe AI."
          );

          setFeedback(
            "AI connection error."
          );

          stopFrameLoop();
        },

        // ======================================================
        // DISCONNECT
        // ======================================================

        () => {
          console.log(
            "🔴 AI WebSocket disconnected"
          );

          if (!mountedRef.current) {
            return;
          }

          setConnected(false);

          setFeedback(
            "AI connection disconnected."
          );

          stopFrameLoop();
        },

        // ======================================================
        // CONNECTED
        // ======================================================

        () => {
          console.log(
            "🟢 AI WebSocket connected successfully"
          );

          if (!mountedRef.current) {
            return;
          }

          setConnected(true);

          setError("");

          setFeedback(
            "AI connected. Analyzing your movement..."
          );

          // Start frames ONLY after WebSocket OPEN
          startFrameLoop();
        }
      );
    } catch (cameraError) {
      console.error(
        "❌ Camera initialization failed:",
        cameraError
      );

      if (!mountedRef.current) {
        return;
      }

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop());

        streamRef.current = null;
      }

      setCameraStarted(false);

      if (
        cameraError instanceof DOMException
      ) {
        if (
          cameraError.name ===
          "NotAllowedError"
        ) {
          setError(
            "Camera permission denied. Please allow camera access."
          );
        } else if (
          cameraError.name ===
          "NotFoundError"
        ) {
          setError(
            "No camera was found on this device."
          );
        } else if (
          cameraError.name ===
          "NotReadableError"
        ) {
          setError(
            "Camera is being used by another application."
          );
        } else {
          setError(
            "Unable to start camera."
          );
        }
      } else {
        setError(
          "Unable to start camera."
        );
      }

      setFeedback(
        "Camera could not be started."
      );
    } finally {
      startingRef.current = false;
    }
  }, [
    handleAIResponse,
    startFrameLoop,
    stopFrameLoop,
  ]);

  // ============================================================
  // STOP CAMERA
  // ============================================================

  const stopCamera = useCallback(() => {
    console.log(
      "🛑 Stopping TrainSafe AI..."
    );

    stopFrameLoop();

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => track.stop());

      streamRef.current = null;
    }

    const video = videoRef.current;

    if (video) {
      video.pause();
      video.srcObject = null;
    }

    setCameraStarted(false);
    setConnected(false);

    setRisk(null);
    setRiskLevel("WAITING");

    setLandmarks([]);
    setWarnings([]);
    setRecommendation("");

    setFeedback(
      "Start your camera to begin AI analysis."
    );

    setError("");
  }, [stopFrameLoop]);

  // ============================================================
  // COMPONENT CLEANUP
  // ============================================================

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      stopFrameLoop();

      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop());

        streamRef.current = null;
      }

      const video = videoRef.current;

      if (video) {
        video.pause();
        video.srcObject = null;
      }
    };
  }, [stopFrameLoop]);

  // ============================================================
  // RISK COLOR
  // ============================================================

  const getRiskColor = () => {
    switch (riskLevel) {
      case "LOW":
        return "text-green-600";

      case "MODERATE":
        return "text-yellow-600";

      case "HIGH":
        return "text-orange-600";

      case "CRITICAL":
        return "text-red-600";

      default:
        return "text-slate-500";
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">

      {/* ======================================================
          CAMERA
      ======================================================= */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-sm">

        <div className="relative aspect-video w-full">

          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          />

          {/* Connection status */}

          <div className="absolute left-4 top-4">

            <div
              className={`rounded-full px-3 py-2 text-sm text-white backdrop-blur ${
                connected
                  ? "bg-green-600/80"
                  : cameraStarted
                    ? "bg-yellow-600/80"
                    : "bg-black/60"
              }`}
            >
              {connected
                ? "🟢 AI Connected"
                : cameraStarted
                  ? "🟡 Connecting..."
                  : "⚪ Camera Off"}
            </div>

          </div>

          {/* Pose status */}

          {cameraStarted && (
            <div className="absolute bottom-4 left-4">

              <div className="rounded-lg bg-black/60 px-3 py-2 text-sm text-white backdrop-blur">

                {landmarks.length > 0
                  ? `🟢 Pose Detected • ${landmarks.length} landmarks`
                  : "🟡 Looking for pose..."}

              </div>

            </div>
          )}

        </div>

      </div>

      {/* Hidden canvas */}

      <canvas
        ref={canvasRef}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        className="hidden"
      />

      {/* ======================================================
          START / STOP
      ======================================================= */}

      {!cameraStarted ? (
        <button
          type="button"
          onClick={startCamera}
          className="w-full rounded-xl bg-slate-900 px-6 py-4 font-semibold text-white transition hover:bg-slate-800"
        >
          📷 Start Camera & AI Analysis
        </button>
      ) : (
        <button
          type="button"
          onClick={stopCamera}
          className="w-full rounded-xl border border-red-200 bg-red-50 px-6 py-4 font-semibold text-red-700 transition hover:bg-red-100"
        >
          ⏹ Stop Camera
        </button>
      )}

      {/* ======================================================
          ERROR
      ======================================================= */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">

          <div className="font-semibold">
            Camera / AI Error
          </div>

          <div className="mt-1">
            {error}
          </div>

        </div>
      )}

      {/* ======================================================
          RISK + FEEDBACK
      ======================================================= */}

      <div className="grid gap-6 md:grid-cols-2">

        {/* Risk */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="text-sm font-medium text-slate-500">
            Injury Risk
          </div>

          <div
            className={`mt-2 text-5xl font-bold ${getRiskColor()}`}
          >
            {risk === null
              ? "--"
              : `${risk}%`}
          </div>

          <div className="mt-2 text-sm font-semibold text-slate-700">
            {riskLevel === "WAITING"
              ? "Waiting"
              : riskLevel}
          </div>

          <p className="mt-2 text-sm text-slate-500">
            {riskLevel === "LOW"
              ? "Low movement risk"
              : riskLevel === "MODERATE"
                ? "Moderate movement risk"
                : riskLevel === "HIGH"
                  ? "High movement risk"
                  : riskLevel === "CRITICAL"
                    ? "Critical movement risk"
                    : "Waiting for AI analysis"}
          </p>

        </div>

        {/* Feedback */}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="text-sm font-medium text-slate-500">
            AI Feedback
          </div>

          <div className="mt-3 text-lg font-semibold text-slate-900">
            {feedback}
          </div>

          {recommendation && (
            <p className="mt-3 text-sm text-slate-500">
              {recommendation}
            </p>
          )}

        </div>

      </div>

      {/* ======================================================
          WARNINGS
      ======================================================= */}

      {warnings.length > 0 && (
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-6">

          <div className="font-semibold text-yellow-800">
            ⚠️ Movement Warnings
          </div>

          <ul className="mt-3 space-y-2 text-sm text-yellow-700">

            {warnings.map(
              (warning, index) => (
                <li
                  key={`${warning}-${index}`}
                >
                  • {warning}
                </li>
              )
            )}

          </ul>

        </div>
      )}

      {/* ======================================================
          STATUS
      ======================================================= */}

      <div className="rounded-2xl bg-slate-50 p-6">

        <h3 className="font-semibold text-slate-900">
          TrainSafe AI Status
        </h3>

        <div className="mt-4 space-y-2 text-sm text-slate-600">

          <div>
            Camera:{" "}
            {cameraStarted
              ? "🟢 Active"
              : "⚪ Off"}
          </div>

          <div>
            WebSocket:{" "}
            {connected
              ? "🟢 Connected"
              : "🔴 Disconnected"}
          </div>

          <div>
            Pose:{" "}
            {landmarks.length > 0
              ? `🟢 ${landmarks.length} landmarks detected`
              : "🟡 Waiting"}
          </div>

          <div>
            Injury Risk:{" "}
            {risk === null
              ? "🟡 Waiting"
              : `🟢 ${risk}% ${riskLevel}`}
          </div>

        </div>

        <p className="mt-4 text-xs text-slate-400">
          TrainSafe AI provides a prototype
          movement-risk assessment and is not
          a medical diagnosis.
        </p>

      </div>

    </div>
  );
};

export default LivePoseCamera;