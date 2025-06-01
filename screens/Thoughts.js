import CustomAlert from "@/components/CustomAlert";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { serverTimestamp } from "firebase/firestore";
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
import DataService from "../services/DataService";

const Thoughts = ({ navigation }) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswers] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [editQueston, setEditQuestion] = useState("");
  const [standaloneAnswer, setStandaloneAnswer] = useState("");

  const [thoughts, setThoughts] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [subThoughtText, setSubThoughtText] = useState("");
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});

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
    fetchThoughts();
    return () => {};
  }, []);

  const fetchThoughts = async () => {
    try {
      const thoughtsList = await DataService.getCollection(
        `thoughts-questions`
      );

      // console.log(thoughtsList, "here is thought list");
      setThoughts(thoughtsList);
    } catch (error) {
      console.error("Error fetching thoughts:", error);
    }
  };

  const addThought = async () => {
    if (!question.trim() || !answer.trim()) {
      Alert.alert("Please fill question and answer field");
      return;
    }
    const clientTimestamp = new Date();
    const questionData = {
      question,
      answers: [
        {
          answerText: answer,
          createdBy: auth.currentUser.uid,
          createdAt: serverTimestamp(),
          createdAt: clientTimestamp,
        },
      ],
    };

    try {
      await DataService.addDocument(`thoughts-questions`, questionData);

      setQuestion("");
      setAnswers("");
      fetchThoughts();
    } catch (error) {
      console.error("Error adding thought:", error);
      Alert.alert("Error", "Failed to save thought");
    }
  };

  const addStandaloneAnswer = async () => {
    if (!standaloneAnswer.trim()) {
      Alert.alert("Please enter your thought");
      return;
    }
    const clientTimestamp = new Date();
    const questionData = {
      question: "",
      answers: [
        {
          answerText: standaloneAnswer,
          createdBy: auth.currentUser.uid,
          createdAt: serverTimestamp(),
          createdAt: clientTimestamp,
        },
      ],
    };

    try {
      await DataService.addDocument(`thoughts-questions`, questionData);
      setStandaloneAnswer("");
      fetchThoughts();
    } catch (error) {
      console.error("Error adding thought:", error);
      Alert.alert("Error", "Failed to save thought");
    }
  };

  const editThought = async (item) => {
    console.log("Editing thought:", item);

    setAlertConfig({
      title: "Edit Thought",
      value: item.question || "Enter Question", // Handle empty questions
      allowEmpty: true, // Allow editing of empty questions
      onContinue: async (data) => {
        setAlertVisible(false);
        try {
          // Allow empty questions to be edited and always update regardless of value
          await DataService.updateQuestions(
            "thoughts-questions",
            data || "", // Allow empty string
            item.id
          );
          fetchThoughts();
        } catch (e) {
          console.error("Error updating thought:", e);
          Alert.alert("Error", "Failed to update thought");
        }
      },
    });
    setAlertVisible(true);
  };

  const toggleExpand = (index) => {
    setExpandedIndex(index === expandedIndex ? null : index);
  };

  return (
    <LinearGradient colors={["#5885AF", "#5885AF"]} style={styles.background}>
      <Header onBack={() => navigation.goBack()} title="Thoughts" />

      <View style={styles.container}>
        {/* List of Submitted Thoughts */}

        <FlatList
          data={thoughts}
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

                    {isAdmin && (
                      <TouchableOpacity
                        onPress={() => editThought(item)}
                        style={{ marginRight: 5 }}
                      >
                        <AntDesign name="edit" size={24} color="#FFF" />
                      </TouchableOpacity>
                    )}

                    <Ionicons
                      name={
                        expandedIndex === index
                          ? "chevron-forward"
                          : "chevron-down"
                      }
                      size={24}
                      color="#FFF"
                    />
                  </View>
                </View>
              </TouchableOpacity>
              {expandedIndex === index && (
                <ExpandedForm
                  thought={item}
                  index={index}
                  thoughts={thoughts}
                  setThoughts={setThoughts}
                  fetchThoughts={fetchThoughts}
                  isAdmin={isAdmin}
                />
              )}
            </>
          )}
        />

        {/* Bottom Input Field for Standalone Answer - Only for non-admin users */}
        {!isAdmin && (
          <View style={[styles.bottomContainer, { bottom: 20 }]}>
            <View style={{ flexDirection: "row" }}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Share your thought..."
                  placeholderTextColor="#FFFFFF"
                  value={standaloneAnswer}
                  onChangeText={setStandaloneAnswer}
                  autoCapitalize="none"
                  selectionColor="#FFFFFF"
                />
              </View>
              <TouchableOpacity
                onPress={addStandaloneAnswer}
                style={styles.sendButton}
              >
                <Ionicons name="paper-plane-outline" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Admin Input Fields */}
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
              <TouchableOpacity onPress={addThought} style={styles.sendButton}>
                <Ionicons name="paper-plane-outline" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            {/* <TouchableOpacity style={styles.questionIcon}>
            <Ionicons name="help" size={24} color="#fff" />
          </TouchableOpacity> */}
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
  thought,
  index,
  thoughts,
  setThoughts,
  fetchThoughts,
  isAdmin,
}) => {
  const [subAnswerText, setSubAnswertText] = useState("");
  const [filteredAnswers, setFilteredAnswers] = useState([]);

  useEffect(() => {
    // Filter answers based on user ID and time
    if (thought?.answers) {
      const userId = auth.currentUser.uid;

      // Use the centralized filtering method
      DataService.filterAnswersForUser(thought.answers, userId).then(
        (filtered) => {
          setFilteredAnswers(filtered);
        }
      );
    }
  }, [thought]);

  const handleAddSubThought = async () => {
    if (subAnswerText.trim()) {
      const data = {
        answerText: subAnswerText,
      };

      await DataService.updateDocument(`thoughts-questions`, data, thought.id);
      setSubAnswertText("");
      fetchThoughts();
    }
  };

  // Don't show answers or input field for admins
  if (isAdmin) {
    return null;
  }

  return (
    <View style={styles.expandedContainer}>
      {filteredAnswers.map((answer, subIndex) => (
        <View key={subIndex} style={styles.subThoughtItem}>
          <Text style={styles.subThoughtText}>{answer.answerText}</Text>
        </View>
      ))}

      <View style={styles.subThoughtInputContainer}>
        <TextInput
          style={styles.expandedInput}
          placeholder="Answer this question"
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

export default Thoughts;

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
    color: "#FFFFFF",
    fontSize: 16,
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
  helpfulSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  likeDislike: {
    flexDirection: "row",
    gap: 10,
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
    color: "#FFF",
    fontSize: 16,
    paddingVertical: 0, // Adjusts alignment
  },
  sendButton: {
    marginLeft: 10,
    color: "#fff",
    justifyContent: "center", // Centers the icon vertically
  },
  questionIcon: {
    backgroundColor: "#274472",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
