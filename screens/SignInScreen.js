import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage"; // AsyncStorage for local data storage
import Heading from "../components/Heading";
import TextBlock from "../components/TextBlock";
import ReusableButton from "../components/ReusableButton";
import InputField from "../components/InputField";
import Google from "../assets/google.png";
import Facebook from "../assets/facebook.png";
import { signInWithEmailAndPassword, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { auth, db, googleProvider, facebookProvider } from "../firebase";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import DataService from '../services/DataService';

const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      // Authenticate
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      
      // Save auth state for offline access
      await DataService.saveAuthState(userCredential.user);

      // Try to get user data in background
      DataService.getUserData(userCredential.user.uid).then(userData => {
        if (userData) {
          console.log('User data loaded');
        }
      }).catch(error => {
        console.error('Background data load failed:', error);
      });

      // Navigate immediately
      navigation.replace("HomeScreen");

    } catch (error) {
      console.error('Login error:', error.code, error.message);
      let errorMessage = "Invalid email or password";
      
      // Try offline login if network error
      if (error.code === 'auth/network-request-failed') {
        try {
          const savedAuth = await DataService.getAuthState();
          if (savedAuth && savedAuth.email === email.trim()) {
            navigation.replace("HomeScreen");
            return;
          }
          errorMessage = "Network error and no saved login found";
        } catch (offlineError) {
          console.error('Offline login failed:', offlineError);
          errorMessage = "Network error. Please check your connection";
        }
      }
      
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = "Invalid email format";
          break;
        case 'auth/user-not-found':
          errorMessage = "No account found with this email";
          break;
        case 'auth/wrong-password':
          errorMessage = "Incorrect password";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Too many attempts. Please try again later";
          break;
        default:
          errorMessage = "Failed to sign in. Please try again";
      }
      
      Alert.alert("Error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user document exists
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      console.log(userDoc);
      if (!userDoc.exists()) {
        // Create user document for Google sign-in
        await setDoc(doc(db, 'users', user.uid), {
          firstName: user.displayName?.split(' ')[0] || '',
          lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
          email: user.email,
          createdAt: serverTimestamp(),
          disabled: false
        });
      }

      navigation.navigate("HomeScreen");
    } catch (error) {
      Alert.alert("Error", "Failed to sign in with Google");
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      // Similar to Google sign-in handling
      navigation.navigate("HomeScreen");
    } catch (error) {
      Alert.alert("Error", "Failed to sign in with Facebook");
    }
  };

  return (
    <LinearGradient
      colors={["#5885AF", "#5885AF"]}
      style={styles.background}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.container}>
            {/* Back Button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={20} color="#616161" />
            </TouchableOpacity>

            <Heading navigation={navigation} heading="Welcome to AngerManager" />
            <TextBlock text="Enter your email and password to log in" />

            <InputField
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
            />
            <InputField
              label="Password"
              placeholder="Enter your password"
              secureTextEntry={true}
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              onPress={() => navigation.navigate("ForgetPassword")}
            >
              <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </TouchableOpacity>

            {loading ? (
              <ActivityIndicator size="large" color="#fff" style={styles.loader} />
            ) : (
              <ReusableButton text="Sign In" onPress={handleLogin} />
            )}

            <View style={styles.dividerContainer}>
              <View style={styles.line} />
              <Text style={styles.orText}>OR</Text>
              <View style={styles.line} />
            </View>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleGoogleSignIn}
            >
              <Image source={Google} style={styles.googleIcon} />
              <Text style={styles.secondaryButtonText}>Continue with Google</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleFacebookSignIn}
            >
              <Image source={Facebook} style={styles.googleIcon} />
              <Text style={styles.secondaryButtonText}>Continue with Facebook</Text>
            </TouchableOpacity>

            {/* Signup Text */}
            <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
              <Text style={styles.signupText}>
                Don’t have an account?{" "}
                <Text style={styles.signupLink}>Sign Up</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.adminLink}
              onPress={() => navigation.navigate("AdminSignIn")}
            >
              <Text style={styles.adminText}>Admin Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  forgotPassword: {
    fontSize: 12,
    color: "#274472",
    textAlign: "right",
    marginVertical: 10,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#fff",
  },
  orText: {
    marginHorizontal: 10,
    fontSize: 12,
    fontWeight: "400",
    color: "#FFFFFF",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#41729F",
    borderRadius: 10,
    paddingVertical: 12,
    marginBottom: 20,
  },
  googleIcon: {
    marginRight: 10,
    height: 18,
    width: 18,
  },
  secondaryButtonText: {
    fontSize: 14,
    color: "#FFFFFF80",
    fontWeight: "400",
  },
  signupText: {
    textAlign: "center",
    color: "#FFFFFF",
    fontSize: 12,
    marginTop: 10,
  },
  signupLink: {
    color: "#274472",
    fontWeight: "600",
  },
  adminLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  adminText: {
    color: '#274472',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  loader: {
    marginTop: 20,
  },
});

export default SignInScreen;
