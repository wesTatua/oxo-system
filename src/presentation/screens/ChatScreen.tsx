import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useOxoStore } from '../../core/loop/oxoCoreLoop';
import { HudPanel } from '../components/panels/HudPanel';
import { chatRepo } from '../../data/api/repositories';
import { Colors, Fonts, Spacing } from '../theme';
import type { ChatMessage } from '../../domain/entities';

export function ChatScreen() {
  const { mensagens, addMensagem, setAvatarState } = useOxoStore();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList>(null);

  async function enviar() {
    const txt = input.trim();
    if (!txt || loading) return;
    setInput('');

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      tipo: 'user',
      texto: txt,
      timestamp: new Date().toISOString(),
    };
    addMensagem(userMsg);
    setLoading(true);
    setAvatarState('PROCESSANDO');

    try {
      const resposta = await chatRepo.enviarMensagem(txt);
      addMensagem({
        id: (Date.now() + 1).toString(),
        tipo: 'oxo',
        texto: resposta,
        timestamp: new Date().toISOString(),
      });
    } catch {
      addMensagem({ id: (Date.now() + 1).toString(), tipo: 'oxo', texto: 'Erro de conexão. Tente novamente.', timestamp: new Date().toISOString() });
    } finally {
      setLoading(false);
      setAvatarState('ONLINE');
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <HudPanel title="COMMUNICATIONS HUB" icon="◎" flex style={{ margin: Spacing.md }}>
        <FlatList
          ref={listRef}
          data={mensagens}
          keyExtractor={(m) => m.id}
          style={styles.list}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item }) => (
            <View style={[styles.bubble, item.tipo === 'user' ? styles.bubbleUser : styles.bubbleOxo]}>
              <Text style={styles.sender}>{item.tipo === 'user' ? 'VOCÊ' : 'OXO //'}</Text>
              <Text style={[styles.text, item.tipo === 'user' && styles.textUser]}>{item.texto}</Text>
            </View>
          )}
        />

        {loading && (
          <View style={styles.typingRow}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={styles.dot} />
            ))}
            <Text style={styles.typingLbl}>OXO PROCESSANDO</Text>
          </View>
        )}

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Fala com o OXO..."
            placeholderTextColor={Colors.tealDim}
            onSubmitEditing={enviar}
            returnKeyType="send"
            editable={!loading}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={enviar} disabled={loading}>
            <Text style={styles.sendTxt}>▶</Text>
          </TouchableOpacity>
        </View>
      </HudPanel>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root:       { flex: 1, backgroundColor: Colors.bg },
  list:       { flex: 1, maxHeight: 420 },
  bubble:     { marginBottom: Spacing.sm },
  bubbleOxo:  {},
  bubbleUser: { alignItems: 'flex-end' },
  sender:     { fontFamily: Fonts.mono, fontSize: 8, letterSpacing: 2, color: Colors.tealDim, marginBottom: 2 },
  text:       { fontFamily: Fonts.mono, fontSize: 12, color: Colors.tealHi, lineHeight: 18 },
  textUser:   { color: 'rgba(200,255,250,0.75)' },

  typingRow:  { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4 },
  dot:        { width: 5, height: 5, borderRadius: 3, backgroundColor: Colors.teal },
  typingLbl:  { fontFamily: Fonts.mono, fontSize: 8, letterSpacing: 2, color: Colors.tealDim },

  inputRow:   { flexDirection: 'row', gap: Spacing.xs, marginTop: Spacing.sm },
  input:      { flex: 1, backgroundColor: 'rgba(0,200,180,0.06)', borderWidth: 1, borderColor: 'rgba(0,200,180,0.4)', color: Colors.tealHi, fontFamily: Fonts.mono, fontSize: 12, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs + 2 },
  sendBtn:    { backgroundColor: 'rgba(0,200,180,0.12)', borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.md, justifyContent: 'center' },
  sendTxt:    { color: Colors.teal, fontFamily: Fonts.heading, fontSize: 12 },
});
