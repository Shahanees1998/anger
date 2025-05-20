import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../firebase";
// import { v4 as uuidv4 } from "uuid";
import DataService from "@/services/DataService";

const Feelings = ({ navigation }) => {
  const [knowledge, setKnowledge] = useState([]);
  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [selectedRadioButtonId, setSelectedRadioButtonId] = useState(null);
  const [subAnswers, setSubAnswers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [updateQuestion, setUpdateQuestion] = useState({
    text: "",
    questionId: "",
    subquestionId: "",
  });
  const [loading, setLoading] = useState(false);
  const [thirdLevelItems, setThirdLevelItems] = useState([]);
  const [thirdLevelSelected, setThirdLevelSelected] = useState(false);
  const [thirdLevelInput, setThirdLevelInput] = useState("");
  const [editingThirdLevel, setEditingThirdLevel] = useState(null);

  const loadKnowledge = async () => {
    try {
      setLoading(true);
      const feelingList = await DataService.getFeelingAndNeedsQuestions(
        `feelings-questions`
      );
      setKnowledge(feelingList);
      setLoading(false);
    } catch (error) {
      setLoading(false);
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

  const toggleExpand = (index) => {
    setExpandedIndex(index === expandedIndex ? null : index);
    setSelectedCardId(null);
    setUpdateQuestion({ text: "", subquestionId: "", questionId: "" });
  };

  const feelingsData = Array.from({ length: 9 }, (_, index) => ({
    id: index,
    text: `Feeling ${index + 1}`,
  }));

  const generateDummyAnswers = (
    questionId,
    subquestionId,
    thirdLevelId = null
  ) => {
    const dummyAnswers = [];
    for (let i = 1; i <= 9; i++) {
      dummyAnswers.push({
        questionId,
        subquestionId,
        thirdLevelId,
        answerText: "",
        id: `answer_${Math.random().toString(36).substr(2, 20)}`,
        createdBy: auth.currentUser.uid,
        order: i,
      });
    }
    return dummyAnswers;
  };

  const generateThirdLevelItems = (questionId, subquestionId) => {
    const thirdLevel = [];
    for (let i = 1; i <= 9; i++) {
      const thirdLevelId = `third_${Math.random().toString(36).substr(2, 20)}`;
      thirdLevel.push({
        text: `Sub-item ${i}`,
        id: thirdLevelId,
        questionId,
        subquestionId,
        answers: generateDummyAnswers(questionId, subquestionId, thirdLevelId),
      });
    }
    return thirdLevel;
  };

  const generateSubQuestions = (questionId) => {
    const subquestions = [];
    for (let i = 1; i <= 9; i++) {
      const subquestionId = `subquestion_${Math.random()
        .toString(36)
        .substr(2, 20)}`;
      subquestions.push({
        subquestionText: `Item ${i}`,
        id: subquestionId,
        questionId,
        thirdLevel: generateThirdLevelItems(questionId, subquestionId),
        answers: generateDummyAnswers(questionId, subquestionId),
      });
    }
    return subquestions;
  };

  const addQuestion = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error("No authenticated user");

    if (knowledge.length > 0) {
      Alert.alert("Error", "Only one main question is allowed");
      return;
    }

    if (question.trim()) {
      const newQuestionId = Math.random().toString(36).substr(2, 20);
      const subquestions = generateSubQuestions(newQuestionId);
      const newQuestion = {
        question: question,
        questionId: newQuestionId,
        subquestions,
      };

      try {
        await DataService.addDocument(
          `feelings-questions`,
          newQuestion,
          newQuestionId
        );
        loadKnowledge();
        setQuestion("");
      } catch (error) {
        console.error("Error adding thought:", error);
        Alert.alert("Error", "Failed to save thought");
      }
    }
  };

  const handleUpdateSubQuestions = async () => {
    if (
      !updateQuestion.subquestionId &&
      !updateQuestion.questionId &&
      !updateQuestion.text
    ) {
      Alert.alert("Error", "Please click on below item");
      return;
    }
    await DataService.updateFeelingsAndNeedsSubquestions(
      updateQuestion,
      "feelings-questions"
    );
    setUpdateQuestion({ text: "", subquestionId: "", questionId: "" });

    loadKnowledge();
  };

  const getAnswers = (item) => {
    if (!item.answers || item.answers.length === 0) {
      Alert.alert("Error", "No answers available for this item");
      return;
    }

    if (item.thirdLevel) {
      setThirdLevelItems(item.thirdLevel);
      setThirdLevelSelected(true);
    } else {
      setSubAnswers(
        item.answers.filter((answer) => answer.answerText.trim() !== "")
      );
      setSelectedCardId(item.id);
    }
  };

  const handleBackFromThirdLevel = () => {
    setThirdLevelSelected(false);
    setThirdLevelItems([]);
  };

  const handleAddThirdLevel = async (subquestionId, questionId) => {
    if (!thirdLevelInput.trim()) {
      Alert.alert("Error", "Please enter text for the third level item");
      return;
    }

    const newThirdLevel = {
      text: thirdLevelInput,
      id: `third_${Math.random().toString(36).substr(2, 20)}`,
      questionId,
      subquestionId,
      answers: generateDummyAnswers(questionId, subquestionId),
    };

    try {
      await DataService.addThirdLevelItem(
        "feelings-questions",
        questionId,
        subquestionId,
        newThirdLevel
      );
      setThirdLevelInput("");
      setEditingThirdLevel(null);
      loadKnowledge();
    } catch (error) {
      console.error("Error adding third level item:", error);
      Alert.alert("Error", "Failed to add third level item");
    }
  };

  const renderFeelingsCard = ({ item }) => {
    const isSelected = updateQuestion.subquestionId === item.id;
    const hasAnswers =
      (item.answers && item.answers.some((a) => a.answerText.trim() !== "")) ||
      (item.thirdLevel && item.thirdLevel.length > 0);

    return (
      <View
        style={[
          styles.card,
          selectedCardId === item.id && styles.selectedCard,
          isSelected && styles.adminSelectedCard,
          !hasAnswers && !isAdmin && styles.disabledCard,
        ]}
      >
        {!isAdmin && (
          <TouchableOpacity
            style={[styles.circle, !hasAnswers && styles.disabledCircle]}
            onPress={() => hasAnswers && getAnswers(item)}
          >
            <Ionicons
              name={item.thirdLevel ? "git-branch-outline" : "arrow-forward"}
              size={24}
              color="#274472"
            />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => {
            if (isAdmin) {
              setEditingThirdLevel(item.id);
              setUpdateQuestion({
                subquestionId: item.id,
                questionId: item.questionId,
                text: item.subquestionText,
              });
            }
          }}
        >
          <Text
            style={[styles.cardText, isSelected && styles.adminSelectedText]}
          >
            {item.subquestionText}
          </Text>
        </TouchableOpacity>
        {isAdmin && editingThirdLevel === item.id && (
          <View style={styles.thirdLevelInputContainer}>
            <TextInput
              style={styles.thirdLevelInput}
              placeholder="Add sub-item..."
              placeholderTextColor="#FFFFFF80"
              value={thirdLevelInput}
              onChangeText={setThirdLevelInput}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => handleAddThirdLevel(item.id, item.questionId)}
              style={styles.addThirdLevelButton}
            >
              <Ionicons name="add-circle" size={24} color="#274472" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const updateAnswers = async (item) => {
    if (!item.answerText && !isAdmin) {
      Alert.alert("Error", "This answer is not available yet");
      return;
    }

    setSelectedRadioButtonId(item.id);

    const userAnswer = {
      questionId: item.questionId,
      subquestionId: item.subquestionId,
      answerId: item.id,
      userId: auth.currentUser.uid,
      answer: item.answerText,
      createdAt: new Date(),
    };

    try {
      await DataService.checkExistingRecordAndUpdate(
        "user-feelings-answers",
        userAnswer
      );
      Alert.alert("Success", "Your answer has been saved");
      setSelectedCardId(null);
      loadKnowledge();
    } catch (error) {
      console.error("Error saving answer:", error);
      Alert.alert("Error", "Failed to save your answer");
    }
  };

  const renderRadioButtonCard = ({ item }) => {
    return (
      <TouchableOpacity
        style={[
          styles.card,
          selectedRadioButtonId === item.id && styles.selectedCard,
        ]}
        onPress={() => updateAnswers(item)}
      >
        <View>
          <Ionicons
            name={
              selectedRadioButtonId === item.id
                ? "radio-button-on"
                : "radio-button-off"
            }
            size={36}
            color="#fff"
          />
        </View>
        <Text style={styles.cardText}>{item.answerText}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={["#5885AF", "#5885AF"]} style={styles.background}>
      <Header
        onBack={() => {
          if (thirdLevelSelected) {
            handleBackFromThirdLevel();
          } else {
            navigation.goBack();
          }
        }}
        title={thirdLevelSelected ? "Sub-items" : "Feelings"}
      />
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="white" />
        ) : (
          <FlatList
            data={thirdLevelSelected ? thirdLevelItems : knowledge}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => {
              const squesutions = item.subquestions;
              return (
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
                            expandedIndex === index
                              ? "chevron-up"
                              : "chevron-down"
                          }
                          size={24}
                          color="#FFF"
                        />
                      </View>
                    </View>
                  </TouchableOpacity>
                  {expandedIndex === index && (
                    <>
                      {isAdmin && (
                        <View style={styles.subThoughtInputContainer}>
                          <TextInput
                            style={styles.expandedInput}
                            placeholder="update question here..."
                            placeholderTextColor="#FFFFFF80"
                            value={updateQuestion.text}
                            onChangeText={(e) =>
                              setUpdateQuestion({ ...updateQuestion, text: e })
                            }
                            autoCapitalize="none"
                            selectionColor="#FFFFFF"
                          />
                          <TouchableOpacity
                            onPress={handleUpdateSubQuestions}
                            style={styles.subThoughtSendButton}
                          >
                            <Ionicons
                              name="paper-plane-outline"
                              size={24}
                              color="#274472"
                            />
                          </TouchableOpacity>
                        </View>
                      )}
                      <FlatList
                        data={selectedCardId ? subAnswers : squesutions}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={
                          selectedCardId
                            ? renderRadioButtonCard
                            : renderFeelingsCard
                        }
                        numColumns={3}
                        contentContainerStyle={styles.grid}
                      />
                    </>
                  )}
                </>
              );
            }}
          />
        )}
        {isAdmin && knowledge.length == 0 && (
          <View style={styles.bottomContainer}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter your text..."
                placeholderTextColor="#FFFFFF"
                value={question}
                onChangeText={setQuestion}
              />
              <TouchableOpacity onPress={addQuestion} style={styles.sendButton}>
                <Ionicons name="paper-plane-outline" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.questionIcon}>
              <Ionicons name="help" size={24} color="#fff" />
            </TouchableOpacity>
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

export default Feelings;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    paddingHorizontal: 20,
  },
  container: {
    flex: 1,
  },
  grid: {
    padding: 16,
  },
  card: {
    flex: 1,
    margin: 8,
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: "#FFFFFF1A",
    boxShadow: "0px 1px 2px 0px #E4E5E73D",
    justifyContent: "center",
    alignItems: "center",
  },
  selectedCard: {
    backgroundColor: "#274472",
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 40,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  cardText: {
    marginTop: 8,
    color: "#FFF",
    fontSize: 14,
    textAlign: "center",
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
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
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#41729F",
    padding: 12,
    borderRadius: 10,
    width: "90%",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    color: "#FFF",
    fontSize: 16,
    paddingVertical: 0,
  },
  questionIcon: {
    backgroundColor: "#274472",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    marginBottom: 10,
  },
  sendButton: {
    marginLeft: 10,

    justifyContent: "center",
  },
  bottomContainer: {
    flexDirection: "row",
    alignItems: "center",
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
  adminSelectedCard: {
    backgroundColor: "#41729F",
    borderWidth: 2,
    borderColor: "#FFF",
  },
  adminSelectedText: {
    fontWeight: "bold",
  },
  disabledCard: {
    opacity: 0.5,
  },
  disabledCircle: {
    opacity: 0.5,
  },
  thirdLevelInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#41729F",
    borderRadius: 5,
    padding: 5,
    marginTop: 5,
    width: "100%",
  },
  thirdLevelInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 12,
    padding: 2,
  },
  addThirdLevelButton: {
    padding: 5,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    marginLeft: 5,
  },
});
