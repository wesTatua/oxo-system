import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, RefreshControl, Alert } from 'react-native';
import { useOxoStore } from '../../core/loop/oxoCoreLoop';
import { HudPanel } from '../components/panels/HudPanel';
import { agendaRepo } from '../../data/api/repositories';
import { Colors, Fonts, Spacing } from '../theme';

const fmtBRL = (v: number) =>
  v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function AgendaScreen() {
  const { agenda, setAgenda } = useOxoStore();
  const [refreshing, setRefreshing] = React.useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [novaData, setNovaData] = useState('');
  const [novaHora, setNovaHora] = useState('');
  const [salvando, setSalvando] = useState(false);

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

  const abrirEdicao = (id: string, data: string, hora: string) => {
    setEditandoId(id);
    setNovaData(data);
    setNovaHora(hora);
  };

  const salvarEdicao = async () => {
    if (!editandoId) return;
    setSalvando(true);
    try {
      await agendaRepo.editar(editandoId, { data: novaData, hora: novaHora });
      setEditandoId(null);
      await load();
    } catch (e: any) {
      Alert.alert('Falha ao editar', e?.response?.data?.erro ?? e?.message ?? 'Erro desconhecido');
    } finally {
      setSalvando(false);
    }
  };

  const cancelarAgendamento = (id: string) => {
    Alert.alert('Cancelar agendamento', 'Confirma o cancelamento? Isso libera o slot na agenda.', [
      { text: 'Voltar', style: 'cancel' },
      {
        text: 'Cancelar agendamento',
        style: 'destructive',
        onPress: async () => {
          try {
            await agendaRepo.cancelar(id);
            await load();
          } catch (e: any) {
            Alert.alert('Falha ao cancelar', e?.response?.data?.erro ?? e?.message ?? 'Erro desconhecido');
          }
        },
      },
    ]);
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
            <View key={a.id ?? i} style={styles.itemWrap}>
              <View style={styles.item}>
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

              {editandoId === a.id ? (
                <View style={styles.editBox}>
                  <View style={styles.editRow}>
                    <TextInput
                      style={[styles.editInp, { flex: 1 }]}
                      value={novaData}
                      onChangeText={setNovaData}
                      placeholder="AAAA-MM-DD"
                      placeholderTextColor={Colors.tealDim}
                    />
                    <TextInput
                      style={[styles.editInp, { width: 70 }]}
                      value={novaHora}
                      onChangeText={setNovaHora}
                      placeholder="HH:MM"
                      placeholderTextColor={Colors.tealDim}
                    />
                  </View>
                  <View style={styles.editActions}>
                    <TouchableOpacity onPress={() => setEditandoId(null)} style={styles.actionBtn}>
                      <Text style={styles.actionTxt}>VOLTAR</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={salvarEdicao} disabled={salvando} style={[styles.actionBtn, styles.actionBtnOk]}>
                      <Text style={[styles.actionTxt, { color: Colors.lime }]}>{salvando ? 'SALVANDO...' : 'SALVAR'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.editActions}>
                  <TouchableOpacity onPress={() => abrirEdicao(a.id, a.data, a.hora)} style={styles.actionBtn}>
                    <Text style={styles.actionTxt}>EDITAR</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => cancelarAgendamento(a.id)} style={[styles.actionBtn, styles.actionBtnWarn]}>
                    <Text style={[styles.actionTxt, { color: Colors.amber }]}>CANCELAR</Text>
                  </TouchableOpacity>
                </View>
              )}
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

  itemWrap:  { borderBottomWidth: 1, borderBottomColor: 'rgba(0,200,180,0.1)', paddingBottom: 6 },
  item:      { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 8 },
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

  editActions:  { flexDirection: 'row', gap: Spacing.sm, marginTop: 4 },
  actionBtn:    { borderWidth: 1, borderColor: Colors.border, paddingVertical: 4, paddingHorizontal: Spacing.sm },
  actionBtnOk:  { borderColor: 'rgba(100,220,80,0.6)' },
  actionBtnWarn:{ borderColor: 'rgba(255,170,0,0.6)' },
  actionTxt:    { fontFamily: Fonts.heading, fontSize: 8, letterSpacing: 1, color: Colors.tealDim, fontWeight: '700' },

  editBox:   { marginTop: 4 },
  editRow:   { flexDirection: 'row', gap: Spacing.sm },
  editInp:   { backgroundColor: 'rgba(0,200,180,0.05)', borderWidth: 1, borderColor: 'rgba(0,200,180,0.35)', color: Colors.tealHi, fontFamily: Fonts.mono, fontSize: 11, paddingHorizontal: Spacing.sm, paddingVertical: 6 },
});
