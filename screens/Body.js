import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Speech from "expo-speech";
import { Ionicons, Octicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import { Alert } from "react-native";

const Body = ({ navigation }) => {
  const [text, setText] = useState("");
  const [body, setBody] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);

  useEffect(() => {
    const loadBody = async () => {
      try {
        const storedBody = await AsyncStorage.getItem("Body");
        if (storedBody) {
          setBody(JSON.parse(storedBody));
        }
      } catch (error) {
        console.error("Failed to load body from AsyncStorage:", error);
      }
    };
    loadBody();
  }, []);

  const addBody = async () => {
    if (text.trim()) {
      const newBody = [...body, {
        text: text.trim(),
        subDetails: []
      }];
      setBody(newBody);
      setText("");
      saveBody(newBody);
    }
  };

  const saveBody = async (bodyToSave) => {
    try {
      await AsyncStorage.setItem("Body", JSON.stringify(bodyToSave));
    } catch (error) {
      console.error("Failed to save body to AsyncStorage:", error);
    }
  };

  const handleSpeak = (text) => {
    Speech.speak(text, { language: "en-US" });
  };

  const toggleExpand = (index) => {
    setExpandedIndex(index === expandedIndex ? null : index);
  };

  const ExpandedForm = ({ item, index }) => {
    const [localBodyText, setLocalBodyText] = useState("");

    const handleAddBodyDetail = () => {
      if (localBodyText.trim()) {
        const updatedBody = body.map((b, i) => {
          if (i === index) {
            return {
              ...b,
              subDetails: [...(b.subDetails || []), localBodyText.trim()]
            };
          }
          return b;
        });
        setBody(updatedBody);
        setLocalBodyText("");
        saveBody(updatedBody);
      }
    };

    return (
      <View style={styles.expandedContainer}>
        {/* Show existing sub-details */}
        {item.subDetails?.map((detail, detailIndex) => (
          <View key={detailIndex} style={styles.subDetailItem}>
            <Text style={styles.subDetailText}>{detail}</Text>
          </View>
        ))}

        {/* Input for new sub-detail */}
        <View style={styles.subDetailInputContainer}>
          <TextInput
            style={styles.expandedInput}
            placeholder="Add more details..."
            placeholderTextColor="#FFFFFF80"
            value={localBodyText}
            onChangeText={setLocalBodyText}
          />
          <TouchableOpacity
            onPress={handleAddBodyDetail}
            style={styles.subDetailSendButton}
          >
            <Ionicons name="paper-plane-outline" size={24} color="#274472" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const addBodyResponse = async (bodyData) => {
    try {
      const bodyRef = collection(db, `users/${auth.currentUser.uid}/body`);
      await addDoc(bodyRef, {
        ...bodyData,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error adding body response:", error);
      Alert.alert("Error", "Failed to save response");
    }
  };

  return (
    <LinearGradient colors={["#5885AF", "#5885AF"]} style={styles.background}>
      <Header onBack={() => navigation.goBack()} title="Body" />
      <View style={styles.container}>
        <FlatList
          data={body}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <>
              <TouchableOpacity onPress={() => toggleExpand(index)}>
                <View style={styles.listItem}>
                  <View style={styles.itemContent}>
                    <View style={styles.itemNumber}>
                      <Text style={styles.itemNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.itemText}>{item.text}</Text>

                    <Ionicons
                      name={expandedIndex === index ? "chevron-up" : "chevron-down"}
                      size={24}
                      color="#FFF"
                    />

                  </View>
                </View>
              </TouchableOpacity>
              {expandedIndex === index && (
                <ExpandedForm item={item} index={index} />
              )}
            </>
          )}
        />
        <View style={styles.bottomContainer}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter your text..."
              placeholderTextColor="#FFFFFF"
              value={text}
              onChangeText={setText}
            />
            <TouchableOpacity onPress={addBody} style={styles.sendButton}>
              <Ionicons name="paper-plane-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.questionIcon}>
            <Ionicons name="help" size={24} color="#fff" />
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

export default Body;

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingVertical: 30,
    paddingHorizontal: 16,
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
  listItem: {
    backgroundColor: "#274472",
    borderRadius: 50,
    padding: 10,
    marginBottom: 5,
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  itemNumberText: {
    color: "#FFF",
    fontSize: 14,
  },
  itemText: {
    flex: 1,
    color: "#FFF",
    fontSize: 16,
  },
  expandedContainer: {
    marginTop: 8,
    backgroundColor: "#FFFFFF1A",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  subDetailItem: {
    backgroundColor: "#41729F",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  subDetailText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  subDetailInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#41729F",
    borderRadius: 10,
    paddingVertical: 0,
    paddingHorizontal: 10,
  },
  expandedInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
  },
  subDetailSendButton: {
    marginLeft: 10,
    justifyContent: 'center',
  },
  bottomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    gap: 8,
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#41729F",
    padding: 12,
    borderRadius: 10,
  },
  questionIcon: {
    backgroundColor: "#274472",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    flex: 1,
    color: "#FFF",
    fontSize: 16,
    paddingVertical: 0,
  },
  sendButton: {
    marginLeft: 10,
    justifyContent: "center",
  },
});