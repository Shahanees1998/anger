// Import necessary libraries
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth, db } from "../firebase";
import DataService from "@/services/DataService";

// Reusable Header component
const Header = ({ onBack, title }) => (
  <View style={styles.header}>
    <TouchableOpacity style={styles.backButton} onPress={onBack}>
      <Ionicons name="arrow-back" size={24} color="#616161" />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>{title}</Text>
  </View>
);

// Reusable Card component
// const FeelingsCard = ({ item, isSelected, onPress }) => (
//   <TouchableOpacity
//     style={[styles.card, isSelected && styles.selectedCard]}
//     onPress={onPress}
//   >
//     <View style={styles.circle}>
//       <Ionicons name="arrow-forward" size={24} color="#274472" />
//     </View>
//     <Text style={styles.cardText}>{item.text}</Text>
//   </TouchableOpacity>
// );

// const RadioButtonCard = ({ item, isSelected, onPress }) => (
//   <TouchableOpacity
//     style={[styles.card, isSelected && styles.selectedCard]}
//     onPress={onPress}
//   >
//     <Ionicons
//       name={isSelected ? "radio-button-on" : "radio-button-off"}
//       size={36}
//       color="#fff"
//     />
//     <Text style={styles.cardText}>{item.text}</Text>
//   </TouchableOpacity>
// );

const Needs = ({ navigation }) => {
  const [knowledge, setKnowledge] = useState([]);
  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [subAnswers, setSubAnswers] = useState([]);

  const [updateQuestion, setUpdateQuestion] = useState({
    text: "",
    questionId: "",
    subquestionId: "",
  });

  const [selectedRadioButtonId, setSelectedRadioButtonId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [thirdLevelItems, setThirdLevelItems] = useState([]);
  const [thirdLevelSelected, setThirdLevelSelected] = useState(false);
  const [thirdLevelInput, setThirdLevelInput] = useState("");
  const [editingThirdLevel, setEditingThirdLevel] = useState(null);
  const [thirdLevelAnswer, setThirdLevelAnswer] = useState("");

  const loadKnowledge = async () => {
    try {
      setLoading(true);
      const needsList = await DataService.getFeelingAndNeedsQuestions(
        `needs-questions`
      );
      setKnowledge(needsList);
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

  const generateDummyAnswers = (questionId, subquestionId) => {
    // Return empty array instead of dummy answers
    return [];
  };

  const getAnswers = (item) => {
    // Check if this item has third-level items
    if (item.thirdLevel && item.thirdLevel.length > 0) {
      // Navigate to third level view
      setThirdLevelItems(item.thirdLevel);
      setThirdLevelSelected(true);
      setSelectedCardId(null);
      return;
    }

    // Check if there are answers available
    if (!item.answers || item.answers.length === 0) {
      Alert.alert("Error", "No answers available for this item");
      return;
    }

    // Filter answers using the centralized filtering logic
    const userId = auth.currentUser.uid;
    
    // Use the new filtering method that properly handles admin answers
    DataService.filterAnswersForUser(item.answers, userId).then((filteredAnswers) => {
      // Additionally filter out empty answers
      const nonEmptyAnswers = filteredAnswers.filter(
        (answer) => answer.answerText && answer.answerText.trim() !== ""
      );
      setSubAnswers(nonEmptyAnswers);
    });
    
    setSelectedCardId(item.id);
  };

  const subQuestions = (questionId) => {
    // Return empty array instead of dummy subquestions
    return [];
  };

  const addQuestion = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error("No authenticated user");

    if (question.trim()) {
      const newQuestionId = Math.random().toString(36).substr(2, 20);

      const subquestions = subQuestions(newQuestionId);
      const newQuestion = {
        question: question,
        questionId: newQuestionId, // Store the question ID
        subquestions, // 9 subquestions each with 9 dummy answers
      };

      try {
        await DataService.addDocument(
          `needs-questions`,
          newQuestion,
          newQuestionId
        );
        loadKnowledge();
      } catch (error) {
        console.error("Error adding thought:", error);
        Alert.alert("Error", "Failed to save thought");
      }

      setQuestion("");
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
      "needs-questions"
    );
    setUpdateQuestion({ text: "", subquestionId: "", questionId: "" });

    loadKnowledge();
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
      answers: [], // Start with empty answers array
    };

    try {
      await DataService.addThirdLevelItem(
        "needs-questions",
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

  const renderThirdLevelCard = ({ item }) => {
    const hasAnswers = item.answers && item.answers.some((a) => a.answerText && a.answerText.trim() !== "");
    const isSelected = selectedCardId === item.id;

    return (
      <View
        style={[
          styles.card,
          isSelected && styles.selectedCard,
          !hasAnswers && !isAdmin && styles.disabledCard,
        ]}
      >
        {!isAdmin && (
          <TouchableOpacity
            style={[styles.circle, !hasAnswers && styles.disabledCircle]}
            onPress={() => {
              if (hasAnswers) {
                getAnswers(item);
              } else {
                Alert.alert("Info", "No content available for this item yet");
              }
            }}
            disabled={!hasAnswers}
          >
            <Ionicons
              name="arrow-forward"
              size={24}
              color="#274472"
            />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => {
            if (isAdmin) {
              // Toggle selection for admin to add answers
              setSelectedCardId(isSelected ? null : item.id);
            }
          }}
        >
          <Text style={[styles.cardText, isSelected && styles.adminSelectedText]}>
            {item.text}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderNeedsCard = ({ item }) => {
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
            onPress={() => {
              if (hasAnswers || item.thirdLevel) {
                getAnswers(item);
              } else {
                Alert.alert("Info", "No content available for this item yet");
              }
            }}
            disabled={!hasAnswers && !item.thirdLevel}
          >
            <Ionicons 
              name={
                item.thirdLevel && item.thirdLevel.length > 0
                  ? "git-branch-outline"
                  : "arrow-forward"
              } 
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
          <Text style={[styles.cardText, isSelected && styles.adminSelectedText]}>
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
    setSelectedRadioButtonId(item.id);

    const userAnswer = {
      questionId: item.questionId,
      subquestionId: item.subquestionId,
      answerId: item.id,
      userId: auth.currentUser.uid,
    };

    try {
      await DataService.checkExistingRecordAndUpdate(
        "user-needs-answers",
        userAnswer
      );
      Alert.alert("Your answer has been submitted");
      setSelectedCardId(null);
    } catch (error) {
      console.log(error, "error");
    }
  };

  const renderRadioButtonCard = ({ item }) => (
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

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }
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
        title={thirdLevelSelected ? "Sub-items" : "Need"} 
      />

      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="white" />
        ) : (
          <>
          {thirdLevelSelected ? (
            <>
            <FlatList
              data={selectedCardId ? subAnswers : thirdLevelItems}
              keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
              renderItem={
                selectedCardId
                  ? renderRadioButtonCard
                  : renderThirdLevelCard
              }
              numColumns={3}
              contentContainerStyle={styles.grid}
              columnWrapperStyle={styles.columnWrapper}
            />
            {isAdmin && selectedCardId && (
              <View style={styles.bottomContainer}>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Add answer to third-level item..."
                    placeholderTextColor="#FFFFFF"
                    value={thirdLevelAnswer}
                    onChangeText={setThirdLevelAnswer}
                  />
                  <TouchableOpacity 
                    onPress={async () => {
                      if (thirdLevelAnswer.trim()) {
                        // Find the selected third-level item
                        const selectedItem = thirdLevelItems.find(item => item.id === selectedCardId);
                        if (selectedItem) {
                          try {
                            await DataService.updateThirdLevelAnswer(
                              "needs-questions",
                              selectedItem.questionId,
                              selectedItem.subquestionId,
                              selectedItem.id,
                              `answer_${Math.random().toString(36).substr(2, 20)}`,
                              thirdLevelAnswer.trim()
                            );
                            setThirdLevelAnswer("");
                            loadKnowledge();
                            Alert.alert("Success", "Answer added to third-level item");
                          } catch (error) {
                            Alert.alert("Error", "Failed to add answer");
                          }
                        }
                      }
                    }} 
                    style={styles.sendButton}
                  >
                    <Ionicons name="paper-plane-outline" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            </>
          ) : (
          <FlatList
            data={knowledge}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => {
              // Filter out empty subquestions
              const squesutions = item.subquestions?.filter(sq => 
                sq.subquestionText && sq.subquestionText.trim() !== "" &&
                !sq.subquestionText.includes("needs text")
              ) || [];
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
                            : renderNeedsCard
                        }
                        numColumns={3}
                        contentContainerStyle={styles.grid}
                        columnWrapperStyle={styles.columnWrapper}
                      />
                    </>
                  )}
                </>
              );
            }}
          />
          )}
          </>
        )}

        {isAdmin && knowledge.length == 0 && (
          <View style={styles.inputWrapper}>
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

export default Needs;

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
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  card: {
    flex: 1,
    margin: 4,
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: "#FFFFFF1A",
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
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#41729F",
    padding: 12,
    borderRadius: 10,
    width: "90%",
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
  },
  sendButton: {
    marginLeft: 10,
    justifyContent: "center",
  },
  disabledCard: {
    opacity: 0.5,
  },
  disabledCircle: {
    opacity: 0.5,
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
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  adminSelectedText: {
    color: "#FFD700",
  },
  thirdLevelInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 10,
  },
  thirdLevelInput: {
    flex: 1,
    backgroundColor: "#41729F",
    borderRadius: 8,
    padding: 8,
    color: "#FFFFFF",
    fontSize: 12,
  },
  addThirdLevelButton: {
    marginLeft: 8,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
});
