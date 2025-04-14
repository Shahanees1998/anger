import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import ReadyImage from "../assets/ready.png";
import ExcitedEmoji from "../assets/excited.png";
import HappyEmoji from "../assets/Happy.png";
import SadEmoji from "../assets/sad.png";
import EmotionalEmoji from "../assets/emotional.png";
import ExhaustedEmoji from "../assets/exhausted.png";

import { Ionicons } from "@expo/vector-icons";
import ReusableButton from "../components/ReusableButton";

const Ready = ({ navigation }) => {
  const emojis = [
    { name: "Excited", image: ExcitedEmoji },
    { name: "Happy", image: HappyEmoji },
    { name: "Sad", image: SadEmoji },
    { name: "Emotional", image: EmotionalEmoji },
    { name: "Exhausted", image: ExhaustedEmoji },
  ];

  return (
    <LinearGradient colors={["#5885AF", "#5885AF"]} style={styles.background}>
      <Header onBack={() => navigation.goBack()} />
      <View style={styles.container}>
        <Image source={ReadyImage} style={styles.image} />

        <Text style={styles.textBelowImage}>
          How are you feeling right now?
        </Text>

        <View style={styles.emojiContainer}>
          {emojis.map((emoji, index) => (
            <TouchableOpacity
              key={index}
              style={styles.emojiItem}
              onPress={() => navigation.navigate("SOS")}
            >
              <Image source={emoji.image} style={styles.emojiImage} />
              <Text style={styles.emojiText}>{emoji.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Continue Button */}
        {/* <View style={{ width: "90%", position: "absolute", bottom: 30 }}>
          <ReusableButton
            text={"Continue"}
            onPress={() => navigation.navigate("SOSMedication")}
          />
        </View> */}
      </View>
    </LinearGradient>
  );
};

const Header = ({ onBack, title }) => (
  <View style={styles.header}>
    <TouchableOpacity style={styles.backButton} onPress={onBack}>
      <Ionicons name="arrow-back" size={24} color="#616161" />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>{title}</Text>
  </View>
);

export default Ready;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    paddingHorizontal: 20,
  },
  container: {
    flex: 1,
    // justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 200,
    height: 200,
    marginTop: "15%",
    resizeMode: "contain",
  },
  textBelowImage: {
    marginTop: 20,
    color: "#FFFFFF",
    fontSize: 12,
    textAlign: "center",
  },
  emojiContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
    width: "100%",
    paddingHorizontal: 10,
  },
  emojiItem: {
    alignItems: "center",
  },
  emojiImage: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },
  emojiText: {
    color: "#FFFFFF",
    fontSize: 12,
    marginTop: 5,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 40,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
});
