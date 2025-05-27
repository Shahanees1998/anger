import CustomAlert from "@/components/CustomAlert";
import DataService from "@/services/DataService";
import { Ionicons, Octicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Speech from "expo-speech";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../firebase";

const Body = ({ navigation }) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswers] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [bodyQuestions, setBodyQuestions] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});
  const [helpQuestionAnswer, setHelpQuestionAnswer] = useState({
    question: "",
    answer: "",
  });
  const [helpInfo, setHelpInfo] = useState(null);
  const [standaloneThought, setStandaloneThought] = useState("");

  const loadBody = async () => {
    try {
      const bodyList = await DataService.getCollection(`body-questions`);
      const helpQuestion = await DataService.getHelpQuestion("body-questions");
      const regularDocs = bodyList.filter((doc) => !doc.isHelp);
      setHelpInfo(helpQuestion);
      setBodyQuestions(regularDocs);
    } catch (error) {
      console.error("Failed to load body:", error);
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

    loadBody();
    return () => {};
  }, []);

  const addBody = async () => {
    if (!question.trim()) {
      Alert.alert("Please fill question field");
      return;
    }
    const questionData = {
      question,
      answers: [],
    };

    try {
      await DataService.addDocument(`body-questions`, questionData);

      setQuestion("");
      setAnswers("");
      loadBody();
    } catch (error) {
      console.error("Error adding thought:", error);
      Alert.alert("Error", "Failed to save thought");
    }
  };
  const addHelpBody = async () => {
    // Pre-fill the dialog if help info exists
    const initialData = helpInfo
      ? {
          question: helpInfo.helpQuestion || "",
          answer: helpInfo.helpAnswer || "",
        }
      : {
          question: "",
          answer: "",
        };

    setAlertConfig({
      title: helpInfo ? "Update Help Information" : "Add Help Information",
      helpQuestionAnswer: true,
      initialHelpData: initialData,
      onContinue: async (data) => {
        setAlertVisible(false);
        try {
          if (data.question.trim() && data.answer.trim()) {
            await DataService.addHelpQuestion("body-questions", {
              helpQuestion: data.question,
              helpAnswer: data.answer,
            });
            Alert.alert(
              "Success",
              helpInfo
                ? "Help information updated successfully"
                : "Help information added successfully"
            );
            loadBody();
          }
        } catch (e) {
          console.error("Error updating help:", e);
          Alert.alert("Error", "Failed to save help information");
        }
      },
    });
    setAlertVisible(true);
  };

  const showHelpInfo = () => {
    if (helpInfo) {
      setAlertConfig({
        title: "Help Information",
        message: `${helpInfo.helpQuestion}\n\n${helpInfo.helpAnswer}`,
        onContinue: () => setAlertVisible(false),
      });
      setAlertVisible(true);
    }
  };

  const addStandaloneThought = async () => {
    if (!standaloneThought.trim()) {
      Alert.alert("Please enter your thought");
      return;
    }

    const thoughtData = {
      question: "",
      answers: [
        {
          answerText: standaloneThought,
          createdBy: auth.currentUser.uid,
          createdAt: new Date(),
        },
      ],
    };

    try {
      await DataService.addDocument(`body-questions`, thoughtData);
      setStandaloneThought("");
      loadBody();
    } catch (error) {
      console.error("Error adding standalone thought:", error);
      Alert.alert("Error", "Failed to save thought");
    }
  };

  const toggleExpand = (index) => {
    setExpandedIndex(index === expandedIndex ? null : index);
  };

  const handleSpeak = (text) => {
    Speech.speak(text, { language: "en-US" });
  };

  return (
    <LinearGradient colors={["#5885AF", "#5885AF"]} style={styles.background}>
      <Header onBack={() => navigation.goBack()} title="Body" />
      <View style={styles.container}>
        <FlatList
          data={bodyQuestions}
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
                    <TouchableOpacity onPress={showHelpInfo}>
                      <Ionicons name="help-circle" size={24} color="#FFF" />
                    </TouchableOpacity>
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
              {expandedIndex === index && !isAdmin && (
                <ExpandedForm
                  body={item}
                  index={index}
                  loadBody={loadBody}
                  isAdmin={isAdmin}
                />
              )}
            </>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No records found</Text>
            </View>
          }
        />

        {/* Admin input section */}
        {isAdmin && (
          <View style={styles.bottomContainer}>
            <View style={{ flexDirection: "row" }}>
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
              <TouchableOpacity onPress={addBody} style={styles.sendButton}>
                <Ionicons name="paper-plane-outline" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.questionIcon}
                onPress={addHelpBody}
              >
                <Ionicons name="help" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* User standalone thought input */}
        {!isAdmin && (
          <View style={styles.bottomContainer}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Add a new thought..."
                placeholderTextColor="#FFFFFF"
                value={standaloneThought}
                onChangeText={setStandaloneThought}
                autoCapitalize="none"
                selectionColor="#FFFFFF"
              />
              <TouchableOpacity
                onPress={addStandaloneThought}
                style={styles.sendButton}
              >
                <Ionicons name="paper-plane-outline" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
      {alertVisible && (
        <CustomAlert
          visible={alertVisible}
          onClose={() => setAlertVisible(false)}
          {...alertConfig}
        />
      )}
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
  body,
  index,
  thoughts,
  setThoughts,
  loadBody,
  isAdmin,
}) => {
  const [subAnswerText, setSubAnswertText] = useState("");
  const [filteredAnswers, setFilteredAnswers] = useState([]);

  useEffect(() => {
    // Filter answers when body data changes
    if (body?.answers) {
      const userId = auth.currentUser.uid;
      DataService.filterAnswersForUser(body.answers, userId).then((filtered) => {
        setFilteredAnswers(filtered);
      });
    }
  }, [body]);

  const handleAddSubThought = async () => {
    if (subAnswerText.trim()) {
      const data = {
        answerText: subAnswerText,
      };

      await DataService.updateDocument(`body-questions`, data, body.id);
      setSubAnswertText("");
      loadBody();
    }
  };

  return (
    <View style={styles.expandedContainer}>
      {filteredAnswers.map((ele, subIndex) => (
        <View key={subIndex}>
          <Text style={styles.expandedText}>
            {ele.isAdminAnswer && <Text style={styles.adminBadge}>Admin Response: </Text>}
            {ele.answerText}
          </Text>
          <View style={styles.helpfulSection}>
            <View style={styles.likeDislike}>
              <Text style={{ color: "#F2FAFF" }}>Helpful?</Text>
              <TouchableOpacity>
                <Octicons name="thumbsup" size={20} color="#F2FAFF" />
              </TouchableOpacity>
              <TouchableOpacity>
                <Octicons name="thumbsdown" size={20} color="#F2FAFF" />
              </TouchableOpacity>
            </View>
            {/* <TouchableOpacity
              style={styles.speakerIcon}
              onPress={() => handleSpeak(item)} // Use item here for speech
            >
              <Ionicons name="volume-high" size={24} color="#fff" />
            </TouchableOpacity> */}
          </View>
        </View>
      ))}

      <View style={styles.subThoughtInputContainer}>
        <TextInput
          style={styles.expandedInput}
          placeholder="add your answer here..."
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
  subDetailSendButton: {
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
    marginLeft: 5,
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
  subThoughtInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#41729F",
    borderRadius: 10,
    paddingVertical: 0,
    paddingHorizontal: 10,
    marginTop: 8,
  },
  subThoughtSendButton: {
    marginLeft: 10,
    justifyContent: "center",
  },
  adminBadge: {
    color: "#FFD700",
    fontWeight: "bold",
  },
});
