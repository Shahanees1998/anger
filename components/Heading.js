import { StyleSheet, Text, View } from "react-native";
import React from "react";

const Heading = ({ navigation, heading }) => {
  return <Text style={styles.text}>{heading}</Text>;
};

export default Heading;

const styles = StyleSheet.create({
  text: {
    fontSize: 32,
    fontWeight: "700",
    fontFamily: "Inter",
    color: "#FFFFFF",
    textAlign: "left",
  },
});
