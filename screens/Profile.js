import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import ReusableButton from "../components/ReusableButton";
import InputField from "../components/InputField";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Profile = ({ navigation }) => {
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("Select");
  const [dob, setDob] = useState(new Date());
  const [password, setPassword] = useState(""); // To hold password
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const savedData = await AsyncStorage.getItem("signupData");
        const savedPassword = await AsyncStorage.getItem("password"); // Retrieve password
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          setUserData({
            firstName: parsedData.firstName || "",
            lastName: parsedData.lastName || "",
            email: parsedData.email || "",
          });
        }
        if (savedPassword) {
          setPassword(savedPassword); // Set the password
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || dob;
    setShowDatePicker(Platform.OS === "ios");
    setDob(currentDate);
  };

  const handleUpdate = async () => {
    const updatedData = {
      ...userData,
      phone,
      gender,
      dob: dob.toLocaleDateString(),
    };
    try {
      await AsyncStorage.setItem("profileData", JSON.stringify(updatedData));
      Alert.alert("Success", "Profile updated successfully!");
      navigation.navigate("HomeScreen");
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    }
  };

  const handleChangePassword = () => {
    navigation.navigate("ChangePassword"); // Navigate to Change Password screen
  };

  return (
    <LinearGradient
    colors={["#5885AF", "#5885AF"]}
      style={styles.background}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.container}>
          <Header onBack={() => navigation.goBack()} title="Profile" />

          {/* Input Fields */}
          <InputField
            label="First Name"
            placeholder="John"
            value={userData.firstName}
            editable={false}
          />
          <InputField
            label="Last Name"
            placeholder="Doe"
            value={userData.lastName}
            editable={false}
          />
          <InputField
            label="Email"
            placeholder="johndoe@gmail.com"
            value={userData.email}
            editable={false}
          />
          <InputField
            label="Phone"
            placeholder="+1 00 000 000 0000"
            value={phone}
            onChangeText={(text) => setPhone(text)}
          />

          {/* Password */}
      

          {/* D.O.B Picker */}
          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <InputField
              label="D.O.B"
              placeholder={dob.toLocaleDateString()}
              editable={false}
            />
          </TouchableOpacity>
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Gender</Text>
            <Picker
              selectedValue={gender}
              style={styles.picker}
              onValueChange={(itemValue) => setGender(itemValue)}
            >
              <Picker.Item label="Select" value="Select" />
              <Picker.Item label="Male" value="Male" />
              <Picker.Item label="Female" value="Female" />
              <Picker.Item label="Other" value="Other" />
            </Picker>
          </View>
          <InputField
            label="Password"
            placeholder="Enter your password"
            secureTextEntry={true}
            value={password}
            editable={false} 
          />

          <TouchableOpacity onPress={handleChangePassword}>
            <Text style={styles.changePasswordText}>Change Password</Text>
          </TouchableOpacity>
          <ReusableButton text="Update Profile" onPress={handleUpdate} />

          {/* Date Picker */}
          {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={dob}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const Header = ({ onBack, title }) => (
  <View style={styles.headerContainer}>
    <TouchableOpacity style={styles.backButton} onPress={onBack}>
      <Ionicons name="arrow-back" size={20} color="#616161" />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  pickerContainer: {
    marginVertical: 10,
  },
  pickerLabel: {
    color: "#FFFFFF",
    marginBottom: 5,
  },
  picker: {
    color: "#FFFFFF",
    backgroundColor: "#41729F",
  },
  changePasswordText: {
    color: "#fff",
    
    textAlign: "right",
    marginVertical: 10,
  },
});

export default Profile;
