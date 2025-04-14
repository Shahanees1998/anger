import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import InputField from '../components/InputField';
import ReusableButton from '../components/ReusableButton';
import Heading from "../components/Heading";
import CustomAlert from "../components/CustomAlert";
import InformationIcon from "../assets/information_icon.png";

const AdminSignIn = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});

  const handleSignIn = async () => {
    if (!email || !password) {
      setAlertConfig({
        icon: InformationIcon,
        title: "Error",
        message: "Please enter both email and password",
        onContinue: () => setAlertVisible(false),
      });
      setAlertVisible(true);
      return;
    }

    setLoading(true);
    try {
      console.log('Attempting admin sign in...');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('User authenticated:', userCredential.user.uid);

      // Check if user is admin
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      console.log('User document:', userDoc.exists() ? 'found' : 'not found');
      
      if (!userDoc.exists()) {
        throw new Error('User document not found');
      }

      const userData = userDoc.data();
      console.log('User data:', userData);

      if (!userData?.isAdmin) {
        throw new Error('Not authorized as admin');
      }

      console.log('Admin verification successful');
      setLoading(false);
      navigation.replace('AdminDashboard');

    } catch (error) {
      console.error('Admin signin error:', error);
      let message = 'Failed to sign in';
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        message = 'Invalid email or password';
      } else if (error.message === 'Not authorized as admin') {
        message = 'This account is not authorized as admin';
      } else if (error.message === 'User document not found') {
        message = 'Admin account not properly configured';
      }

      setAlertConfig({
        icon: InformationIcon,
        title: "Error",
        message,
        onContinue: () => setAlertVisible(false),
      });
      setAlertVisible(true);
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#5885AF", "#5885AF"]} style={styles.background}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#616161" />
        </TouchableOpacity>

        <Heading navigation={navigation} heading="Admin Login" />
        
        <InputField
          label="Email"
          placeholder="Enter admin email"
          value={email}
          onChangeText={setEmail}
        />

        <InputField
          label="Password"
          placeholder="Enter password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {loading ? (
          <ActivityIndicator size="large" color="#fff" style={styles.loader} />
        ) : (
          <ReusableButton text="Login as Admin" onPress={handleSignIn} />
        )}

        <CustomAlert
          visible={alertVisible}
          onClose={() => setAlertVisible(false)}
          {...alertConfig}
        />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  loader: {
    marginVertical: 20,
  },
});

export default AdminSignIn; 