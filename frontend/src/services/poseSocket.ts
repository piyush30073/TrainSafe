export interface PoseAIResponse {
  success?: boolean;
  message?: string;
  received?: number;

  detected?: boolean;

  landmarks?: {
    id?: number;
    x: number;
    y: number;
    z?: number;
    visibility?: number;
  }[];

  angles?: {
    left_elbow?: number;
    right_elbow?: number;
    left_knee?: number;
    right_knee?: number;
    [key: string]: number | undefined;
  };

  risk?: number;
  risk_level?: string;

  feedback?: string;
  recommendation?: string;

  status?: string;
}

export class PoseSocket {
  private socket: WebSocket | null = null;

  connect(
    onMessage: (data: PoseAIResponse) => void,
    onError?: (error: Event) => void,
    onDisconnect?: () => void,
    onConnect?: () => void
  ) {
    // =========================================================
    // PREVENT DUPLICATE CONNECTIONS
    // =========================================================

    if (
      this.socket &&
      (
        this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING
      )
    ) {
      console.log(
        "⚠️ WebSocket already connected/connecting"
      );

      return;
    }

    // =========================================================
    // GET AI SERVICE URL
    // =========================================================

    const aiUrl =
      import.meta.env.VITE_AI_API_URL;

    if (!aiUrl) {
      console.error(
        "❌ VITE_AI_API_URL is not configured"
      );

      return;
    }

    // =========================================================
    // HTTP → WS
    //
    // Local:
    // http://localhost:8000
    //       ↓
    // ws://localhost:8000
    //
    // Production:
    // https://trainsafe-1.onrender.com
    //       ↓
    // wss://trainsafe-1.onrender.com
    // =========================================================

    const wsUrl =
      `${aiUrl.replace(/^http/, "ws")}/ws/pose`;

    console.log(
      "🔌 Connecting to TrainSafe AI:",
      wsUrl
    );

    // =========================================================
    // CREATE SOCKET
    // =========================================================

    try {
      this.socket =
        new WebSocket(wsUrl);
    } catch (error) {
      console.error(
        "❌ Failed to create WebSocket:",
        error
      );

      return;
    }

    // =========================================================
    // CONNECTED
    // =========================================================

    this.socket.onopen = () => {
      console.log(
        "✅ Connected to TrainSafe AI"
      );

      console.log(
        "🤖 AI WebSocket:",
        wsUrl
      );

      if (onConnect) {
        onConnect();
      }
    };

    // =========================================================
    // MESSAGE
    // =========================================================

    this.socket.onmessage = (event) => {
      try {
        const data: PoseAIResponse =
          JSON.parse(event.data);

        console.log(
          "🤖 AI response:",
          data
        );

        onMessage(data);

      } catch (error) {
        console.error(
          "❌ Invalid AI response:",
          error
        );

        console.error(
          "Received:",
          event.data
        );
      }
    };

    // =========================================================
    // ERROR
    // =========================================================

    this.socket.onerror = (error) => {
      console.error(
        "❌ AI WebSocket error:",
        error
      );

      console.error(
        "❌ WebSocket URL:",
        wsUrl
      );

      if (onError) {
        onError(error);
      }
    };

    // =========================================================
    // DISCONNECTED
    // =========================================================

    this.socket.onclose = (event) => {
      console.log(
        "🔌 AI WebSocket disconnected"
      );

      console.log(
        "Close code:",
        event.code
      );

      console.log(
        "Close reason:",
        event.reason
      );

      if (onDisconnect) {
        onDisconnect();
      }
    };
  }

  // =========================================================
  // SEND FRAME
  // =========================================================

  sendFrame(image: string) {
    if (
      !this.socket ||
      this.socket.readyState !== WebSocket.OPEN
    ) {
      console.warn(
        "⚠️ WebSocket is not connected"
      );

      return;
    }

    try {
      // IMPORTANT:
      // FastAPI expects the base64/data URL directly.
      //
      // DO NOT wrap it in JSON.

      this.socket.send(image);

    } catch (error) {
      console.error(
        "❌ Failed to send frame:",
        error
      );
    }
  }

  // =========================================================
  // CONNECTION STATUS
  // =========================================================

  isConnected() {
    return (
      this.socket !== null &&
      this.socket.readyState ===
        WebSocket.OPEN
    );
  }

  // =========================================================
  // DISCONNECT
  // =========================================================

  disconnect() {
    if (this.socket) {
      console.log(
        "🔌 Closing AI WebSocket..."
      );

      this.socket.close();

      this.socket = null;
    }
  }
}