import React, { useState, useRef, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { quickSuggestionChips } from '../constants/mockData';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface Props {
  visible: boolean;
  onClose: () => void;
}

const AIChatSheet: React.FC<Props> = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', text: "Hi! I'm your AI architect assistant. Tell me how you'd like to modify the floor plan.", sender: 'ai', timestamp: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = useCallback((text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), text: text.trim(), sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: `I'll update the floor plan to "${text.trim()}". The changes have been applied — check the updated plan above! 🏗️`,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 2000);
  }, []);

  if (!visible) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={[styles.handle, { backgroundColor: colors.border }]} />
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>💬 Refine with AI</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={[styles.close, { color: colors.textMuted }]}>✕</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        style={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        renderItem={({ item }) => (
          <View style={[styles.msgRow, item.sender === 'user' && styles.msgRowUser]}>
            <View style={[styles.bubble, {
              backgroundColor: item.sender === 'user' ? colors.primary : colors.card,
              borderColor: item.sender === 'user' ? colors.primary : colors.borderLight,
            }]}>
              <Text style={[styles.msgText, { color: item.sender === 'user' ? '#fff' : colors.text }]}>
                {item.text}
              </Text>
            </View>
          </View>
        )}
      />

      {isTyping && (
        <View style={styles.typingRow}>
          <Text style={[styles.typingText, { color: colors.textMuted }]}>AI is thinking...</Text>
        </View>
      )}

      {/* Quick chips */}
      <FlatList
        horizontal
        data={quickSuggestionChips}
        keyExtractor={item => item}
        showsHorizontalScrollIndicator={false}
        style={styles.chips}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.chip, { borderColor: colors.border, backgroundColor: colors.card }]} onPress={() => sendMessage(item)}>
            <Text style={[styles.chipText, { color: colors.primary }]}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.inputRow, { borderTopColor: colors.border }]}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
            placeholder="Type a refinement..."
            placeholderTextColor={colors.textMuted}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => sendMessage(input)}
          />
          <TouchableOpacity style={[styles.sendBtn, { backgroundColor: colors.primary }]} onPress={() => sendMessage(input)}>
            <Text style={styles.sendText}>→</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '70%', borderTopLeftRadius: 24, borderTopRightRadius: 24, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  title: { fontSize: 18, fontFamily: 'Syne_700Bold' },
  close: { fontSize: 20, padding: 4 },
  messageList: { flex: 1, paddingHorizontal: 16 },
  msgRow: { marginBottom: 8, alignItems: 'flex-start' },
  msgRowUser: { alignItems: 'flex-end' },
  bubble: { maxWidth: '80%', padding: 12, borderRadius: 16, borderWidth: 1 },
  msgText: { fontSize: 14, fontFamily: 'DMSans_400Regular', lineHeight: 20 },
  typingRow: { paddingHorizontal: 16, paddingBottom: 4 },
  typingText: { fontSize: 12, fontStyle: 'italic' },
  chips: { maxHeight: 44, paddingVertical: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 12, fontFamily: 'DMSans_500Medium' },
  inputRow: { flexDirection: 'row', gap: 8, padding: 12, borderTopWidth: 1 },
  input: { flex: 1, height: 44, borderRadius: 22, paddingHorizontal: 16, borderWidth: 1, fontSize: 14 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  sendText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
});

export default AIChatSheet;
