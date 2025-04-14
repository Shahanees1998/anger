import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import ReusableButton from "../components/ReusableButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "@/firebase";

const ProfileTab = ({ navigation }) => {
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const savedData = await AsyncStorage.getItem("signupData");
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          setUserData({
            firstName: parsedData.firstName || "",
            lastName: parsedData.lastName || "",
            email: parsedData.email || "",
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const logout = async () => {
    try {
      await auth.signOut();
      navigation.navigate("SignIn");
    } catch (error) {
      console.error("Error logging out:", error);
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
        <Header onBack={() => navigation.goBack()} title="Profile" />
        <View style={styles.profileContainer}>
          <Image
            source={require("../assets/profile_pic.png")} // Replace with dynamic image URL
            style={styles.profileImage}
          />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.profileName}>
              {userData.firstName} {userData.lastName}
            </Text>
            <Text style={styles.profileEmail}>{userData.email}</Text>
          </View>
        </View>
        <View style={styles.menuContainer}>
          <MenuItem
            title="Profile"
            onPress={() => navigation.navigate("Profile")}
          />
          <MenuItem title="Terms & Conditions" />
          <MenuItem title="Privacy Policy" />
          <MenuItem title="Legal" />
        </View>
        <View style={{ marginTop: 10 }}>
          <ReusableButton text="Logout" onPress={logout} />
        </View>
      </View>
    </LinearGradient>
  );
};

export default ProfileTab;

// Reusable Header Component
const Header = ({ onBack, title }) => (
  <View style={styles.header}>
    <TouchableOpacity style={styles.backButton} onPress={onBack}>
      <Ionicons name="arrow-back" size={24} color="#616161" />
    </TouchableOpacity>
    <View style={{ flex: "center", alignItems: "center", width: "100%" }}>
      <Text style={styles.headerTitle}>{title}</Text>
    </View>
  </View>
);

const MenuItem = ({ title, onPress }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <Text style={styles.menuText}>{title}</Text>
    <Ionicons name="chevron-forward" size={20} color="#616161" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: -20,
    alignSelf: "center",
    textAlign: "center",
  },
  profileContainer: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    maxHeight: 100,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  profileName: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  profileEmail: {
    color: "#fff",
    fontSize: 14,
  },
  menuContainer: {
    borderTopWidth: 1,
    borderTopColor: "#616161",
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#616161",
  },
  menuText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
});
