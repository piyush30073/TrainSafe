export interface PoseAIResponse {
  success?: boolean;
  message?: string;
  received?: number;

  landmarks?: {
    x: number;
    y: number;
    z?: number;
    visibility?: number;
  }[];

  risk?: number;
  risk_level?: string;

  feedback?: string;
  recommendation?: string;
}

export class PoseSocket {
  private socket: WebSocket | null = null;

  connect(
    onMessage: (data: PoseAIResponse) => void,
    onError?: (error: Event) => void,
    onDisconnect?: () => void
  ) {
    // Prevent duplicate connections
    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING)
    ) {
      console.log("⚠️ WebSocket already connected/connecting");
      return;
    }

    // =========================================================
    // GET AI SERVICE URL FROM ENVIRONMENT
    // =========================================================

    const aiUrl = import.meta.env.VITE_AI_API_URL;

    if (!aiUrl) {
      console.error(
        "❌ VITE_AI_API_URL is not configured"
      );

      return;
    }

    // Convert:
    // http://localhost:8000
    //        ↓
    // ws://localhost:8000
    //
    // https://trainsafe-1.onrender.com
    //        ↓
    // wss://trainsafe-1.onrender.com

    const wsUrl = `${aiUrl.replace(/^http/, "ws")}/ws/pose`;

    console.log(
      "🔌 Connecting to TrainSafe AI:",
      wsUrl
    );

    // =========================================================
    // CREATE WEBSOCKET
    // =========================================================

    try {
      this.socket = new WebSocket(wsUrl);
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
    };

    // =========================================================
    // MESSAGE FROM PYTHON AI
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
          "Received data:",
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
        "WebSocket close code:",
        event.code
      );

      console.log(
        "WebSocket close reason:",
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
      this.socket.send(
        JSON.stringify({
          image,
        })
      );
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
      this.socket.readyState === WebSocket.OPEN
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