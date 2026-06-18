import type { OxoEvent } from '../../domain/entities';

const WS_URL = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000')
  .replace(/^http/, 'ws') + '/ws';

type Listener = (event: OxoEvent) => void;

class OxoWebSocket {
  private ws: WebSocket | null = null;
  private listeners: Set<Listener> = new Set();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private alive = false;

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;
    this.ws = new WebSocket(WS_URL);

    this.ws.onopen = () => {
      this.alive = true;
      if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
      this.emit({ tipo: 'status' } as OxoEvent);
    };

    this.ws.onclose = () => {
      this.alive = false;
      this.reconnectTimer = setTimeout(() => this.connect(), 4000);
    };

    this.ws.onerror = () => this.ws?.close();

    this.ws.onmessage = (e) => {
      try {
        const ev: OxoEvent = JSON.parse(e.data);
        if (ev.tipo !== 'ping') this.listeners.forEach((fn) => fn(ev));
      } catch (_) {}
    };
  }

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.alive = false;
  }

  get isAlive() { return this.alive; }

  private emit(ev: OxoEvent) {
    this.listeners.forEach((fn) => fn(ev));
  }
}

export const oxoSocket = new OxoWebSocket();
