import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Image, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Heading from "../components/Heading";
import TextBlock from "../components/TextBlock";
import ReusableButton from "../components/ReusableButton";
import InputField from "../components/InputField";

const ForgetPassword = ({ navigation }) => {
    const [email, setEmail] = useState("");

    const handleContinue = () => {
        // Validate the email format
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!email) {
            Alert.alert("Error", "Please enter your email address.");
        } else if (!emailRegex.test(email)) {
            Alert.alert("Error", "Please enter a valid email address.");
        } else {
            navigation.navigate("RecoverPassword", { email });
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
                {/* Back Button */}
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={20} color="#616161" />
                </TouchableOpacity>

                <Heading navigation={navigation} heading="Forget Password" />
                <TextBlock text="Please enter your email address to receive the password recovery link." />
                <InputField
                    label="Email"
                    placeholder="johndoe@gmail.com"
                    value={email}
                    onChangeText={(text) => setEmail(text)}
                />
                <ReusableButton text="Continue" onPress={handleContinue} />

                <View style={{ flex: 1 }}></View>
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
        paddingTop: 30,
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
    forgotPassword: {
        fontSize: 12,
        color: "#41729F",
        textAlign: "right",
        marginVertical: 10,
    },
    dividerContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 20,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: "#FFFFFF1A",
    },
    orText: {
        marginHorizontal: 10,
        fontSize: 12,
        fontWeight: "400",
        color: "#FFFFFF80",
    },
    secondaryButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFFFFF1A",
        borderRadius: 8,
        paddingVertical: 12,
        marginBottom: 20,
    },
    googleIcon: {
        marginRight: 10,
        height: 30,
        width: 30,
    },
    secondaryButtonText: {
        fontSize: 14,
        color: "#FFFFFF80",
        fontWeight: "400",
    },
    signupText: {
        textAlign: "center",
        color: "#FFFFFF",
        fontSize: 12,
        marginTop: 30,
    },
    signupLink: {
        color: "#41729F",
        fontWeight: "600",
    },
});

export default ForgetPassword;
