import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export interface ButtonProps {
  label: string;
  onPress: () => void;
}

export function Button({ label, onPress }: ButtonProps) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.text}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  text: {
    color: '#fff',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
  },
});
