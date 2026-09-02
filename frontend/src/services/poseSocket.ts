
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
      this.socket.readyState === WebSocket.OPEN
    ) {
      console.log(
        "⚠️ WebSocket already connected"
      );

      return;
    }

    console.log(
      "🔌 Connecting to TrainSafe AI..."
    );

    this.socket = new WebSocket(
      "ws://127.0.0.1:8000/ws/pose"
    );

    // =========================================================
    // CONNECTED
    // =========================================================

    this.socket.onopen = () => {
      console.log(
        "✅ Connected to TrainSafe AI"
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

      if (onError) {
        onError(error);
      }
    };

    // =========================================================
    // DISCONNECTED
    // =========================================================

    this.socket.onclose = () => {
      console.log(
        "🔌 AI WebSocket disconnected"
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
