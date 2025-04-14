import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Heading from "../components/Heading";
import TextBlock from "../components/TextBlock";
import ReusableButton from "../components/ReusableButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomAlert from "../components/CustomAlert";
import Verification from "../assets/verification.png"

const OTPVerification = ({ navigation, route }) => {
  const { email } = route.params;
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = [];
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});

  const handleOtpChange = (value, index) => {
    const otpArray = [...otp];
    otpArray[index] = value;
    setOtp(otpArray);

    if (value && index < otp.length - 1) {
      const nextInput = index + 1;
      otpRefs[nextInput]?.focus();
    }
  };

  const handleContinue = async () => {
    const enteredOtp = otp.join(""); // Combine the OTP array into a single string

    if (enteredOtp.length < 6) {
      setAlertConfig({
        icon: "⚠️",
        title: "Error",
        message: "Please enter a valid 6-digit OTP.",
        onContinue: () => setAlertVisible(false),
      });
      setAlertVisible(true);
      return;
    }

    try {
      const signupData = JSON.parse(await AsyncStorage.getItem("signupData"));

      if (signupData?.email === email && signupData?.otp === enteredOtp) {
        setAlertConfig({
          icon: Verification,
          title: "Verification Successful",
          message: "Your OTP code has been successfully verified.",
          onContinue: () => {
            setAlertVisible(false);
            navigation.navigate("CreatePassword", { email });
          },
        });
        setAlertVisible(true);
      } else {
        setAlertConfig({
          icon: "⚠️",
          title: "Error",
          message: "Invalid OTP. Please try again.",
          onContinue: () => setAlertVisible(false),
        });
        setAlertVisible(true);
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setAlertConfig({
        icon: "⚠️",
        title: "Error",
        message: "Failed to verify OTP. Please try again.",
        onContinue: () => setAlertVisible(false),
      });
      setAlertVisible(true);
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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color="#616161" />
        </TouchableOpacity>
        <Heading navigation={navigation} heading="OTP Verification" />
        <TextBlock text="Please enter your verification code sent to your email account." />
        <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
    <TextInput
      key={index}
      style={styles.otpInput}
      value={digit}
      onChangeText={(value) => handleOtpChange(value, index)}
      keyboardType="number-pad"
      maxLength={1}
      ref={(ref) => (otpRefs[index] = ref)}
      onKeyPress={({ nativeEvent }) => {
        if (nativeEvent.key === "Backspace") {
          if (!digit && index > 0) {
            // Move focus to the previous input field
            const previousInput = index - 1;
            otpRefs[previousInput]?.focus();
            const otpArray = [...otp];
            otpArray[previousInput] = ""; // Clear the previous field value
            setOtp(otpArray); // Update state
          } else {
            // Clear the current field if it's not empty
            const otpArray = [...otp];
            otpArray[index] = "";
            setOtp(otpArray); // Update state
          }
        }
      }}
    />
  ))}
        </View>
        <ReusableButton text="Continue" onPress={handleContinue} />
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
    paddingVertical: 30,
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
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 30,
  },
  otpInput: {
    width: 50,
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FFFFFF80",
    backgroundColor: "#41729F",
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 18,
  },
});

export default OTPVerification;
