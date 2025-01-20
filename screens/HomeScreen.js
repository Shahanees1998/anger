import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeTab from "./HomeTab";
import SettingsTab from "./SettingsTab";
import ProfileTab from "./ProfileTab";
import Center from "../assets/centeredIcon.png"
import IceBerg from "./IceBerg";
import Knowledge from "./Knowledge";
import KnowledgeHome from "./KnowldgeHome";
import SOSHome from "./SOSHome"
import Feelings from "./Feelings";
import Home from "../assets/Home.png";
import Document from "../assets/document.png";
import Iceberg from "../assets/iceberg_home.png";
import profile from "../assets/profile.png"
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import NetworkStatus from '../components/NetworkStatus';
import DataService from '../services/DataService';

// Placeholder components for tabs

const QuoteTab = () => (
  <View style={styles.centered}>
    <Text>Quote Tab</Text>
  </View>
);


const Tab = createBottomTabNavigator();

const CustomTabBarButton = ({ children, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.customButton}
      onPress={onPress}
    >
      {children}
    </TouchableOpacity>
  );
};

const HomeScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check Firebase auth first
        const user = auth.currentUser;
        
        // If no current user, try getting from offline storage
        if (!user) {
          const savedAuth = await DataService.getAuthState();
          if (!savedAuth) {
            navigation.replace('SignIn');
            return;
          }
        }

        // Load offline data if needed
        const userId = user?.uid || savedAuth?.uid;
        if (userId) {
          DataService.getUserData(userId).catch(console.error);
        }

        setLoading(false);
      } catch (error) {
        console.error('Auth check failed:', error);
        navigation.replace('SignIn');
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#5885AF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <NetworkStatus />
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            if (route.name === "Home") {
              return <Image source={Home} style={{ width: 40, height: 40, marginTop: 20 }} />;
            } else if (route.name === "KnowledgeHome") {
              return <Image source={Document} style={{ width: 40, height: 40, marginTop: 20 }} />;
            } else if (route.name === "Iceberg") {
              return <Image source={Iceberg} style={{ width: 40, height: 40, marginTop: 25 }} />;
            } else if (route.name === "ProfileTab") {
              return <Image source={profile} style={{ width: 40, height: 40, marginTop: 25 }} />;
            }
          },
          tabBarActiveTintColor: "#007AFF",
          tabBarInactiveTintColor: "gray",
          tabBarStyle: {
            backgroundColor: "#212121",
            height: 80,
            borderTopWidth: 0,
            paddingTop: 10
          },
          tabBarShowLabel: false,
        })}

      >
        <Tab.Screen name="Home" component={HomeTab} options={{ headerShown: false }} />
        <Tab.Screen name="KnowledgeHome" component={KnowledgeHome} options={{ headerShown: false }} />
        <Tab.Screen
          name="Central"
          component={SOSHome}
          options={{
            tabBarButton: (props) => (
              <CustomTabBarButton {...props}>
                <Image source={Center} size={50} />
              </CustomTabBarButton>
            ),
            headerShown: false
          }}

        />
        <Tab.Screen name="Iceberg" component={IceBerg} options={{ headerShown: false }} />
        <Tab.Screen name="ProfileTab" component={ProfileTab} options={{ headerShown: false }} />
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // Same as SignIn screen
  },
  customButton: {
    // Lift the central button
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
  },
});

export default HomeScreen;
