import {
  useEffect,
  useRef,
  useState,
} from "react";

import { PoseSocket } from "../../services/poseSocket";


const LivePoseCamera = () => {

  // ==========================================
  // REFERENCES
  // ==========================================

  const videoRef =
    useRef<HTMLVideoElement>(null);

  const canvasRef =
    useRef<HTMLCanvasElement>(null);

  const socketRef =
    useRef<PoseSocket | null>(null);

  const streamRef =
    useRef<MediaStream | null>(null);

  const frameTimerRef =
    useRef<number | null>(null);


  // ==========================================
  // STATE
  // ==========================================

  const [connected, setConnected] =
    useState(false);

  const [cameraActive, setCameraActive] =
    useState(false);

  const [landmarks, setLandmarks] =
    useState<any[]>([]);


  // ==========================================
  // COMPONENT MOUNT
  // ==========================================

  useEffect(() => {

    startCamera();

    return () => {

      // Stop camera
      if (streamRef.current) {

        streamRef.current
          .getTracks()
          .forEach((track) => {
            track.stop();
          });

      }


      // Stop frame loop
      if (
        frameTimerRef.current !== null
      ) {

        window.clearTimeout(
          frameTimerRef.current
        );

      }


      // Disconnect WebSocket
      socketRef.current?.disconnect();

    };

  }, []);


  // ==========================================
  // START CAMERA
  // ==========================================

  const startCamera = async () => {

    try {

      console.log(
        "📷 Starting camera..."
      );


      const stream =
        await navigator.mediaDevices
          .getUserMedia({

            video: {

              width: 640,

              height: 480,

              facingMode: "user",

            },

            audio: false,

          });


      streamRef.current =
        stream;


      // Attach camera to video
      if (videoRef.current) {

        videoRef.current.srcObject =
          stream;

        await videoRef.current.play();

      }


      setCameraActive(true);


      console.log(
        "✅ Camera started"
      );


      // ========================================
      // CREATE WEBSOCKET
      // ========================================

      const socket =
        new PoseSocket();


      socket.connect(

        // ======================================
        // MESSAGE
        // ======================================

        (data) => {

          console.log(
            "🤖 AI response:",
            data
          );


          if (
            data &&
            Array.isArray(
              data.landmarks
            )
          ) {

            setLandmarks(
              data.landmarks
            );

          } else {

            // Temporary response
            setLandmarks([]);

          }

        },


        // ======================================
        // OPEN
        // ======================================

        () => {

          console.log(
            "🟢 AI WebSocket connected"
          );


          setConnected(true);


          // Start sending camera frames
          startFrameLoop();

        },


        // ======================================
        // ERROR
        // ======================================

        (error: Event) => {

          console.error(
            "❌ AI WebSocket error:",
            error
          );


          setConnected(false);

        }

      );


      socketRef.current =
        socket;

    }

    catch (error) {

      console.error(
        "❌ Camera error:",
        error
      );

      setCameraActive(false);

    }

  };


  // ==========================================
  // FRAME LOOP
  // ==========================================

  const startFrameLoop = () => {

    const canvas =
      canvasRef.current;

    const video =
      videoRef.current;


    if (!canvas || !video) {

      console.error(
        "❌ Canvas/video unavailable"
      );

      return;

    }


    const context =
      canvas.getContext("2d");


    if (!context) {

      console.error(
        "❌ Canvas context unavailable"
      );

      return;

    }


    const sendFrame = () => {

      // Check WebSocket
      if (
        socketRef.current &&
        !socketRef.current
          .isConnected()
      ) {

        frameTimerRef.current =
          window.setTimeout(
            sendFrame,
            100
          );

        return;

      }


      // Check camera
      if (
        video.readyState >=
        HTMLMediaElement
          .HAVE_CURRENT_DATA
      ) {

        // Canvas resolution
        canvas.width = 640;

        canvas.height = 480;


        // Draw camera frame
        context.drawImage(

          video,

          0,

          0,

          640,

          480

        );


        // Convert to JPEG
        const image =
          canvas.toDataURL(
            "image/jpeg",
            0.6
          );


        // Send to AI
        socketRef.current
          ?.sendFrame(image);

      }


      // Continue loop
      frameTimerRef.current =
        window.setTimeout(
          sendFrame,
          100
        );

    };


    sendFrame();

  };


  // ==========================================
  // UI
  // ==========================================

  return (

    <div
      style={{
        width: "100%",
        maxWidth: "700px",
        margin: "0 auto",
      }}
    >

      {/* =====================================
          CAMERA
      ====================================== */}

      <div
        style={{
          position: "relative",

          width: "640px",

          height: "480px",

          maxWidth: "100%",

          overflow: "hidden",

          borderRadius: "12px",

          background: "#111",

        }}
      >

        <video
          ref={videoRef}

          autoPlay

          playsInline

          muted

          style={{

            width: "100%",

            height: "100%",

            objectFit: "cover",

            transform:
              "scaleX(-1)",

          }}
        />


        {/* CAMERA STATUS */}

        <div
          style={{
            position: "absolute",

            top: "12px",

            left: "12px",

            padding:
              "6px 10px",

            borderRadius:
              "6px",

            background:
              "rgba(0,0,0,0.65)",

            color: "#fff",

            fontSize: "14px",

          }}
        >

          {cameraActive
            ? "📷 Camera Active"
            : "📷 Starting Camera..."}

        </div>


        {/* AI STATUS */}

        <div
          style={{
            position: "absolute",

            top: "12px",

            right: "12px",

            padding:
              "6px 10px",

            borderRadius:
              "6px",

            background:
              "rgba(0,0,0,0.65)",

            color: "#fff",

            fontSize: "14px",

          }}
        >

          {connected
            ? "🟢 AI Connected"
            : "🔴 AI Disconnected"}

        </div>

      </div>


      {/* =====================================
          HIDDEN CANVAS
      ====================================== */}

      <canvas
        ref={canvasRef}

        width={640}

        height={480}

        style={{
          display: "none",
        }}
      />


      {/* =====================================
          INFORMATION
      ====================================== */}

      <div
        style={{
          marginTop: "15px",

          padding: "15px",

          borderRadius: "10px",

          background: "#f5f5f5",

        }}
      >

        {/* AI STATUS */}

        <div>

          <strong>
            AI Status:
          </strong>{" "}

          {connected
            ? "🟢 Connected"
            : "🔴 Disconnected"}

        </div>


        {/* CAMERA STATUS */}

        <div
          style={{
            marginTop: "8px",
          }}
        >

          <strong>
            Camera:
          </strong>{" "}

          {cameraActive
            ? "🟢 Active"
            : "🔴 Inactive"}

        </div>


        {/* LANDMARK COUNT */}

        <div
          style={{
            marginTop: "8px",
          }}
        >

          <strong>
            Landmarks detected:
          </strong>{" "}

          {landmarks.length}

        </div>


        {/* DETECTION MESSAGE */}

        <div
          style={{
            marginTop: "8px",

            fontSize: "13px",

            color: "#666",

          }}
        >

          {landmarks.length > 0

            ? "✅ Body detected"

            : "Waiting for AI pose detection..."}

        </div>

      </div>

    </div>

  );
};


export default LivePoseCamera;
