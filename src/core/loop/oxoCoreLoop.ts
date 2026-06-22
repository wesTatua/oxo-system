/**
 * OXO_CORE_LOOP
 * ─────────────────────────────────────────────────────────────
 * Cérebro central do sistema. Orquestra:
 *   · Estado global (Zustand)
 *   · WebSocket em tempo real
 *   · Polling de status a cada 30s
 *   · Despacho de eventos para a UI
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Balanco, Venda, Agendamento, ChatMessage, AvatarState, OxoEvent } from '../../domain/entities';
import { oxoSocket } from '../../data/websocket/oxoSocket';
import { financeiroRepo, agendaRepo } from '../../data/api/repositories';

interface OxoState {
  // financeiro
  balanco: Balanco | null;
  // feed de vendas
  vendas: Venda[];
  // agenda
  agenda: Agendamento[];
  // chat
  mensagens: ChatMessage[];
  // sistema
  wsOnline: boolean;
  apiOnline: boolean;
  avatarState: AvatarState;
  // ações
  setBalanco: (b: Balanco) => void;
  addVenda: (v: Venda) => void;
  setAgenda: (a: Agendamento[]) => void;
  addMensagem: (m: ChatMessage) => void;
  setWsOnline: (v: boolean) => void;
  setApiOnline: (v: boolean) => void;
  setAvatarState: (s: AvatarState) => void;
}

export const useOxoStore = create<OxoState>()(
  persist(
    (set) => ({
      balanco: null,
      vendas: [],
      agenda: [],
      mensagens: [
        {
          id: '0',
          tipo: 'oxo',
          texto: 'Fala, Comandante. Sistema online e pronto.',
          timestamp: new Date().toISOString(),
        },
      ],
      wsOnline: false,
      apiOnline: false,
      avatarState: 'ONLINE',

      setBalanco:    (balanco)     => set({ balanco }),
      addVenda:      (v)           => set((s) => ({ vendas: [v, ...s.vendas].slice(0, 30) })),
      setAgenda:     (agenda)      => set({ agenda }),
      addMensagem:   (m)           => set((s) => ({ mensagens: [...s.mensagens, m] })),
      setWsOnline:   (wsOnline)    => set({ wsOnline }),
      setApiOnline:  (apiOnline)   => set({ apiOnline }),
      setAvatarState:(avatarState) => set({ avatarState }),
    }),
    {
      name: 'oxo-store',
      storage: createJSONStorage(() => AsyncStorage),
      // wsOnline/apiOnline/avatarState são estado de conexão ao vivo —
      // não fazem sentido persistidos entre sessões do app.
      partialize: (s) => ({
        balanco: s.balanco,
        vendas: s.vendas,
        agenda: s.agenda,
        mensagens: s.mensagens,
      }),
    }
  )
);

// ── Bootstrapper — chame no app entry ─────────────────────────
let pollInterval: ReturnType<typeof setInterval> | null = null;

export function startCoreLoop() {
  const store = useOxoStore.getState();

  // 1. Conectar WebSocket
  oxoSocket.connect();

  // 2. Escutar eventos do backend
  oxoSocket.subscribe((ev: OxoEvent) => {
    const s = useOxoStore.getState();

    if (ev.tipo === 'status' && ev.balanco) {
      s.setBalanco(ev.balanco);
    }

    if (ev.tipo === 'venda') {
      s.addVenda({
        id: Date.now().toString(),
        descricao: ev.descricao ?? 'PIX recebido',
        valor: ev.valor ?? 0,
        timestamp: new Date().toISOString(),
        tipo: 'pix',
      });
      if (ev.balanco) s.setBalanco(ev.balanco);
      s.setAvatarState('VENDA');
      setTimeout(() => useOxoStore.getState().setAvatarState('ONLINE'), 5000);
    }

    if (ev.tipo === 'kill_switch') {
      s.setAvatarState('PAUSADO');
    }
  });

  // 3. Polling de status a cada 30s
  const poll = async () => {
    try {
      const b = await financeiroRepo.getBalanco();
      useOxoStore.getState().setBalanco(b);
      useOxoStore.getState().setApiOnline(true);
    } catch {
      useOxoStore.getState().setApiOnline(false);
    }
  };

  poll();
  pollInterval = setInterval(poll, 30_000);
}

export function stopCoreLoop() {
  if (pollInterval) clearInterval(pollInterval);
  oxoSocket.disconnect();
}
