import { io, Socket } from 'socket.io-client';

interface LogEntry {
  id: string;
  timestamp: Date;
  command: string;
  commandType: string;
  output: string;
  error: boolean;
}

interface CommandData {
  command: string;
  commandType: string;
  projectPath: string;
  sessionId: string;
}

interface CommandStartEvent {
  sessionId: string;
  command: string;
  commandType: string;
  pid: number;
}

interface CommandOutputEvent {
  sessionId: string;
  output: string;
  error: boolean;
}

interface CommandCompleteEvent {
  sessionId: string;
  exitCode: number;
  success: boolean;
}

interface CommandErrorEvent {
  sessionId: string;
  error: string;
}

class SocketService {
  private socket: Socket | null = null;
  private connected: boolean = false;

  connect(): Promise<Socket> {
    return new Promise((resolve, reject) => {
      if (this.socket && this.connected) {
        resolve(this.socket);
        return;
      }

      this.socket = io('http://localhost:3001');

      this.socket.on('connect', () => {
        console.log('[Socket.IO] Connected to server');
        this.connected = true;
        resolve(this.socket!);
      });

      this.socket.on('disconnect', () => {
        console.log('[Socket.IO] Disconnected from server');
        this.connected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('[Socket.IO] Connection error:', error);
        reject(error);
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  async executeCommand(
    data: CommandData,
    callbacks: {
      onStart?: (data: CommandStartEvent) => void;
      onOutput?: (data: CommandOutputEvent) => void;
      onComplete?: (data: CommandCompleteEvent) => void;
      onError?: (data: CommandErrorEvent) => void;
    }
  ): Promise<void> {
    const socket = await this.connect();
    const { sessionId } = data;

    // Set up event listeners for this specific command session
    const startHandler = (data: CommandStartEvent) => {
      if (data.sessionId === sessionId && callbacks.onStart) {
        callbacks.onStart(data);
      }
    };

    const outputHandler = (data: CommandOutputEvent) => {
      if (data.sessionId === sessionId && callbacks.onOutput) {
        callbacks.onOutput(data);
      }
    };

    const completeHandler = (data: CommandCompleteEvent) => {
      if (data.sessionId === sessionId) {
        // Clean up listeners for this session
        socket.off('command-start', startHandler);
        socket.off('command-output', outputHandler);
        socket.off('command-complete', completeHandler);
        socket.off('command-error', errorHandler);

        if (callbacks.onComplete) {
          callbacks.onComplete(data);
        }
      }
    };

    const errorHandler = (data: CommandErrorEvent) => {
      if (data.sessionId === sessionId) {
        // Clean up listeners for this session
        socket.off('command-start', startHandler);
        socket.off('command-output', outputHandler);
        socket.off('command-complete', completeHandler);
        socket.off('command-error', errorHandler);

        if (callbacks.onError) {
          callbacks.onError(data);
        }
      }
    };

    // Register event listeners
    socket.on('command-start', startHandler);
    socket.on('command-output', outputHandler);
    socket.on('command-complete', completeHandler);
    socket.on('command-error', errorHandler);

    // Execute the command
    socket.emit('execute-command', data);
  }

  generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }
}

export default new SocketService();
