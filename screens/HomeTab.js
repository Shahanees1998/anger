import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Dimensions,Image,ImageBackground } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Font from "expo-font";
import Icon from "react-native-vector-icons/FontAwesome";
import BackgroundImage from "../assets/Home_background.png"

// Get device dimensions for responsive design
const { width } = Dimensions.get("window");

const HomeTab = () => {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const loadFont = async () => {
      try {
        await Font.loadAsync({
          "JotiOne-Regular": require("../assets/fonts/JotiOne-Regular.ttf"), // Adjust the path to your font
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error("Error loading font:", error);
      }
    };

    loadFont();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <LinearGradient
    colors={["#5885AF", "#5885AF"]}
      style={styles.background}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
    
      <View style={styles.container}>
        <ImageBackground source={BackgroundImage} style={{width:300,paddingVertical:80}}>
        <Text style={styles.cardText}>
            DENKE DARAN,{"\n"}
            VERGEBUNG BEDEUTET HEILUNG{"\n"}
            UND{"\n"}
            LOSLASSEN BEDEUTET WACHSTUM
          </Text>
        {/* <View style={styles.card}>
          
          <Icon name="heart" size={30} color="#274472" style={styles.icon} />
        </View> */}
        </ImageBackground>
      </View>
    </LinearGradient>
  );
};

export default HomeTab;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 50,
    paddingTop: 30,
  },
  card: {
    width: width * 0.9, // 90% of the screen width
    backgroundColor: "#FFFFFF1A", // Background with transparency
    paddingVertical: 50,
    borderRadius: 24, // Rounded corners
    justifyContent: "center",
    alignItems: "center",
  },
  cardText: {
    fontFamily: "JotiOne-Regular", // Font loaded dynamically
    fontSize: 24,
    fontWeight: "400",
    lineHeight: 40,
    textAlign: "center",
    color: "#FFFFFF", // White text color for better contrast
    textDecorationLine: "none", // No underline (adjust if needed)
  },
  icon: {
    marginTop: 20, // Adds spacing between the text and the icon
  },
});
