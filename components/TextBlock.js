import React from 'react';
import { Text, StyleSheet } from 'react-native';

const TextBlock = ({ text }) => {
  return <Text style={styles.text}>{text}</Text>;
};

const styles = StyleSheet.create({
  text: {
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Inter',
    color: '#FFFFFF',
    marginBottom: 20,
  },
});

export default TextBlock;
