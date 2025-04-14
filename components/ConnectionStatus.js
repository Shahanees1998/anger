import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { checkFirestoreConnection } from '../utils/firebaseUtils';

const ConnectionStatus = () => {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      const connected = await checkFirestoreConnection();
      setIsConnected(connected);
    };

    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds
    checkConnection(); // Initial check

    return () => clearInterval(interval);
  }, []);

  if (isConnected) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Database connection lost. Retrying...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ff4444',
    padding: 10,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
  },
  text: {
    color: 'white',
    textAlign: 'center',
  },
});

export default ConnectionStatus; 