import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
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

const HomeScreen = () => {
  return (
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
});

export default HomeScreen;
