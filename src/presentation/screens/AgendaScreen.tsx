import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useOxoStore } from '../../core/loop/oxoCoreLoop';
import { HudPanel } from '../components/panels/HudPanel';
import { agendaRepo } from '../../data/api/repositories';
import { Colors, Fonts, Spacing } from '../theme';

const fmtBRL = (v: number) =>
  v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function AgendaScreen() {
  const { agenda, setAgenda } = useOxoStore();
  const [refreshing, setRefreshing] = React.useState(false);

  const load = async () => {
    try {
      const items = await agendaRepo.listar();
      setAgenda(items);
    } catch {}
  };

  useEffect(() => { load(); }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.teal} />}
    >
      <HudPanel title="TARGET SCANNER" icon="◈">
        {agenda.length === 0 ? (
          <Text style={styles.empty}>NENHUM AGENDAMENTO</Text>
        ) : (
          agenda.map((a, i) => (
            <View key={a.id ?? i} style={styles.item}>
              <View style={[styles.dot, a.pago ? styles.dotOk : styles.dotWarn]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.nome}>{a.nome ?? a.cliente ?? '—'}</Text>
                <Text style={styles.meta}>{a.data} {a.hora}</Text>
              </View>
              <Text style={styles.val}>{a.valor ? `R$${fmtBRL(a.valor)}` : '—'}</Text>
              <View style={[styles.badge, a.pago ? styles.badgeOk : styles.badgeWarn]}>
                <Text style={[styles.badgeTxt, a.pago ? { color: Colors.lime } : { color: Colors.amber }]}>
                  {a.pago ? 'PAGO' : 'PENDENTE'}
                </Text>
              </View>
            </View>
          ))
        )}
      </HudPanel>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root:      { flex: 1, backgroundColor: Colors.bg },
  content:   { padding: Spacing.md, paddingBottom: Spacing.xxl },
  empty:     { fontFamily: Fonts.mono, fontSize: 9, color: Colors.tealDim, textAlign: 'center', padding: Spacing.md, opacity: 0.5 },

  item:      { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(0,200,180,0.1)' },
  dot:       { width: 8, height: 8, borderRadius: 4 },
  dotOk:     { backgroundColor: Colors.lime,  shadowColor: Colors.lime,  shadowOpacity: 0.8, shadowRadius: 4, elevation: 3 },
  dotWarn:   { backgroundColor: Colors.amber, shadowColor: Colors.amber, shadowOpacity: 0.8, shadowRadius: 4, elevation: 3 },

  nome:      { fontFamily: Fonts.mono, fontSize: 12, color: Colors.tealHi },
  meta:      { fontFamily: Fonts.mono, fontSize: 9,  color: Colors.tealDim },
  val:       { fontFamily: Fonts.heading, fontSize: 11, color: Colors.teal },

  badge:     { borderWidth: 1, paddingHorizontal: 5, paddingVertical: 1 },
  badgeOk:   { borderColor: Colors.lime },
  badgeWarn: { borderColor: Colors.amber },
  badgeTxt:  { fontFamily: Fonts.mono, fontSize: 7, letterSpacing: 1 },
});
