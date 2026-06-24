/**
 * src/data/api/oxoClient/oxoDiscovery.ts
 *
 * Discovery Service (lado do app): descobre a URL atual do tunnel Cloudflare
 * publicada pelo beacon.py num GitHub Gist, e atualiza o oxoClient sem precisar
 * editar .env manualmente a cada reinicio do tunnel.
 *
 * Fluxo:
 *  1. No init do app, busca a URL no Gist e configura oxoClient.defaults.baseURL.
 *  2. Se uma chamada falhar (rede/timeout), tenta descobrir de novo antes de
 *     desistir e cair no cache (oxoCache.ts) ja existente.
 *
 * Configuracao necessaria (uma unica vez, depois que beacon.py criar o Gist):
 *   EXPO_PUBLIC_GIST_ID=<id impresso pelo beacon.py na primeira execucao>
 *
 * O Gist e "secret" (nao listado publicamente), mas seu conteudo bruto pode
 * ser lido sem autenticacao por qualquer pessoa que tenha o ID/URL - por isso
 * o app nao precisa de nenhum token do GitHub para ler.
 */
import { oxoClient } from "./oxoClient";

const GIST_ID = process.env.EXPO_PUBLIC_GIST_ID ?? "";
const GIST_FILENAME = "oxo_tunnel.json";
const DISCOVERY_TIMEOUT_MS = 6000;

let lastKnownUrl: string | null = null;
let inFlight: Promise<string | null> | null = null;

function buildRawUrl(): string | null {
  if (!GIST_ID) return null;
  return `https://gist.githubusercontent.com/raw/${GIST_ID}/${GIST_FILENAME}`;
}

async function fetchTunnelUrlFromGist(): Promise<string | null> {
  const rawUrl = buildRawUrl();
  if (!rawUrl) {
    console.warn("[OXO Discovery] EXPO_PUBLIC_GIST_ID nao configurado - pulando descoberta.");
    return null;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DISCOVERY_TIMEOUT_MS);

  try {
    const resp = await fetch(`${rawUrl}?t=${Date.now()}`, { signal: controller.signal });
    if (!resp.ok) {
      console.warn(`[OXO Discovery] Gist respondeu ${resp.status}`);
      return null;
    }
    const json = await resp.json();
    const url = typeof json?.tunnel_url === "string" ? json.tunnel_url.trim() : "";
    if (!url) return null;
    return url;
  } catch (err) {
    console.warn("[OXO Discovery] Falha ao consultar o Gist:", (err as Error)?.message);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function discoverAndApply(): Promise<string | null> {
  if (inFlight) return inFlight;

  inFlight = (async () => {
    const url = await fetchTunnelUrlFromGist();
    if (url && url !== lastKnownUrl) {
      lastKnownUrl = url;
      oxoClient.defaults.baseURL = url;
      console.log(`[OXO Discovery] baseURL atualizado via Discovery Service: ${url}`);
    }
    return url ?? lastKnownUrl;
  })();

  try {
    return await inFlight;
  } finally {
    inFlight = null;
  }
}

export function getLastKnownTunnelUrl(): string | null {
  return lastKnownUrl;
}

let interceptorAttached = false;

export function initOxoDiscovery(): void {
  if (!interceptorAttached) {
    oxoClient.interceptors.response.use(
      (r) => r,
      async (error) => {
        const config = error?.config;
        const isNetworkIssue = !error?.response;
        if (isNetworkIssue && config && !config.__oxoDiscoveryRetried) {
          config.__oxoDiscoveryRetried = true;
          const novaUrl = await discoverAndApply();
          if (novaUrl) {
            config.baseURL = novaUrl;
            return oxoClient(config);
          }
        }
        return Promise.reject(error);
      }
    );
    interceptorAttached = true;
  }

  discoverAndApply().catch(() => {});
}
