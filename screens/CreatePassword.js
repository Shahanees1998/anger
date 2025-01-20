import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import Heading from "../components/Heading";
import TextBlock from "../components/TextBlock";
import InputField from "../components/InputField";
import ReusableButton from "../components/ReusableButton";
import CustomAlert from "../components/CustomAlert";
import InformationIcon from "../assets/information_icon.png";

const CreatePassword = ({ navigation, route }) => {
  const email = route.params?.email || '';
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});

  const handleContinue = async () => {
    // Validation checks
    if (!password || !confirmPassword) {
      setAlertConfig({
        icon: InformationIcon,
        title: "Error",
        message: "Both password fields are required.",
        onContinue: () => setAlertVisible(false),
      });
      setAlertVisible(true);
      return;
    }

    if (password !== confirmPassword) {
      setAlertConfig({
        icon: InformationIcon,
        title: "Error",
        message: "Passwords do not match.",
        onContinue: () => setAlertVisible(false),
      });
      setAlertVisible(true);
      return;
    }

    setLoading(true);
    try {
      // Get stored user data
      const tempUserData = await AsyncStorage.getItem('tempUserData');
      if (!tempUserData) {
        throw new Error('No user data found');
      }
      const userData = JSON.parse(tempUserData);
      console.log('Creating user with data:', userData);

      // Create authentication account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        password
      );
      console.log('Auth account created:', userCredential.user.uid);
      navigation.replace("HomeScreen");
      // Create user document
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const userDoc = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        isAdmin: false,
        userType: 'regular',
        profile: {
          phone: '',
          gender: '',
          joinDate: new Date().toISOString()
        }
      };

      await setDoc(userDocRef, userDoc);
      console.log('User document created in Firestore');

      // Clear temporary storage
      await AsyncStorage.removeItem('tempUserData');

      // Navigate to home screen
      

    } catch (error) {
      console.error('Error creating user:', error);
      let errorMessage = "Failed to create account";
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Email already in use";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password is too weak";
      }

      setAlertConfig({
        icon: InformationIcon,
        title: "Error",
        message: errorMessage,
        onContinue: () => setAlertVisible(false),
      });
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#5885AF", "#5885AF"]}
      style={styles.background}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <View style={styles.container}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color="#616161" />
        </TouchableOpacity>
        <Heading navigation={navigation} heading="Create Password" />
        <TextBlock text={`Creating a password for ${email}`} />
        <InputField
          label="Password"
          placeholder="Enter your password"
          secureTextEntry={true}
          value={password}
          onChangeText={setPassword}
        />
        <InputField
          label="Confirm Password"
          placeholder="Confirm your password"
          secureTextEntry={true}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        {loading ? (
          <ActivityIndicator size="large" color="#fff" style={styles.loader} />
        ) : (
          <ReusableButton text="Continue" onPress={handleContinue} />
        )}
        <View style={{ flex: 1 }}></View>

        {/* Custom Alert */}
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
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
    justifyContent: "flex-end",
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
    marginTop: 20,
  },
});

export default CreatePassword;
