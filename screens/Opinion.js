import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import OpinionImage from "../assets/Opinion.png";
import { Ionicons } from "@expo/vector-icons";
import TextBlock from "../components/TextBlock";

const Opinion = ({ navigation }) => {
  return (
    <LinearGradient colors={["#5885AF", "#5885AF"]} style={styles.background}>
      <Header onBack={() => navigation.goBack()} title="" />
      <View style={styles.container}>
        <Image source={OpinionImage} />
        <TextBlock text="Are you satisfy with the medication?" />
        <View
          style={{
            width: "90%",
            position: "absolute",
            bottom: 30,
            display: "flex",
            flexDirection: "row",
          }}
        >
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("Body")}
          >
            <Text style={styles.buttonText}>Yes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>No</Text>
          </TouchableOpacity>
        </View>
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

export default Opinion;

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  button: {
    width: "50%",
    backgroundColor: "#274472",
    paddingVertical: 15, // Adjust for desired height
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    marginRight: 10,
  },
  buttonText: {
    fontFamily: "Inter",
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 14.52,
    letterSpacing: -0.01,
    textAlign: "center",
    color: "#FFFFFF",
  },
});
