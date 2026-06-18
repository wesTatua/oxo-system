// ── DOMAIN ENTITIES — OXO_CORE_LOOP ──────────────────────────

export interface Balanco {
  lucro_liquido: number;
  acumulado: number;
  meta: number;
  percentual: number;
}

export interface Venda {
  id: string;
  descricao: string;
  valor: number;
  timestamp: string;
  tipo: 'pix' | 'cosmetico' | 'tatuagem';
}

export interface Agendamento {
  id: string;
  nome: string;
  cliente?: string;
  data: string;
  hora: string;
  valor?: number;
  pago: boolean;
  hash_pix?: string;
}

export interface PixPayload {
  valor: number;
  email: string;
  descricao: string;
  titulo: string;
}

export interface PixResult {
  qr_code: string;
  payment_id: string;
  erro?: string;
}

export interface ChatMessage {
  id: string;
  tipo: 'user' | 'oxo';
  texto: string;
  timestamp: string;
}

export interface OxoEvent {
  tipo: 'venda' | 'pix_gerado' | 'kill_switch' | 'status' | 'ping';
  valor?: number;
  descricao?: string;
  titulo?: string;
  balanco?: Balanco;
}

export type AvatarState =
  | 'ONLINE'
  | 'PROCESSANDO'
  | 'VENDA'
  | 'ALERTA'
  | 'PAUSADO';
