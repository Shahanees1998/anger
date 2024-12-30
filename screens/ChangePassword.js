import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Heading from "../components/Heading";
import TextBlock from "../components/TextBlock";
import ReusableButton from "../components/ReusableButton";
import InputField from "../components/InputField";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ChangePassword = ({ navigation }) => {
    const [email, setEmail] = useState(null);  // State to store email
    const [oldPassword, setOdPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    useEffect(() => {
        // Retrieve email from AsyncStorage when the component mounts
        const fetchEmail = async () => {
            try {
                const userData = await AsyncStorage.getItem("userData");
                if (userData) {
                    const parsedData = JSON.parse(userData);
                    setEmail(parsedData.email);  // Assuming email is stored in userData
                }
            } catch (error) {
                console.error("Error fetching email from AsyncStorage", error);
            }
        };

        fetchEmail();
    }, []);

    const handleChangePassword = async () => {
        if (!newPassword || !confirmPassword) {
            Alert.alert("Error", "Both password fields are required.");
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match.");
            return;
        }

        try {
            // Simulate saving the new password for the email
            const signupData = { email, password: newPassword };
            await AsyncStorage.setItem("userData", JSON.stringify(signupData));  // Update stored user data with new password

            Alert.alert("Success", "Password updated successfully!");
            navigation.navigate("Profile");  // Navigate back to Profile screen
        } catch (error) {
            console.error("Error saving password:", error);
            Alert.alert("Error", "Failed to update the password. Please try again.");
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
                <Heading navigation={navigation} heading="Change Password" />
                <TextBlock text="Please enter your new password here." />
                <InputField
                    label="Old Password"
                    placeholder="Enter your old password"
                    secureTextEntry={true}
                    value={oldPassword}
                    onChangeText={setOdPassword}
                />
                <InputField
                    label="New Password"
                    placeholder="Enter your new password"
                    secureTextEntry={true}
                    value={newPassword}
                    onChangeText={setNewPassword}
                />
                <InputField
                    label="Confirm Password"
                    placeholder="Confirm your new password"
                    secureTextEntry={true}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                />
                <ReusableButton text="Update Password" onPress={handleChangePassword} />

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
});

export default ChangePassword;
