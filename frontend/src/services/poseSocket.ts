
export class PoseSocket {
  private socket: WebSocket | null = null;

  connect(
    onMessage: (data: any) => void,
    onOpen?: () => void,
    onError?: (error: Event) => void
  ): void {
    console.log("🔵 Connecting to TrainSafe AI...");

    this.socket = new WebSocket(
      "ws://127.0.0.1:8000/ws/pose"
    );

    // ==========================================
    // CONNECTION OPEN
    // ==========================================

    this.socket.onopen = () => {
      console.log("✅ Connected to TrainSafe AI");

      if (onOpen) {
        onOpen();
      }
    };

    // ==========================================
    // MESSAGE FROM AI
    // ==========================================

    this.socket.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        console.log("🤖 AI response:", data);

        onMessage(data);
      } catch (error) {
        console.error(
          "❌ Failed to parse AI response:",
          error
        );
      }
    };

    // ==========================================
    // WEBSOCKET ERROR
    // ==========================================

    this.socket.onerror = (error: Event) => {
      console.error(
        "❌ AI WebSocket error:",
        error
      );

      if (onError) {
        onError(error);
      }
    };

    // ==========================================
    // CONNECTION CLOSED
    // ==========================================

    this.socket.onclose = (event: CloseEvent) => {
      console.log(
        "❌ AI WebSocket disconnected",
        event.code,
        event.reason
      );
    };
  }

  // ==========================================
  // SEND CAMERA FRAME
  // ==========================================

  sendFrame(frame: string): void {
    if (!this.socket) {
      console.warn(
        "⚠️ WebSocket does not exist"
      );
      return;
    }

    if (
      this.socket.readyState !==
      WebSocket.OPEN
    ) {
      return;
    }

    this.socket.send(frame);
  }

  // ==========================================
  // DISCONNECT
  // ==========================================

  disconnect(): void {
    if (this.socket) {
      console.log(
        "🔌 Closing AI WebSocket..."
      );

      this.socket.close();

      this.socket = null;
    }
  }

  // ==========================================
  // CHECK CONNECTION
  // ==========================================

  isConnected(): boolean {
    return (
      this.socket !== null &&
      this.socket.readyState ===
        WebSocket.OPEN
    );
  }
}
