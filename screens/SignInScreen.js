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

const SignInScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    try {
      // Retrieve stored user data
      const storedUser = await AsyncStorage.getItem("userData");
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;

      if (parsedUser && parsedUser.email === email && parsedUser.password === password) {
        // Successful login
        await AsyncStorage.setItem("currentUserEmail", email); // Store the logged-in user's email
        Alert.alert("Success", "Login successful!");
        navigation.navigate("HomeScreen");
      } else {
        Alert.alert("Error", "Invalid email or password.");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while logging in.");
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

            <ReusableButton text="Log In" onPress={handleLogin} />

            <View style={styles.dividerContainer}>
              <View style={styles.line} />
              <Text style={styles.orText}>OR</Text>
              <View style={styles.line} />
            </View>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => console.log("Continue with Google Pressed")}
            >
              <Image source={Google} style={styles.googleIcon} />
              <Text style={styles.secondaryButtonText}>Continue with Google</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => console.log("Continue with Facebook Pressed")}
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
});

export default SignInScreen;
