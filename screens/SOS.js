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
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DataService from "@/services/DataService";
import { auth } from "@/firebase";

const SOS = ({ navigation }) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswers] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const [sosQuesitons, setSosQuesitons] = useState([]);
  const [likedIndexes, setLikedIndexes] = useState(new Set());
  const [expandedIndex, setExpandedIndex] = useState(null);

  const checkAuth = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        navigation.replace("SignIn");
      }

      const userId = user?.uid;
      if (userId) {
        const userData = await DataService.getUserData(userId).catch(
          console.error
        );
        setIsAdmin(userData?.isAdmin);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      navigation.replace("SignIn");
    }
  };
  const fetchSos = async () => {
    try {
      const sosList = await DataService.getCollection(`sos-questions`);
      setSosQuesitons(sosList);
    } catch (error) {
      console.error("Error fetching answers:", error);
    }
  };
  useEffect(() => {
    checkAuth();
    fetchSos();
    return () => {};
  }, []);

  // useEffect(() => {
  //   const saveAnswers = async () => {
  //     try {
  //       await AsyncStorage.setItem("answers", JSON.stringify(answers));
  //     } catch (error) {
  //       console.error("Error saving answers:", error);
  //     }
  //   };

  //   if (answers.length) {
  //     saveAnswers();
  //   }
  // }, [answers]);

  const addAnswer = async () => {
    if (!question.trim() || !answer.trim()) {
      Alert.alert("Please fill question and answer field");
      return;
    }

    const questionData = {
      question,
      answers: [
        {
          answerText: answer,
          createdBy: auth.currentUser.uid,
        },
      ],
    };

    try {
      await DataService.addDocument(`sos-questions`, questionData);

      setQuestion("");
      setAnswers("");
      fetchSos();
    } catch (error) {
      console.error("Error adding thought:", error);
      Alert.alert("Error", "Failed to save thought");
    }
  };

  const toggleLike = (index) => {
    setLikedIndexes((prevLikes) => {
      const newLikes = new Set(prevLikes);
      if (newLikes.has(index)) {
        newLikes.delete(index);
      } else {
        newLikes.add(index);
      }
      return newLikes;
    });
  };
  const toggleExpand = (index) => {
    setExpandedIndex(index === expandedIndex ? null : index);
  };

  return (
    <LinearGradient colors={["#5885AF", "#5885AF"]} style={styles.background}>
      <Header onBack={() => navigation.goBack()} title="SOS" />
      <View style={styles.container}>
        <FlatList
          data={sosQuesitons}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <>
              <View style={styles.listItem}>
                <View style={styles.itemContent}>
                  <View style={styles.itemNumber}>
                    <Text style={styles.itemNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.itemText}>{item.question}</Text>
                  <TouchableOpacity
                    onPress={() => toggleLike(index)}
                    style={{ marginRight: 10 }}
                  >
                    <Ionicons
                      name={likedIndexes.has(index) ? "heart" : "heart-outline"}
                      size={24}
                      color="#FFF"
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => toggleExpand(index)}
                    // onPress={() => navigation.navigate("Ready", { item })}
                  >
                    <Ionicons
                      name={
                        expandedIndex === index
                          ? "chevron-forward"
                          : "chevron-down"
                      }
                      size={24}
                      color="#FFF"
                    />{" "}
                  </TouchableOpacity>
                </View>
              </View>
              {expandedIndex === index && (
                <ExpandedForm
                  thought={item}
                  index={index}
                  thoughts={sosQuesitons}
                  setThoughts={setSosQuesitons}
                  fetchThoughts={fetchSos}
                />
              )}
            </>
          )}
        />

        {isAdmin && (
          <View style={styles.bottomContainer}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter your question..."
                placeholderTextColor="#FFFFFF"
                value={question}
                onChangeText={setQuestion}
                autoCapitalize="none"
                selectionColor="#FFFFFF"
              />

              {/* <TouchableOpacity onPress={addThought} style={styles.sendButton}>
                     <Ionicons name="paper-plane-outline" size={24} color="#fff" />
                   </TouchableOpacity> */}
            </View>
            <View style={{ flexDirection: "row" }}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your answer..."
                  placeholderTextColor="#FFFFFF"
                  value={answer}
                  onChangeText={setAnswers}
                  autoCapitalize="none"
                  selectionColor="#FFFFFF"
                />
              </View>
              <TouchableOpacity onPress={addAnswer} style={styles.sendButton}>
                <Ionicons name="paper-plane-outline" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            {/* <TouchableOpacity style={styles.questionIcon}>
                   <Ionicons name="help" size={24} color="#fff" />
                 </TouchableOpacity> */}
          </View>
        )}
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

const ExpandedForm = ({
  thought,
  index,
  thoughts,
  setThoughts,
  fetchThoughts,
}) => {
  const [subAnswerText, setSubAnswertText] = useState("");

  const handleAddSubThought = async () => {
    if (subAnswerText.trim()) {
      const data = {
        answerText: subAnswerText,
      };

      await DataService.updateDocument(`sos-questions`, data, thought.id);
      setSubAnswertText("");
      fetchThoughts();
    }
  };

  return (
    <View style={styles.expandedContainer}>
      {thought.answers?.map((answer, subIndex) => (
        <View key={subIndex} style={styles.subThoughtItem}>
          <Text style={styles.subThoughtText}>{answer.answerText || ""}</Text>
        </View>
      ))}

      <View style={styles.subThoughtInputContainer}>
        <TextInput
          style={styles.expandedInput}
          placeholder="add sub answer here..."
          placeholderTextColor="#FFFFFF80"
          value={subAnswerText}
          onChangeText={setSubAnswertText}
          autoCapitalize="none"
          selectionColor="#FFFFFF"
        />
        <TouchableOpacity
          onPress={handleAddSubThought}
          style={styles.subThoughtSendButton}
        >
          <Ionicons name="paper-plane-outline" size={24} color="#274472" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SOS;

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
    padding: 12,
    marginBottom: 10,
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
  bottomContainer: {
    position: "absolute",
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
  questionIcon: {
    backgroundColor: "#274472",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  expandedContainer: {
    marginTop: 8,
    backgroundColor: "#FFFFFF1A",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  subThoughtItem: {
    backgroundColor: "#41729F",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  subThoughtText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  subThoughtInputContainer: {
    flexDirection: "row",
    alignItems: "center",
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
  subThoughtSendButton: {
    marginLeft: 10,
    justifyContent: "center",
  },
});
