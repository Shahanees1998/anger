// Import necessary libraries
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
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
  const [selectedSubquestionId, setSelectedSubquestionId] = useState(null);
  const [subItems, setSubItems] = useState([]);
  const [subItemEdit, setSubItemEdit] = useState({ id: '', question: '', answer: '' });
  const [loading, setLoading] = useState(false);
  const [answerOptions, setAnswerOptions] = useState([]);
  const [newAnswerOption, setNewAnswerOption] = useState('');
  const [selectedAnswerOption, setSelectedAnswerOption] = useState(null);
  const questionInputRef = useRef(null);
  const answerInputRef = useRef(null);

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
    return Array.from({ length: 9 }, (_, index) => ({
      id: `answer_${questionId}_${subquestionId}_${index}`,
      answerText: ``,
      questionId,
      subquestionId,
      createdAt: new Date(),
      createdBy: 'system'
    }));
  };

  const getAnswers = (item) => {
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

  const showSubItems = async (subquestion) => {
    setSelectedSubquestionId(subquestion.id);
    setSelectedCardId(null); // Clear any previous selection
    
    if (isAdmin) {
      try {
        const items = await DataService.getSubItems(
          subquestion.questionId,
          subquestion.id,
          'needs-questions'
        );
        setSubItems(items);
        loadAnswerOptions(subquestion.id);
      } catch (error) {
        console.error('Error loading sub-items:', error);
        Alert.alert('Error', 'Failed to load sub-items');
      }
    } else {
      loadAnswerOptions(subquestion.id);
    }
  };

  const handleSubItemUpdate = async () => {
    if (!subItemEdit.id || (!subItemEdit.question && !subItemEdit.answer)) {
      Alert.alert('Error', 'Please select a sub-item and enter question or answer');
      return;
    }

    try {
      const success = await DataService.updateSubItem({
        questionId: knowledge[0]?.questionId,
        subquestionId: selectedSubquestionId,
        subItemId: subItemEdit.id,
        question: subItemEdit.question,
        answer: subItemEdit.answer
      }, 'needs-questions');

      if (success) {
        Alert.alert('Success', 'Sub-item updated successfully');
        setSubItemEdit({ id: '', question: '', answer: '' });
        // Refresh sub-items
        const items = await DataService.getSubItems(
          knowledge[0]?.questionId,
          selectedSubquestionId,
          'needs-questions'
        );
        setSubItems(items);
      } else {
        Alert.alert('Error', 'Failed to update sub-item');
      }
    } catch (error) {
      console.error('Error updating sub-item:', error);
      Alert.alert('Error', 'Failed to update sub-item');
    }
  };

  const loadAnswerOptions = async (subquestionId) => {
    try {
      const options = await DataService.getAnswerOptions(subquestionId, 'needs-questions');
      setAnswerOptions(options || []);
    } catch (error) {
      console.error('Error loading answer options:', error);
    }
  };

  const addAnswerOption = async () => {
    if (!newAnswerOption.trim() || !selectedSubquestionId) {
      Alert.alert('Error', 'Please enter an answer option and select a subquestion');
      return;
    }

    try {
      const optionId = Math.random().toString(36).substr(2, 20);
      const newOption = {
        id: optionId,
        text: newAnswerOption.trim(),
        subquestionId: selectedSubquestionId,
        createdAt: new Date(),
        createdBy: auth.currentUser.uid
      };

      await DataService.addAnswerOption(newOption, 'needs-questions');
      setNewAnswerOption('');
      loadAnswerOptions(selectedSubquestionId);
      Alert.alert('Success', 'Answer option added successfully');
    } catch (error) {
      console.error('Error adding answer option:', error);
      Alert.alert('Error', 'Failed to add answer option');
    }
  };

  const deleteAnswerOption = async (optionId) => {
    try {
      await DataService.deleteAnswerOption(optionId, selectedSubquestionId, 'needs-questions');
      loadAnswerOptions(selectedSubquestionId);
      Alert.alert('Success', 'Answer option deleted successfully');
    } catch (error) {
      console.error('Error deleting answer option:', error);
      Alert.alert('Error', 'Failed to delete answer option');
    }
  };

  const selectAnswerOption = async (option) => {
    if (!isAdmin) {
      setSelectedAnswerOption(option.id);
      
      const userAnswer = {
        questionId: knowledge[0]?.questionId,
        subquestionId: selectedSubquestionId,
        optionId: option.id,
        userId: auth.currentUser.uid,
        answer: option.text,
        createdAt: new Date(),
      };

      try {
        await DataService.checkExistingRecordAndUpdate(
          "user-needs-answers",
          userAnswer
        );
        Alert.alert("Success", "Your answer has been saved");
        setSelectedSubquestionId(null);
        setAnswerOptions([]);
        setSelectedAnswerOption(null);
      } catch (error) {
        console.error("Error saving answer:", error);
        Alert.alert("Error", "Failed to save your answer");
      }
    }
  };

  const subQuestions = (questionId) => {
    return Array.from({ length: 9 }, (_, index) => ({
      id: `sub_${questionId}_${index}`,
      subquestionText: ``,
      questionId,
      answers: generateDummyAnswers(questionId, `sub_${questionId}_${index}`),
      subItems: Array.from({ length: 9 }, (_, subIndex) => ({
        id: `subitem_sub_${questionId}_${index}_${subIndex}`,
        question: '',
        answer: '',
        createdAt: new Date(),
        createdBy: 'system'
      }))
    }));
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

      const subquestions = subQuestions(newQuestionId);
      const newQuestion = {
        question: question,
        questionId: newQuestionId,
        subquestions,
      };

      try {
        await DataService.addDocument(
          `needs-questions`,
          newQuestion,
          newQuestionId
        );
        loadKnowledge();
        setQuestion("");
        Alert.alert("Success", "Main question created with 9 subquestions (9x9 structure initialized)");
      } catch (error) {
        console.error("Error adding question:", error);
        Alert.alert("Error", "Failed to save question");
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
      "needs-questions"
    );
    setUpdateQuestion({ text: "", subquestionId: "", questionId: "" });

    loadKnowledge();
  };



  const renderNeedsCard = ({ item }) => {
    const isSelected = updateQuestion.subquestionId === item.id;
    const hasAnswers = item.answers && item.answers.some((a) => a.answerText.trim() !== "");

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
              if (hasAnswers) {
                showSubItems(item);
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
              setUpdateQuestion({
                subquestionId: item.id,
                questionId: item.questionId,
                text: item.subquestionText,
              });
            }
          }}
        >
          <Text style={[styles.cardText, isSelected && styles.adminSelectedText]}>
            {item.subquestionText || (isAdmin ? "Empty - Click to edit" : "Not available")}
          </Text>
        </TouchableOpacity>
        {isAdmin && (
          <TouchableOpacity
            style={styles.subItemsButton}
            onPress={() => showSubItems(item)}
          >
            <Ionicons name="grid-outline" size={16} color="#FFF" />
            <Text style={styles.subItemsButtonText}>9 Items</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderSubItemCard = ({ item }) => {
    const isSelected = subItemEdit.id === item.id;
    
    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.subItemCard,
          isSelected && styles.selectedSubItemCard,
          { width: '31%' }
        ]}
        onPress={() => {
          // Dismiss keyboard first to avoid focus issues
          Keyboard.dismiss();
          
          setSubItemEdit({
            id: item.id,
            question: item.question || '',
            answer: item.answer || ''
          });
          
          // Focus on the question input after keyboard is dismissed
          setTimeout(() => {
            if (questionInputRef.current) {
              questionInputRef.current.focus();
            }
          }, 300);
        }}
      >
        <Text style={styles.subItemText}>
          {item.question && item.answer 
            ? `Q: ${item.question.slice(0, 20)}${item.question.length > 20 ? '...' : ''}` 
            : 'Empty - Click to edit'}
        </Text>
      </TouchableOpacity>
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
        onBack={() => navigation.goBack()}
        title="Need" 
      />

      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="white" />
        ) : (
          <FlatList
            data={knowledge}
            keyExtractor={(item, index) => index.toString()}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item, index }) => {
              // Show all subquestions for admin, filter for users
              const subquestions = item.subquestions?.filter(sq => {
                if (isAdmin) {
                  return true; // Admin sees all subquestions
                }
                return sq.subquestionText && sq.subquestionText.trim() !== "" &&
                       !sq.subquestionText.includes("needs text");
              }) || [];
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
                      {selectedSubquestionId ? (
                        <>
                          <View style={styles.subItemHeader}>
                            <Text style={styles.subItemHeaderText}>{isAdmin ? "9 Sub-Items & Answer Options" : "Answer Options"}</Text>
                            <TouchableOpacity
                              onPress={() => {
                                setSelectedSubquestionId(null);
                                setSubItems([]);
                                setSubItemEdit({ id: '', question: '', answer: '' });
                                setAnswerOptions([]);
                                setSelectedAnswerOption(null);
                                setNewAnswerOption('');
                              }}
                            >
                              <Ionicons name="close" size={24} color="#FFF" />
                            </TouchableOpacity>
                          </View>
                          
                          {isAdmin && (
                            <>
                              <ScrollView
                                horizontal={false}
                                keyboardShouldPersistTaps="handled"
                                style={{ maxHeight: 300 }}
                              >
                                <View style={styles.grid}>
                                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                    {subItems.map((item) => renderSubItemCard({ item }))}
                                  </View>
                                </View>
                              </ScrollView>
                              {subItemEdit.id && (
                                <KeyboardAvoidingView
                                  behavior={Platform.OS === "ios" ? "padding" : "height"}
                                  style={styles.subItemEditContainer}
                                >
                                  <TextInput
                                    ref={questionInputRef}
                                    style={styles.subItemInput}
                                    placeholder="Enter question..."
                                    placeholderTextColor="#FFFFFF80"
                                    value={subItemEdit.question}
                                    onChangeText={(text) => setSubItemEdit({...subItemEdit, question: text})}
                                    multiline
                                    textAlignVertical="top"
                                    autoFocus={false}
                                    onSubmitEditing={() => {
                                      if (answerInputRef.current) {
                                        answerInputRef.current.focus();
                                      }
                                    }}
                                    returnKeyType="next"
                                  />
                                  <TextInput
                                    ref={answerInputRef}
                                    style={styles.subItemInput}
                                    placeholder="Enter answer..."
                                    placeholderTextColor="#FFFFFF80"
                                    value={subItemEdit.answer}
                                    onChangeText={(text) => setSubItemEdit({...subItemEdit, answer: text})}
                                    multiline
                                    textAlignVertical="top"
                                    autoFocus={false}
                                    returnKeyType="done"
                                    onSubmitEditing={Keyboard.dismiss}
                                  />
                                  <TouchableOpacity
                                    onPress={handleSubItemUpdate}
                                    style={styles.subItemSaveButton}
                                  >
                                    <Ionicons name="checkmark" size={24} color="#274472" />
                                  </TouchableOpacity>
                                </KeyboardAvoidingView>
                              )}
                              
                              <View style={styles.answerOptionsHeader}>
                                <Text style={styles.answerOptionsHeaderText}>Answer Options</Text>
                              </View>
                              
                              <View style={styles.addOptionContainer}>
                                <TextInput
                                  style={styles.addOptionInput}
                                  placeholder="Add new answer option..."
                                  placeholderTextColor="#FFFFFF80"
                                  value={newAnswerOption}
                                  onChangeText={setNewAnswerOption}
                                />
                                <TouchableOpacity
                                  onPress={addAnswerOption}
                                  style={styles.addOptionButton}
                                >
                                  <Ionicons name="add" size={24} color="#274472" />
                                </TouchableOpacity>
                              </View>
                            </>
                          )}
                          
                          <FlatList
                            data={answerOptions}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                              <TouchableOpacity
                                style={[
                                  styles.answerOptionCard,
                                  selectedAnswerOption === item.id && styles.selectedAnswerOption
                                ]}
                                onPress={() => selectAnswerOption(item)}
                              >
                                <Text style={styles.answerOptionText}>{item.text}</Text>
                                {isAdmin && (
                                  <TouchableOpacity
                                    style={styles.deleteOptionButton}
                                    onPress={() => deleteAnswerOption(item.id)}
                                  >
                                    <Ionicons name="trash" size={16} color="#FF4444" />
                                  </TouchableOpacity>
                                )}
                                {!isAdmin && (
                                  <Ionicons
                                    name={selectedAnswerOption === item.id ? "radio-button-on" : "radio-button-off"}
                                    size={24}
                                    color="#FFF"
                                  />
                                )}
                              </TouchableOpacity>
                            )}
                            numColumns={1}
                            contentContainerStyle={styles.answerOptionsGrid}
                          />
                        </>
                      ) : (
                        <FlatList
                          data={selectedCardId ? subAnswers : subquestions}
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
                      )}
                    </>
                  )}
                </>
              );
            }}
          />
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
  subItemsButton: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#274472',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  subItemsButtonText: {
    color: '#FFF',
    fontSize: 10,
    marginLeft: 2,
  },
  subItemCard: {
    margin: 4,
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: '#FFFFFF2A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  selectedSubItemCard: {
    backgroundColor: '#FFD700',
  },
  subItemText: {
    color: '#FFF',
    fontSize: 12,
    textAlign: 'center',
  },
  subItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  subItemHeaderText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  subItemEditContainer: {
    padding: 16,
    backgroundColor: '#41729F',
    borderRadius: 10,
    margin: 16,
  },
  subItemInput: {
    backgroundColor: '#FFFFFF2A',
    color: '#FFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    minHeight: 40,
  },
  subItemSaveButton: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 8,
  },
  answerOptionsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#FFFFFF3A',
    marginTop: 16,
  },
  answerOptionsHeaderText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addOptionContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  addOptionInput: {
    flex: 1,
    backgroundColor: '#FFFFFF2A',
    color: '#FFF',
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  addOptionButton: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  answerOptionsGrid: {
    paddingHorizontal: 16,
  },
  answerOptionCard: {
    backgroundColor: '#FFFFFF2A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedAnswerOption: {
    backgroundColor: '#274472',
  },
  answerOptionText: {
    color: '#FFF',
    fontSize: 14,
    flex: 1,
  },
  deleteOptionButton: {
    padding: 4,
  },
});
