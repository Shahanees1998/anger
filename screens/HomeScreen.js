import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeTab from "./HomeTab";
import AdminDashboard from "./AdminDashboard";
import SettingsTab from "./SettingsTab";
import ProfileTab from "./ProfileTab";
import Center from "../assets/centeredIcon.png";
import IceBerg from "./IceBerg";
import KnowledgeHome from "./KnowldgeHome";
import Knowledge from "./Knowledge";
import SOS from "./SOS";
import SOSHome from "./SOSHome";
import Feelings from "./Feelings";
import Home from "../assets/Home.png";
import Document from "../assets/document.png";
import Iceberg from "../assets/iceberg_home.png";
import profile from "../assets/profile.png";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import NetworkStatus from "../components/NetworkStatus";
import DataService from "../services/DataService";
import UsersListing from "./UsersListing";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import Entypo from "@expo/vector-icons/Entypo";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import SubmittedAnswers from "./SubmittedAnswers";
import Thoughts from "./Thoughts";
import Ready from "./Ready";
import Body from "./Body";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Needs from "./Needs";

// Placeholder components for tabs

const QuoteTab = () => (
  <View style={styles.centered}>
    <Text>Quote Tab</Text>
  </View>
);

const Tab = createBottomTabNavigator();

const CustomTabBarButton = ({ children, onPress }) => {
  return (
    <TouchableOpacity style={styles.customButton} onPress={onPress}>
      {children}
    </TouchableOpacity>
  );
};

const HomeScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = auth.currentUser;
        // console.log(user, "here is user i have");
        const savedAuth = await DataService.getAuthState();
        if (!user) {
          navigation.replace("SignIn");
        }

        const userId = user?.uid || savedAuth?.uid;
        if (userId) {
          const userData = await DataService.getUserData(userId).catch(
            console.error
          );
          setIsAdmin(userData?.isAdmin);
        }

        setLoading(false);
      } catch (error) {
        console.error("Auth check failed:", error);
        navigation.replace("SignIn");
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#5885AF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <NetworkStatus />
      {isAdmin ? (
        <Tab.Navigator
          initialRouteName="Users"
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              if (route.name === "Users") {
                return (
                  <View style={{ marginTop: 40, width: 40, height: 40 }}>
                    <Feather name="users" size={24} color="white" />
                  </View>
                );
              } else if (route.name === "Thoughts") {
                return (
                  <View style={{ marginTop: 40, width: 40, height: 40 }}>
                    <MaterialCommunityIcons
                      name="thought-bubble-outline"
                      size={24}
                      color="white"
                    />
                  </View>
                );
              } else if (route.name === "Knowledge") {
                return (
                  <View style={{ marginTop: 40, width: 40, height: 40 }}>
                    <Entypo name="open-book" size={24} color="white" />
                  </View>
                );
              } else if (route.name === "Sos") {
                return (
                  <View style={{ marginTop: 40, width: 40, height: 40 }}>
                    <MaterialIcons name="sos" size={24} color="white" />{" "}
                  </View>
                );
              } else if (route.name === "body") {
                return (
                  <View style={{ marginTop: 40, width: 40, height: 40 }}>
                    <Ionicons name="body-outline" size={24} color="white" />
                  </View>
                );
              } else if (route.name === "feelings") {
                return (
                  <View style={{ marginTop: 40, width: 40, height: 40 }}>
                    <FontAwesome5 name="smile" size={24} color="white" />
                  </View>
                );
              } else if (route.name === "needs") {
                return (
                  <View style={{ marginTop: 40, width: 40, height: 40 }}>
                    <MaterialCommunityIcons
                      name="hand-extended-outline"
                      size={24}
                      color="white"
                    />
                  </View>
                );
              } else if (route.name === "Submit") {
                return (
                  <View style={{ marginTop: 40, width: 30, height: 40 }}>
                    <FontAwesome6
                      name="arrow-up-right-from-square"
                      size={24}
                      color="white"
                    />
                  </View>
                );
              }
            },
            tabBarActiveTintColor: "#007AFF",
            tabBarInactiveTintColor: "gray",
            tabBarStyle: {
              backgroundColor: "#212121",
              height: 80,
              borderTopWidth: 0,
              paddingTop: 10,
            },
            tabBarShowLabel: false,
          })}
        >
          <Tab.Screen
            name="Users"
            component={UsersListing}
            options={{ headerShown: false }}
          />
          {/* <Tab.Screen
            name="Userss"
            component={UsersListing}
            options={{ headerShown: false }}
          />
          <Tab.Screen
            name="Usersss"
            component={UsersListing}
            options={{ headerShown: false }}
          /> */}
          <Tab.Screen
            name="Knowledge"
            component={Knowledge}
            options={{ headerShown: false }}
          />
          <Tab.Screen
            name="Thoughts"
            component={Thoughts}
            options={{ headerShown: false }}
          />

          <Tab.Screen
            name="Sos"
            component={SOS}
            options={{ headerShown: false }}
          />
          <Tab.Screen
            name="body"
            component={Body}
            options={{ headerShown: false }}
          />
          <Tab.Screen
            name="feelings"
            component={Feelings}
            options={{ headerShown: false }}
          />
          <Tab.Screen
            name="needs"
            component={Needs}
            options={{ headerShown: false }}
          />
          <Tab.Screen
            name="Submit"
            component={SubmittedAnswers}
            options={{ headerShown: false }}
          />
        </Tab.Navigator>
      ) : (
        <Tab.Navigator
          initialRouteName="Home"
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              if (route.name === "Home") {
                return (
                  <Image
                    source={Home}
                    style={{ width: 40, height: 40, marginTop: 20 }}
                  />
                );
              } else if (route.name === "KnowledgeHome") {
                return (
                  <Image
                    source={Document}
                    style={{ width: 40, height: 40, marginTop: 20 }}
                  />
                );
              } else if (route.name === "Iceberg") {
                return (
                  <Image
                    source={Iceberg}
                    style={{ width: 40, height: 40, marginTop: 25 }}
                  />
                );
              } else if (route.name === "ProfileTab") {
                return (
                  <Image
                    source={profile}
                    style={{ width: 40, height: 40, marginTop: 25 }}
                  />
                );
              }
            },
            tabBarActiveTintColor: "#007AFF",
            tabBarInactiveTintColor: "gray",
            tabBarStyle: {
              backgroundColor: "#212121",
              height: 80,
              borderTopWidth: 0,
              paddingTop: 10,
            },
            tabBarShowLabel: false,
          })}
        >
          <Tab.Screen
            name="Home"
            component={HomeTab}
            options={{ headerShown: false }}
          />
          <Tab.Screen
            name="KnowledgeHome"
            component={Knowledge}
            options={{ headerShown: false }}
          />

          <Tab.Screen
            name="Central"
            component={Ready}
            options={{
              tabBarButton: (props) => (
                <CustomTabBarButton {...props}>
                  <Image source={Center} size={50} />
                </CustomTabBarButton>
              ),
              headerShown: false,
            }}
          />
          <Tab.Screen
            name="Iceberg"
            component={IceBerg}
            options={{ headerShown: false }}
          />
          <Tab.Screen
            name="ProfileTab"
            component={ProfileTab}
            options={{ headerShown: false }}
          />
        </Tab.Navigator>
      )}
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
