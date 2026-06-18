import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useOxoStore } from '../../core/loop/oxoCoreLoop';
import { HudPanel } from '../components/panels/HudPanel';
import { pixRepo } from '../../data/api/repositories';
import { Colors, Fonts, Spacing } from '../theme';

const fmtBRL = (v: number) =>
  v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function VendasScreen() {
  const { vendas } = useOxoStore();
  const [valor, setValor]   = useState('');
  const [email, setEmail]   = useState('');
  const [desc, setDesc]     = useState('');
  const [pixCode, setPixCode] = useState('');
  const [loading, setLoading] = useState(false);

  async function gerarPix() {
    const v = parseFloat(valor.replace(',', '.'));
    if (!v || v <= 0) { Alert.alert('Informe o valor.'); return; }
    if (!email)       { Alert.alert('Informe o e-mail.'); return; }
    setLoading(true);
    try {
      const r = await pixRepo.gerar({ valor: v, email, descricao: desc || 'OXO PIX', titulo: desc || 'OXO PIX' });
      if (r.erro) { Alert.alert('Erro', r.erro); return; }
      setPixCode(r.qr_code);
    } catch (e: any) {
      Alert.alert('Falha', e?.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>

      <HudPanel title="NAVIGATIONAL CHART" icon="▲">
        {vendas.length === 0 ? (
          <Text style={styles.empty}>AGUARDANDO TRANSAÇÕES...</Text>
        ) : (
          vendas.map((v) => (
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

      <HudPanel title="GERAR PIX" icon="⚡">
        {[
          { label: 'VALOR (R$)',       value: valor,  set: setValor,  ph: '0,00',                kb: 'numeric'  as const },
          { label: 'EMAIL DO CLIENTE', value: email,  set: setEmail,  ph: 'cliente@email.com',   kb: 'email-address' as const },
          { label: 'DESCRIÇÃO',        value: desc,   set: setDesc,   ph: 'Tatuagem / Cosmético', kb: 'default' as const },
        ].map((f) => (
          <View key={f.label} style={styles.formG}>
            <Text style={styles.formLbl}>{f.label}</Text>
            <TextInput
              style={styles.formInp}
              value={f.value}
              onChangeText={f.set}
              placeholder={f.ph}
              placeholderTextColor={Colors.tealDim}
              keyboardType={f.kb}
              autoCapitalize="none"
            />
          </View>
        ))}

        <TouchableOpacity style={[styles.btn, styles.btnGreen]} onPress={gerarPix} disabled={loading}>
          <Text style={[styles.btnTxt, { color: Colors.lime }]}>{loading ? '⏳ GERANDO...' : '▶ GERAR PIX'}</Text>
        </TouchableOpacity>

        {pixCode !== '' && (
          <View style={styles.pixResult}>
            <Text style={styles.formLbl}>CÓDIGO PIX</Text>
            <Text style={styles.pixCode} selectable>{pixCode}</Text>
          </View>
        )}
      </HudPanel>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root:       { flex: 1, backgroundColor: Colors.bg },
  content:    { padding: Spacing.md, paddingBottom: Spacing.xxl },

  feedItem:   { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: 'rgba(0,200,180,0.1)' },
  feedIcon:   { fontSize: 15 },
  feedDesc:   { fontFamily: Fonts.mono, fontSize: 11, color: Colors.tealHi },
  feedTime:   { fontFamily: Fonts.mono, fontSize: 9,  color: Colors.tealDim },
  feedVal:    { fontFamily: Fonts.heading, fontSize: 11, color: Colors.lime },
  empty:      { fontFamily: Fonts.mono, fontSize: 9, color: Colors.tealDim, textAlign: 'center', padding: Spacing.md, opacity: 0.5 },

  formG:      { marginBottom: Spacing.sm },
  formLbl:    { fontFamily: Fonts.mono, fontSize: 8, letterSpacing: 2, color: Colors.tealDim, marginBottom: 3 },
  formInp:    { backgroundColor: 'rgba(0,200,180,0.05)', borderWidth: 1, borderColor: 'rgba(0,200,180,0.35)', color: Colors.tealHi, fontFamily: Fonts.mono, fontSize: 12, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs + 2 },

  btn:        { borderWidth: 1, borderColor: Colors.border, paddingVertical: Spacing.sm, alignItems: 'center', marginTop: Spacing.xs },
  btnGreen:   { borderColor: 'rgba(100,220,80,0.6)' },
  btnTxt:     { fontFamily: Fonts.heading, fontSize: 9, letterSpacing: 2, fontWeight: '700' },

  pixResult:  { marginTop: Spacing.md, padding: Spacing.sm, backgroundColor: 'rgba(0,200,180,0.06)', borderWidth: 1, borderColor: 'rgba(0,200,180,0.25)' },
  pixCode:    { fontFamily: Fonts.mono, fontSize: 10, color: Colors.tealHi, lineHeight: 16 },
});
