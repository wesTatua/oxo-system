import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useOxoStore } from '../../core/loop/oxoCoreLoop';
import { CrystalX } from '../components/crystal/CrystalX';
import { HudPanel } from '../components/panels/HudPanel';
import { Colors, Fonts, Spacing } from '../theme';

const fmtBRL = (v: number) =>
  v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function DashboardScreen() {
  const { balanco, wsOnline, apiOnline, avatarState, vendas } = useOxoStore();

  const STATE_LABEL: Record<string, string> = {
    ONLINE:      '● ONLINE — PRONTO',
    PROCESSANDO: '◎ PROCESSANDO...',
    VENDA:       '◆ VENDA DETECTADA',
    ALERTA:      '⚠ ALERTA',
    PAUSADO:     '⚠ PAUSADO',
  };

  return (
    <View style={styles.root}>
      {/* space bg */}
      <LinearGradient
        colors={['#000008', '#000c18', 'rgba(0,120,100,0.12)', '#000008']}
        locations={[0, 0.4, 0.8, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* crystal hero */}
      <View style={styles.hero}>
        <CrystalX size={180} />
        <Text style={styles.state}>{STATE_LABEL[avatarState] ?? '● ONLINE'}</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* financeiro */}
        <HudPanel title="GALACTIC POSITION" icon="◎">
          <View style={styles.kpiRow}>
            <View style={styles.kpi}>
              <Text style={styles.kpiLbl}>LUCRO MÊS</Text>
              <Text style={styles.kpiVal}>R${fmtBRL(balanco?.lucro_liquido ?? 0)}</Text>
            </View>
            <View style={styles.kpi}>
              <Text style={styles.kpiLbl}>ACUMULADO</Text>
              <Text style={[styles.kpiVal, { color: Colors.teal }]}>
                R${fmtBRL(balanco?.acumulado ?? 0)}
              </Text>
            </View>
          </View>
          <Text style={styles.metaLbl}>META MENSAL — R$5.000,00</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${balanco?.percentual ?? 0}%` }]} />
          </View>
          <Text style={styles.metaPct}>{balanco?.percentual ?? 0}%</Text>
        </HudPanel>

        {/* system health */}
        <HudPanel title="SYSTEM HEALTH" icon="▣">
          {[
            { label: 'API',  ok: apiOnline, color: Colors.teal },
            { label: 'WS',   ok: wsOnline,  color: Colors.lime },
            { label: 'N8N',  ok: true,       color: Colors.amber },
          ].map((row) => (
            <View key={row.label} style={styles.sysRow}>
              <Text style={styles.sysLbl}>{row.label}</Text>
              <View style={styles.sysTrack}>
                <View style={[styles.sysFill, { width: row.ok ? '100%' : '0%', backgroundColor: row.color }]} />
              </View>
              <Text style={[styles.sysPct, { color: row.color }]}>{row.ok ? 'OK' : 'OFF'}</Text>
            </View>
          ))}
          {/* pills */}
          <View style={styles.pillRow}>
            <Text style={[styles.pill, apiOnline ? styles.pillOk : styles.pillOff]}>API</Text>
            <Text style={[styles.pill, wsOnline  ? styles.pillOk : styles.pillOff]}>WS</Text>
            <Text style={[styles.pill, styles.pillWarn]}>N8N CLOUD</Text>
          </View>
        </HudPanel>

        {/* feed */}
        <HudPanel title="NAVIGATIONAL CHART" icon="▲">
          {vendas.length === 0 ? (
            <Text style={styles.empty}>AGUARDANDO TRANSAÇÕES...</Text>
          ) : (
            vendas.slice(0, 5).map((v) => (
              <View key={v.id} style={styles.feedItem}>
                <Text style={styles.feedIcon}>💸</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.feedDesc} numberOfLines={1}>{v.descricao}</Text>
                  <Text style={styles.feedTime}>{new Date(v.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</Text>
                </View>
                <Text style={styles.feedVal}>R${fmtBRL(v.valor)}</Text>
              </View>
            ))
          )}
        </HudPanel>
      </ScrollView>

      {/* status bar */}
      <View style={styles.statusBar}>
        <Text style={styles.statusSeg}>⬡ <Text style={styles.statusVal}>POWER: {apiOnline ? 'OPTIMAL' : 'OFFLINE'}</Text></Text>
        <Text style={styles.statusSeg}>◎ <Text style={styles.statusVal}>SHIELDS: {wsOnline ? 'ACTIVE' : 'SYNC'}</Text></Text>
        <Text style={styles.statusSeg}>◈ <Text style={styles.statusVal}>CLOAK: CLOUD</Text></Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:          { flex: 1, backgroundColor: Colors.bg },
  hero:          { alignItems: 'center', paddingTop: Spacing.xl, paddingBottom: Spacing.md },
  state:         { fontFamily: Fonts.heading, fontSize: 9, letterSpacing: 2.5, color: Colors.teal, marginTop: Spacing.xs },
  scroll:        { flex: 1 },
  scrollContent: { padding: Spacing.md, paddingBottom: Spacing.xl },

  kpiRow:        { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  kpi:           { flex: 1, backgroundColor: 'rgba(0,200,180,0.07)', borderWidth: 1, borderColor: 'rgba(0,200,180,0.25)', padding: Spacing.sm },
  kpiLbl:        { fontFamily: Fonts.heading, fontSize: 7, letterSpacing: 1.5, color: Colors.tealDim, marginBottom: 3 },
  kpiVal:        { fontFamily: Fonts.heading, fontSize: 15, fontWeight: '700', color: Colors.tealHi },

  metaLbl:       { fontFamily: Fonts.mono, fontSize: 8, letterSpacing: 1.5, color: Colors.tealDim, marginBottom: 4 },
  progressTrack: { height: 6, backgroundColor: 'rgba(0,200,180,0.12)', borderWidth: 1, borderColor: 'rgba(0,200,180,0.3)', marginBottom: 3 },
  progressFill:  { height: '100%', backgroundColor: Colors.teal },
  metaPct:       { fontFamily: Fonts.mono, fontSize: 9, color: Colors.teal },

  sysRow:        { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: 5 },
  sysLbl:        { fontFamily: Fonts.mono, fontSize: 9, color: Colors.tealDim, width: 32 },
  sysTrack:      { flex: 1, height: 7, backgroundColor: 'rgba(0,200,180,0.1)', borderWidth: 1, borderColor: 'rgba(0,200,180,0.2)', overflow: 'hidden' },
  sysFill:       { height: '100%' },
  sysPct:        { fontFamily: Fonts.mono, fontSize: 9, width: 28, textAlign: 'right' },

  pillRow:       { flexDirection: 'row', gap: 5, marginTop: Spacing.sm, flexWrap: 'wrap' },
  pill:          { fontFamily: Fonts.mono, fontSize: 8, letterSpacing: 1, paddingHorizontal: 7, paddingVertical: 2, borderWidth: 1 },
  pillOk:        { borderColor: Colors.lime,  color: Colors.lime },
  pillOff:       { borderColor: Colors.red,   color: Colors.red },
  pillWarn:      { borderColor: Colors.amber, color: Colors.amber },

  feedItem:      { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: 'rgba(0,200,180,0.1)' },
  feedIcon:      { fontSize: 15 },
  feedDesc:      { fontFamily: Fonts.mono, fontSize: 11, color: Colors.tealHi },
  feedTime:      { fontFamily: Fonts.mono, fontSize: 9,  color: Colors.tealDim },
  feedVal:       { fontFamily: Fonts.heading, fontSize: 11, color: Colors.lime },
  empty:         { fontFamily: Fonts.mono, fontSize: 9, color: Colors.tealDim, textAlign: 'center', padding: Spacing.md, opacity: 0.5 },

  statusBar:     { flexDirection: 'row', borderTopWidth: 1, borderTopColor: 'rgba(0,200,180,0.4)', backgroundColor: 'rgba(0,3,10,0.95)', paddingVertical: 5, paddingHorizontal: Spacing.md, justifyContent: 'space-around' },
  statusSeg:     { fontFamily: Fonts.mono, fontSize: 8, color: Colors.tealDim },
  statusVal:     { color: Colors.teal },
});
