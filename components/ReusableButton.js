import React from 'react';
import { Text, TouchableOpacity , StyleSheet } from 'react-native';

const ReusableButton = ({ text, onPress }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%',
    backgroundColor: '#274472',
    paddingVertical: 15, // Adjust for desired height
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius:10
  },
  buttonText: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 14.52,
    letterSpacing: -0.01,
    textAlign: 'center',
    color: '#FFFFFF',
  },
});

export default ReusableButton;
