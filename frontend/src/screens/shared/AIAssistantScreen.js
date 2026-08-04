import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { api } from '../../api/client';
import { Colors, Typography, Spacing, Radius } from '../../utils/theme';
import Button from '../../components/common/Button';

const AIAssistantScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'ai',
      text: 'Hello! I am RedDrop AI Assistant 🤖. How can I help you today? You can ask about donor eligibility, tattoo deferrals, blood group compatibility, or donation intervals!'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMsg = { id: Date.now().toString(), sender: 'user', text: inputText };
    setMessages(prev => [...prev, userMsg]);
    const query = inputText;
    setInputText('');
    setLoading(true);

    try {
      const response = await api.post('/v2/ai/chat', { message: query });
      if (response.data?.success) {
        const aiAnswer = response.data.data.answer;
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), sender: 'ai', text: aiAnswer }]);
      }
    } catch (err) {
      console.error('AI query error:', err.message);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: 'I am currently unable to reach the AI server. Please make sure you are connected to the network and try again.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Health Assistant 🩸🤖</Text>
        <Text style={styles.subtitle}>Instant answers for donor eligibility & compatibility</Text>
      </View>

      <ScrollView contentContainerStyle={styles.chatContent}>
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.messageBubble,
              msg.sender === 'user' ? styles.userBubble : styles.aiBubble
            ]}
          >
            <Text style={styles.messageText}>{msg.text}</Text>
          </View>
        ))}
        {loading && (
          <View style={[styles.messageBubble, styles.aiBubble]}>
            <ActivityIndicator size="small" color={Colors.primary} />
          </View>
        )}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.textInput}
          placeholder="Ask a question (e.g. Can I donate after a tattoo?)"
          placeholderTextColor={Colors.textMuted}
          value={inputText}
          onChangeText={setInputText}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendIcon}>➔</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgDark },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.glassBorder },
  title: { fontSize: 22, fontFamily: Typography.heading, color: Colors.textPrimary },
  subtitle: { fontSize: 13, color: Colors.textMuted, marginTop: 2, fontFamily: Typography.body },
  chatContent: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  messageBubble: { maxWidth: '82%', borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md },
  aiBubble: { backgroundColor: Colors.bgCard, alignSelf: 'flex-start', borderWidth: 1, borderColor: Colors.glassBorder },
  userBubble: { backgroundColor: Colors.primary, alignSelf: 'flex-end' },
  messageText: { fontSize: 14, color: Colors.textPrimary, fontFamily: Typography.body, lineHeight: 20 },
  inputRow: { flexDirection: 'row', padding: Spacing.md, backgroundColor: Colors.bgCard, borderTopWidth: 1, borderTopColor: Colors.glassBorder, alignItems: 'center' },
  textInput: { flex: 1, height: 44, backgroundColor: Colors.bgDark, borderRadius: Radius.md, paddingHorizontal: Spacing.md, color: Colors.textPrimary, fontFamily: Typography.body, borderWidth: 1, borderColor: Colors.glassBorder },
  sendButton: { width: 44, height: 44, borderRadius: Radius.md, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginLeft: Spacing.sm },
  sendIcon: { fontSize: 18, color: Colors.white, fontFamily: Typography.heading }
});

export default AIAssistantScreen;
