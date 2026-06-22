# OXO_System

App React Native/Expo — interface visual do OXO, a "alma digital" de Wesley Simões.
Dashboard em tempo real para vendas, financeiro, chat com a IA e agenda de tatuagem.

## Arquitetura

- **Expo Router** (`app/`) — roteamento por arquivo, 4 abas (Dashboard, Vendas, Chat, Agenda).
- **Zustand** (`src/core/loop/oxoCoreLoop.ts`) — `useOxoStore`, o estado central (balanço,
  vendas, agenda, mensagens, status de conexão, estado do avatar). Persistido em
  `AsyncStorage` via middleware `persist` (exceto status de conexão, que é sempre ao vivo).
- **WebSocket** (`src/data/websocket/oxoSocket.ts`) — conecta na API Python, recebe eventos
  em tempo real (vendas, kill-switch, status) com reconexão automática.
- **Repository pattern** (`src/data/api/repositories.ts` + `src/domain/repositories/`) —
  cada tela fala com a API através de um repositório (`financeiroRepo`, `agendaRepo`,
  `pixRepo`, `chatRepo`, `copyRepo`), nunca direto com axios.
- **Domain entities** (`src/domain/entities/index.ts`) — tipos compartilhados
  (`Balanco`, `Venda`, `Agendamento`, `ChatMessage`, etc).
- **Presentation** (`src/presentation/`) — `screens/` (uma por aba), `components/`
  (ex: `CrystalX.tsx`, o avatar SVG animado, e `HudPanel.tsx`, painel reutilizável),
  `theme/` (cores, fontes, espaçamento).

A API Python (FastAPI, em `modules/pagamento/oxo_api.py` no repo principal) é a contraparte
de backend: financeiro, agenda, geração de PIX, chat com Claude e webhook do WhatsApp.

## Rodando localmente

```bash
npm install
cp .env.example .env.local   # ajuste EXPO_PUBLIC_API_URL
npx expo start
```

Abra no Expo Go (celular) ou pressione `w` para abrir no navegador.

> Hardware do Comandante é limitado (notebook Celeron + 8GB RAM) — para desenvolvimento
> pesado (Metro bundler, instalação de pacotes grandes), prefira rodar em um ambiente
> na nuvem (ex: GitHub Codespaces) em vez de local.

## Variáveis de ambiente

| Variável | Onde | Descrição |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | `.env.local` | URL pública da API Python. Como a API roda no notebook do Comandante e o app no Expo Go/Codespace, **nunca** use `localhost` — use a URL do túnel Cloudflare ativo (gerado por `cloudflared` / `iniciar_oxo.bat` no repo principal). |

## Estrutura de pastas

```
OXO_System/
├── app/                     # Expo Router — telas e layout das abas
├── src/
│   ├── core/loop/           # useOxoStore (Zustand) + bootstrap (startCoreLoop)
│   ├── data/
│   │   ├── api/             # oxoClient (axios) + repositories
│   │   └── websocket/       # oxoSocket (reconexão automática)
│   ├── domain/
│   │   ├── entities/        # tipos TS compartilhados
│   │   └── repositories/    # contratos dos repositórios
│   └── presentation/
│       ├── components/      # CrystalX (avatar), HudPanel
│       ├── screens/         # Dashboard, Vendas, Chat, Agenda
│       └── theme/           # cores, fontes, espaçamento
└── assets/                  # ícones e design tokens
```
