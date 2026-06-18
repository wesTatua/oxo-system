import { oxoClient } from './oxoClient';
import type {
  IFinanceiroRepository, IAgendaRepository,
  IPixRepository, IChatRepository, ICopyRepository,
} from '../../domain/repositories';
import type { Balanco, Agendamento, PixPayload, PixResult } from '../../domain/entities';

export const financeiroRepo: IFinanceiroRepository = {
  async getBalanco(): Promise<Balanco> {
    const { data } = await oxoClient.get('/status');
    const b = data.balanco ?? {};
    const acum = b.acumulado ?? 0;
    return {
      lucro_liquido: b.lucro_liquido ?? b.lucro ?? 0,
      acumulado: acum,
      meta: 5000,
      percentual: Math.min(Math.round((acum / 5000) * 100), 100),
    };
  },
};

export const agendaRepo: IAgendaRepository = {
  async listar(): Promise<Agendamento[]> {
    const { data } = await oxoClient.get('/agenda');
    return data.agenda ?? [];
  },
};

export const pixRepo: IPixRepository = {
  async gerar(payload: PixPayload): Promise<PixResult> {
    const { data } = await oxoClient.post('/gerar-pix', payload);
    return data;
  },
};

export const chatRepo: IChatRepository = {
  async enviarMensagem(texto: string): Promise<string> {
    const { data } = await oxoClient.post('/chat', { mensagem: texto });
    return data.resposta ?? data.erro ?? 'Sinal perdido.';
  },
};

export const copyRepo: ICopyRepository = {
  async gerar(nome: string, produto: string) {
    const { data } = await oxoClient.post('/copy', { nome, produto });
    return { copy: data.copy ?? '', gatilho: data.gatilho ?? 'personalizado' };
  },
};
