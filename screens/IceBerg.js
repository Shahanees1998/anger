import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/FontAwesome";
import { Ionicons } from "@expo/vector-icons";
import BgImage from "../assets/Iceberg.png";
import ReusableButton from "../components/ReusableButton";
import Top from "../assets/Top.png";
import Thoughts from "../assets/Thoughts.png";
import Body from "../assets/Body.png";
import Feelings from "../assets/feelings.png";
import Need from "../assets/Need.png";
import TimeSelector from "../components/TimeSelector";

const { width, height } = Dimensions.get("window");

const IcebergContent = ({
  navigation,
  selectedTime,
  onTimeSelect,
  buttonText,
  onButtonPress,
}) => (
  <View style={styles.screenContainer}>
    <TimeSelector selectedTime={selectedTime} onTimeSelect={onTimeSelect} />
    <View style={styles.icebergImagesContainer}>
      <View style={[styles.imageWrapper, { zIndex: 5 }]}>
        <Image source={Top} style={[styles.topImage]} resizeMode="contain" />
      </View>
      <View style={[styles.imageWrapper, { zIndex: 6 }]}>
        <TouchableOpacity onPress={() => navigation.navigate("Thoughts")}>
          <Image
            source={Thoughts}
            style={[styles.thoughtsImage]}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
      <View style={[styles.imageWrapper, { zIndex: 3 }]}>
        <TouchableOpacity onPress={() => navigation.navigate("Body")}>
          <Image
            source={Body}
            style={[styles.bodyImage]}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
      <View style={[styles.imageWrapper, { zIndex: 2 }]}>
        <TouchableOpacity onPress={() => navigation.navigate("Feelings")}>
          <Image
            source={Feelings}
            style={[styles.feelingsImage]}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
      <View style={[styles.imageWrapper, { zIndex: 1 }]}>
        <TouchableOpacity onPress={() => navigation.navigate("Needs")}>
          <Image
            source={Need}
            style={[styles.needsImage]}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </View>
    <View style={styles.buttonContainer}>
      <ReusableButton text={buttonText} onPress={onButtonPress} />
    </View>
  </View>
);

const Iceberg = ({ navigation }) => {
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
  const [selectedTime, setSelectedTime] = useState("Today");

  const imageContainerHeight = height * 0.5;

  const screens = [
    {
      key: "Iceberg",
      content: (
        <IcebergContent
          navigation={navigation}
          selectedTime={selectedTime}
          onTimeSelect={(time) => setSelectedTime(time)}
          buttonText="Submitted Answers"
          onButtonPress={() =>
            navigation.navigate("SubmittedAnswers", { fromIceberg: true })
          }
        />
      ),
    },
    {
      key: "knowledge",
      content: (
        <IcebergContent
          navigation={navigation}
          selectedTime={selectedTime}
          onTimeSelect={(time) => setSelectedTime(time)}
          buttonText="Knowledge"
          onButtonPress={() => navigation.navigate("Knowledge")}
        />
      ),
    },
    {
      key: "SOS",
      content: (
        <IcebergContent
          navigation={navigation}
          selectedTime={selectedTime}
          onTimeSelect={(time) => setSelectedTime(time)}
          buttonText="SOS"
          onButtonPress={() => navigation.navigate("SOS")}
        />
      ),
    },
    {
      key: "Thoughts",
      content: (
        <IcebergContent
          navigation={navigation}
          selectedTime={selectedTime}
          onTimeSelect={(time) => setSelectedTime(time)}
          buttonText="Thoughts"
          onButtonPress={() => navigation.navigate("Thoughts")}
        />
      ),
    },
  ];

  const navigate = (direction) => {
    const newIndex =
      (currentScreenIndex + direction + screens.length) % screens.length;
    setCurrentScreenIndex(newIndex);
  };

  return (
    <LinearGradient colors={["#5885AF", "#5885AF"]} style={styles.background}>
      <Header onBack={() => navigation.goBack()} title="My Iceberg" />

      <View style={styles.container}>
        {screens[currentScreenIndex].content}

        <Image
          source={require("../assets/iceberg_bottom.png")}
          style={[
            styles.bottomBackgroundImage,
            {
              height: height * 0.7,
              width: width,
            },
          ]}
        />
        <TouchableOpacity
          style={[styles.navIcon, styles.leftIcon]}
          onPress={() => navigate(-1)}
        >
          <Icon name="arrow-left" size={14} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navIcon, styles.rightIcon]}
          onPress={() => navigate(1)}
        >
          <Icon name="arrow-right" size={14} color="#FFF" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

export default Iceberg;

const Header = ({ onBack, title }) => (
  <View style={styles.header}>
    <TouchableOpacity style={styles.backButton} onPress={onBack}>
      <Ionicons name="arrow-back" size={24} color="#616161" />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  background: {
    flex: 1,
    paddingVertical: 0,
  },
  bottomBackgroundImage: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    resizeMode: "cover",
    zIndex: 0,
    height: "60%",
    top: "32%",
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  screenContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 10 : 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 25,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  icebergImage: {
    height: undefined,
    alignSelf: "center",
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: "#1E90FF",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  screenText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  navIcon: {
    position: "absolute",
    top: "50%",
    zIndex: 10,
    backgroundColor: "#00000080",
    padding: 10,
    borderRadius: 30,
  },
  leftIcon: {
    left: 20,
  },
  rightIcon: {
    right: 20,
  },
  icebergImagesContainer: {
    width: "100%",
    alignItems: "center",
    position: "relative",
    marginTop: 10,
  },
  imageWrapper: {
    width: "100%",
    alignItems: "center",
    marginTop: -35,
  },
  buttonContainer: {
    width: "90%",
    paddingBottom: 20,
    zIndex: 1,
    marginTop: "auto",
  },
  topImage: {
    width: "50%",
    height: undefined,
    aspectRatio: 0.95,
  },
  thoughtsImage: {
    width: "60%",
    height: undefined,
    aspectRatio: 2.5,
    marginTop: -15,
  },
  bodyImage: {
    width: "60%",
    height: undefined,
    aspectRatio: 2.3,
    marginTop: -1,
  },
  feelingsImage: {
    width: "60%",
    height: undefined,
    aspectRatio: 2.1,
    marginTop: -5,
  },
  needsImage: {
    width: "65%",
    height: undefined,
    aspectRatio: 1.9,
    marginTop: -5,
  },
});
