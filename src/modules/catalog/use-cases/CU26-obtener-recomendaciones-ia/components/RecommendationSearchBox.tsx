import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface RecommendationSearchBoxProps {
  prompt: string;
  loading: boolean;
  onChangePrompt: (prompt: string) => void;
  onSubmit: () => void;
}

export const RecommendationSearchBox: React.FC<RecommendationSearchBoxProps> = ({
  prompt,
  loading,
  onChangePrompt,
  onSubmit,
}) => (
  <View style={styles.container}>
    <TextInput
      style={styles.input}
      value={prompt}
      onChangeText={onChangePrompt}
      placeholder="Busco algo casual para primavera..."
      placeholderTextColor="#9CA3AF"
      returnKeyType="search"
      onSubmitEditing={onSubmit}
    />
    <TouchableOpacity style={styles.button} onPress={onSubmit} disabled={loading}>
      <Text style={styles.buttonText}>{loading ? '...' : 'IA'}</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  input: {
    flex: 1,
    minHeight: 42,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  button: {
    minWidth: 52,
    minHeight: 42,
    borderRadius: 10,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
});
