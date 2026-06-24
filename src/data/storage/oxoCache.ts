/**
 * src/data/storage/oxoCache.ts
 *
 * Camada de cache read-only para o app OXO. Objetivo: se o tunel cair
 * momentaneamente, as telas continuam mostrando o ultimo dado bom
 * conhecido (read-only) em vez de tela vazia/erro.
 *
 * IMPORTANTE: ajuste os imports/assinaturas se os repositorios reais
 * (financeiroRepo, agendaRepo, pixRepo, chatRepo, copyRepo) tiverem
 * nomes diferentes dos assumidos aqui.
 *
 * Estrategia: stale-while-revalidate.
 *  1. Tenta a chamada de rede normal.
 *  2. Se der sucesso, salva no cache (AsyncStorage) e retorna o dado fresco.
 *  3. Se falhar (tunel fora do ar, timeout, etc.), busca o ultimo valor
 *     salvo no cache e retorna ele, marcado como fromCache: true.
 *  4. Se nao houver nada em cache, propaga o erro normalmente.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const CACHE_PREFIX = "oxo_cache:";

export interface CachedResult<T> {
  data: T;
  fromCache: boolean;
  cachedAt?: number;
}

async function readCache<T>(key: string): Promise<{ data: T; cachedAt: number } | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function writeCache<T>(key: string, data: T): Promise<void> {
  try {
    await AsyncStorage.setItem(
      CACHE_PREFIX + key,
      JSON.stringify({ data, cachedAt: Date.now() })
    );
  } catch {
    // Falha ao gravar cache nao deve quebrar o fluxo principal do app.
  }
}

/**
 * Envolve uma chamada de repositorio com cache de leitura.
 *
 * Exemplo de uso (dentro de um repositorio existente, ex. financeiroRepo):
 *
 *   export const financeiroRepo = {
 *     getBalanco: () => withCache("balanco", () => oxoClient.get("/financeiro/balanco")),
 *   };
 */
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<CachedResult<T>> {
  try {
    const data = await fetcher();
    await writeCache(key, data);
    return { data, fromCache: false };
  } catch (err) {
    const cached = await readCache<T>(key);
    if (cached) {
      return { data: cached.data, fromCache: true, cachedAt: cached.cachedAt };
    }
    throw err;
  }
}

/** Limpa todo o cache (ex.: botao "Forcar atualizacao" nas configuracoes). */
export async function clearOxoCache(): Promise<void> {
  const keys = await AsyncStorage.getAllKeys();
  const oxoKeys = keys.filter((k) => k.startsWith(CACHE_PREFIX));
  if (oxoKeys.length) await AsyncStorage.multiRemove(oxoKeys);
}

/** Util para o HUD mostrar "dados de Xh atras" quando fromCache === true. */
export function formatCacheAge(cachedAt?: number): string {
  if (!cachedAt) return "";
  const minutes = Math.round((Date.now() - cachedAt) / 60000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `${minutes} min atras`;
  return `${Math.round(minutes / 60)} h atras`;
}
