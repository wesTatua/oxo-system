import type { Balanco, Venda, Agendamento, PixPayload, PixResult, ChatMessage } from '../entities';

export interface IFinanceiroRepository {
  getBalanco(): Promise<Balanco>;
}

export interface IAgendaRepository {
  listar(): Promise<Agendamento[]>;
}

export interface IPixRepository {
  gerar(payload: PixPayload): Promise<PixResult>;
}

export interface IChatRepository {
  enviarMensagem(texto: string): Promise<string>;
}

export interface ICopyRepository {
  gerar(nome: string, produto: string): Promise<{ copy: string; gatilho: string }>;
}
