export interface PoseAIResponse {
  success?: boolean;
  message?: string;

  detected?: boolean;

  landmarks?: {
    x: number;
    y: number;
    z?: number;
    visibility?: number;
  }[];

  angles?: {
    left_elbow?: number | null;
    right_elbow?: number | null;
    left_knee?: number | null;
    right_knee?: number | null;
    left_hip?: number | null;
    right_hip?: number | null;
    trunk_lean?: number | null;
  };

  risk?: number;
  risk_level?: string;

  warnings?: string[];
  feedback?: string;
  recommendation?: string;

  metrics?: {
    left_knee_angle?: number | null;
    right_knee_angle?: number | null;
    left_hip_angle?: number | null;
    right_hip_angle?: number | null;
    trunk_lean?: number | null;
    visibility?: number;
  };

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
    const aiUrl = import.meta.env.VITE_AI_API_URL;

    if (!aiUrl) {
      console.error("❌ VITE_AI_API_URL is not defined");
      return;
    }

    const wsUrl = `${aiUrl.replace(/^http/, "ws")}/ws/pose`;

    console.log("🤖 Connecting to TrainSafe AI:", wsUrl);

    // Close previous socket if one exists
    if (this.socket) {
      try {
        this.socket.close();
      } catch {
        // Ignore close errors
      }

      this.socket = null;
    }

    try {
      this.socket = new WebSocket(wsUrl);
    } catch (error) {
      console.error("❌ WebSocket creation failed:", error);
      return;
    }

    this.socket.onopen = () => {
      console.log("🟢 WebSocket OPEN");
      console.log("✅ Connected to TrainSafe AI");

      onConnect?.();
    };

    this.socket.onmessage = (event) => {
      try {
        const data: PoseAIResponse = JSON.parse(event.data);

        console.log("📥 AI RESPONSE:", data);

        onMessage(data);
      } catch (error) {
        console.error(
          "❌ Failed to parse AI response:",
          error
        );
      }
    };

    this.socket.onerror = (error) => {
      console.error(
        "❌ TrainSafe AI WebSocket ERROR:",
        error
      );

      onError?.(error);
    };

    this.socket.onclose = (event) => {
      console.log(
        "🔴 WebSocket CLOSED",
        `code=${event.code}`,
        `reason=${event.reason || "none"}`
      );

      onDisconnect?.();
    };
  }

  sendFrame(image: string) {
    if (!this.socket) {
      console.warn(
        "⚠️ Cannot send frame: WebSocket does not exist"
      );
      return;
    }

    if (this.socket.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      this.socket.send(image);
    } catch (error) {
      console.error(
        "❌ Failed to send frame:",
        error
      );
    }
  }

  isConnected(): boolean {
    return (
      this.socket !== null &&
      this.socket.readyState === WebSocket.OPEN
    );
  }

  disconnect() {
    if (!this.socket) {
      return;
    }

    console.log("🔌 Disconnecting TrainSafe AI...");

    try {
      this.socket.close(1000, "Client disconnected");
    } catch (error) {
      console.error(
        "❌ WebSocket close error:",
        error
      );
    }

    this.socket = null;
  }
}