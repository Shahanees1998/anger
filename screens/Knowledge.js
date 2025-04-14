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
import { Ionicons, Octicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DataService from "@/services/DataService";
import { auth } from "@/firebase";

const Knowledge = ({ navigation }) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswers] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const [knoweldgeQuestions, setKnowledgeQuestions] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);

  const loadKnowledge = async () => {
    try {
      const questions = await DataService.getCollection(`knowledge-questions`);
      setKnowledgeQuestions(questions);
    } catch (error) {
      console.error("Failed to load knowledge from AsyncStorage:", error);
    }
  };

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

  useEffect(() => {
    checkAuth();
    loadKnowledge();
    return () => {};
  }, []);

  const addKnowledge = async () => {
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
      await DataService.addDocument(`knowledge-questions`, questionData);
      setQuestion("");
      setAnswers("");
      loadKnowledge();
    } catch (error) {
      console.error("Failed to save knowledge to AsyncStorage:", error);
    }
  };

  const handleSpeak = (text) => {
    Speech.speak(text, { language: "en-US" });
  };

  const toggleExpand = (index) => {
    setExpandedIndex(index === expandedIndex ? null : index);
  };

  return (
    <LinearGradient colors={["#5885AF", "#5885AF"]} style={styles.background}>
      <Header onBack={() => navigation.goBack()} title="Knowledge" />
      <View style={styles.container}>
        {/* List of Submitted Knowledge */}
        <FlatList
          data={knoweldgeQuestions}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <>
              <TouchableOpacity onPress={() => toggleExpand(index)}>
                <View style={styles.listItem}>
                  <View style={styles.itemContent}>
                    <View style={styles.itemNumber}>
                      <Text style={styles.itemNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.itemText}>{item.question}</Text>

                    <Ionicons
                      name={
                        expandedIndex === index ? "chevron-up" : "chevron-down"
                      }
                      size={24}
                      color="#FFF"
                    />
                  </View>
                </View>
              </TouchableOpacity>
              {expandedIndex === index &&
                item.answers.map((ele, ind) => (
                  <View key={ind} style={styles.expandedContainer}>
                    <Text style={styles.expandedText}>{ele.answerText}</Text>
                    <View style={styles.helpfulSection}>
                      <View style={styles.likeDislike}>
                        <Text style={{ color: "#F2FAFF" }}>Helpful?</Text>
                        <TouchableOpacity>
                          <Octicons name="thumbsup" size={20} color="#F2FAFF" />
                        </TouchableOpacity>
                        <TouchableOpacity>
                          <Octicons
                            name="thumbsdown"
                            size={20}
                            color="#F2FAFF"
                          />
                        </TouchableOpacity>
                      </View>
                      <TouchableOpacity
                        style={styles.speakerIcon}
                        onPress={() => handleSpeak(item)} // Use item here for speech
                      >
                        <Ionicons name="volume-high" size={24} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
            </>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No records found</Text>
            </View>
          }
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
              <TouchableOpacity
                onPress={addKnowledge}
                style={styles.sendButton}
              >
                <Ionicons name="paper-plane-outline" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
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

export default Knowledge;

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
    padding: 8,
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
    marginTop: -15,
    backgroundColor: "#FFFFFF1A",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 15,
    marginBottom: 10,
    zIndex: -1,
  },
  expandedText: {
    color: "#FFF",
    fontSize: 14,
    marginBottom: 10,
  },
  helpfulSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  likeDislike: {
    flexDirection: "row",
    gap: 10,
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF1A",
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
  bottomContainer: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    gap: 8,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 10,
  },
});
