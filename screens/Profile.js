import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import ReusableButton from "../components/ReusableButton";
import InputField from "../components/InputField";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import CustomAlert from "../components/CustomAlert";
import InformationIcon from "../assets/information_icon.png";
import { onAuthStateChanged, updatePassword } from "firebase/auth";

const Profile = ({ navigation }) => {
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "Select",
    dob: new Date(),
    password: "",
  });
  const [loading, setLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigation.replace("SignIn");
      } else {
        fetchUserData(user.uid);
      }
    });

    return unsubscribe;
  }, []);

  const fetchUserData = async (userId) => {
    try {
      setLoading(true);
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || auth.currentUser?.email || "",
          phone: data.phone || "",
          gender: data.gender || "Select",
          dob: data.dob ? new Date(data.dob.seconds) : new Date(),
        });
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert("Error", "Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error("No authenticated user");

      const userRef = doc(db, "users", userId);
      const { password, data } = userData;
      const updateData = {
        ...data,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(userRef, updateData);
      await updatePassword(auth.currentUser, password);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setUserData((prev) => ({ ...prev, dob: selectedDate }));
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={["#5885AF", "#5885AF"]} style={styles.background}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#5885AF", "#5885AF"]} style={styles.background}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.container}>
          <Header onBack={() => navigation.goBack()} title="Profile" />

          <InputField
            label="First Name"
            value={userData.firstName}
            onChangeText={(text) =>
              setUserData((prev) => ({ ...prev, firstName: text }))
            }
            placeholder="Enter your first name"
          />

          <InputField
            label="Last Name"
            value={userData.lastName}
            onChangeText={(text) =>
              setUserData((prev) => ({ ...prev, lastName: text }))
            }
            placeholder="Enter your last name"
          />

          <InputField
            label="Email"
            value={userData.email}
            editable={false}
            placeholder="Your email address"
          />

          <InputField
            label="Phone"
            value={userData.phone}
            onChangeText={(text) =>
              setUserData((prev) => ({ ...prev, phone: text }))
            }
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
          />

          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Gender</Text>
            <Picker
              selectedValue={userData.gender}
              style={styles.picker}
              onValueChange={(value) =>
                setUserData((prev) => ({ ...prev, gender: value }))
              }
            >
              <Picker.Item label="Select Gender" value="Select" />
              <Picker.Item label="Male" value="male" />
              <Picker.Item label="Female" value="female" />
              <Picker.Item label="Other" value="other" />
            </Picker>
          </View>

          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <InputField
              label="Date of Birth"
              value={userData.dob.toLocaleDateString()}
              editable={false}
            />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={userData.dob}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

          <TouchableOpacity
            style={styles.changePasswordLink}
            onPress={() => navigation.navigate("ChangePassword")}
          >
            <Text style={styles.changePasswordText}>Change Password</Text>
          </TouchableOpacity>

          <ReusableButton text="Update Profile" onPress={handleUpdate} />

          <CustomAlert
            visible={alertVisible}
            onClose={() => setAlertVisible(false)}
            {...alertConfig}
          />
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  changePasswordLink: {
    alignItems: "flex-end",
    marginBottom: 10,
  },
  changePasswordText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});

export default Profile;
