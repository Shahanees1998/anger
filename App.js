import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Font from "expo-font";
import { View, ActivityIndicator } from "react-native";
import { auth, db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import SplashScreen from "./screens/SplashScreen";
import SignUpScreen from "./screens/SignUpScreen";
import SignInScreen from "./screens/SignInScreen";
import OTPVerification from "./screens/OTPVerification";
import CreatePassword from "./screens/CreatePassword";
import ForgetPassword from "./screens/ForgetPassword";
import RecoverPassword from "./screens/RecoverPassword";
import HomeScreen from "./screens/HomeScreen";
import Profile from "./screens/Profile";
import ChangePassword from "./screens/ChangePassword";
import SubmittedAnswers from "./screens/SubmittedAnswers";
import Knowledge from "./screens/Knowledge";
import SOS from "./screens/SOS";
import Thoughts from "./screens/Thoughts";
import Ready from "./screens/Ready";
import SOSMedication from "./screens/SOSMedication";
import Opinion from "./screens/Opinion";
import Body from "./screens/Body";
import Feelings from "./screens/Feelings";
import Needs from "./screens/Needs";
import AdminSignIn from "./screens/AdminSignIn";
import AdminDashboard from "./screens/AdminDashboard";
import setupAdmin from "./scripts/setupAdmin";

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    const initialize = async () => {
      try {
        console.log("Starting initialization...");

        // Load fonts
        await Font.loadAsync({
          "JotiOne-Regular": require("./assets/fonts/JotiOne-Regular.ttf"),
        });
        console.log("Fonts loaded");

        // Setup admin account
        console.log("Setting up admin...");
        await setupAdmin().catch((error) => {
          console.error("Admin setup error:", error);
        });
        console.log("Admin setup complete");
      } catch (error) {
        console.error("Initialization error:", error);
      }
    };

    initialize();
  }, []);

  return (
    <Stack.Navigator initialRouteName="Splash">
      <Stack.Screen
        name="Splash"
        component={SplashScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SignUp"
        component={SignUpScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SignIn"
        component={SignInScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OTPVerification"
        component={OTPVerification}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreatePassword"
        component={CreatePassword}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ForgetPassword"
        component={ForgetPassword}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RecoverPassword"
        component={RecoverPassword}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Profile"
        component={Profile}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePassword}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SubmittedAnswers"
        component={SubmittedAnswers}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Knowledge"
        component={Knowledge}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SOS"
        component={SOS}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Thoughts"
        component={Thoughts}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Ready"
        component={Ready}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SOSMedication"
        component={SOSMedication}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Opinion"
        component={Opinion}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Body"
        component={Body}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Feelings"
        component={Feelings}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Needs"
        component={Needs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AdminSignIn"
        component={AdminSignIn}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AdminDashboard"
        component={AdminDashboard}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
