import React, { useEffect, useReducer, useState, useCallback } from "react";
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
import { auth } from "../firebase";
import DataService from "@/services/DataService";

// Import custom components
import { QuestionCard } from "../components/FeelingNeedsComponents/QuestionCard";
import { SubItemEditModal } from "../components/FeelingNeedsComponents/SubItemEditModal";
import { AnswerOptionsList } from "../components/FeelingNeedsComponents/AnswerOptionsList";
import { SubItemsGrid } from "../components/FeelingNeedsComponents/SubItemsGrid";

// State management with reducer
const initialState = {
  knowledge: [],
  loading: false,
  expandedIndex: null,
  selectedSubquestionId: null,
  subItems: [],
  answerOptions: [],
  newAnswerOption: '',
  selectedAnswerOption: null,
  updateQuestion: {
    text: "",
    questionId: "",
    subquestionId: "",
  },
  editModalVisible: false,
  selectedSubItem: null,
  isAdmin: false,
  mainQuestion: "",
  error: null,
};

const actionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_KNOWLEDGE: 'SET_KNOWLEDGE',
  SET_ERROR: 'SET_ERROR',
  TOGGLE_EXPAND: 'TOGGLE_EXPAND',
  SET_SELECTED_SUBQUESTION: 'SET_SELECTED_SUBQUESTION',
  SET_SUB_ITEMS: 'SET_SUB_ITEMS',
  SET_ANSWER_OPTIONS: 'SET_ANSWER_OPTIONS',
  SET_NEW_ANSWER_OPTION: 'SET_NEW_ANSWER_OPTION',
  SET_SELECTED_ANSWER_OPTION: 'SET_SELECTED_ANSWER_OPTION',
  SET_UPDATE_QUESTION: 'SET_UPDATE_QUESTION',
  SET_EDIT_MODAL: 'SET_EDIT_MODAL',
  SET_SELECTED_SUB_ITEM: 'SET_SELECTED_SUB_ITEM',
  SET_IS_ADMIN: 'SET_IS_ADMIN',
  SET_MAIN_QUESTION: 'SET_MAIN_QUESTION',
  RESET_SELECTION: 'RESET_SELECTION',
};

function reducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    case actionTypes.SET_KNOWLEDGE:
      return { ...state, knowledge: action.payload };
    case actionTypes.SET_ERROR:
      return { ...state, error: action.payload };
    case actionTypes.TOGGLE_EXPAND:
      return {
        ...state,
        expandedIndex: state.expandedIndex === action.payload ? null : action.payload,
        selectedSubquestionId: null,
        updateQuestion: initialState.updateQuestion,
      };
    case actionTypes.SET_SELECTED_SUBQUESTION:
      return { ...state, selectedSubquestionId: action.payload };
    case actionTypes.SET_SUB_ITEMS:
      return { ...state, subItems: action.payload };
    case actionTypes.SET_ANSWER_OPTIONS:
      return { ...state, answerOptions: action.payload };
    case actionTypes.SET_NEW_ANSWER_OPTION:
      return { ...state, newAnswerOption: action.payload };
    case actionTypes.SET_SELECTED_ANSWER_OPTION:
      return { ...state, selectedAnswerOption: action.payload };
    case actionTypes.SET_UPDATE_QUESTION:
      return { ...state, updateQuestion: action.payload };
    case actionTypes.SET_EDIT_MODAL:
      return { ...state, editModalVisible: action.payload };
    case actionTypes.SET_SELECTED_SUB_ITEM:
      return { ...state, selectedSubItem: action.payload };
    case actionTypes.SET_IS_ADMIN:
      return { ...state, isAdmin: action.payload };
    case actionTypes.SET_MAIN_QUESTION:
      return { ...state, mainQuestion: action.payload };
    case actionTypes.RESET_SELECTION:
      return {
        ...state,
        selectedSubquestionId: null,
        subItems: [],
        answerOptions: [],
        selectedAnswerOption: null,
        newAnswerOption: '',
      };
    default:
      return state;
  }
}

const FeelingsRevamped = ({ navigation }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load knowledge base
  const loadKnowledge = useCallback(async () => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      const feelingList = await DataService.getFeelingAndNeedsQuestions("feelings-questions");
      dispatch({ type: actionTypes.SET_KNOWLEDGE, payload: feelingList });
    } catch (error) {
      console.error("Failed to load knowledge:", error);
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
    } finally {
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
    }
  }, []);

  // Check authentication and admin status
  const checkAuth = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        navigation.replace("SignIn");
        return;
      }

      const userData = await DataService.getUserData(user.uid);
      dispatch({ type: actionTypes.SET_IS_ADMIN, payload: userData?.isAdmin || false });
    } catch (error) {
      console.error("Auth check failed:", error);
      navigation.replace("SignIn");
    }
  }, [navigation]);

  useEffect(() => {
    checkAuth();
    loadKnowledge();
  }, [checkAuth, loadKnowledge]);

  // Handlers
  const handleAddMainQuestion = async () => {
    if (state.knowledge.length > 0) {
      Alert.alert("Error", "Only one main question is allowed");
      return;
    }

    if (!state.mainQuestion.trim()) {
      Alert.alert("Error", "Please enter a question");
      return;
    }

    try {
      const newQuestionId = Math.random().toString(36).substr(2, 20);
      const subquestions = Array.from({ length: 9 }, (_, index) => ({
        id: `sub_${newQuestionId}_${index}`,
        subquestionText: "",
        questionId: newQuestionId,
        answers: Array.from({ length: 9 }, (_, ansIndex) => ({
          id: `answer_${newQuestionId}_sub_${newQuestionId}_${index}_${ansIndex}`,
          answerText: "",
          questionId: newQuestionId,
          subquestionId: `sub_${newQuestionId}_${index}`,
          createdAt: new Date(),
          createdBy: 'system'
        })),
        subItems: Array.from({ length: 9 }, (_, subIndex) => ({
          id: `subitem_sub_${newQuestionId}_${index}_${subIndex}`,
          question: '',
          answer: '',
          createdAt: new Date(),
          createdBy: 'system'
        }))
      }));

      const newQuestion = {
        question: state.mainQuestion,
        questionId: newQuestionId,
        subquestions,
      };

      await DataService.addDocument("feelings-questions", newQuestion, newQuestionId);
      dispatch({ type: actionTypes.SET_MAIN_QUESTION, payload: "" });
      loadKnowledge();
    } catch (error) {
      console.error("Error adding question:", error);
      Alert.alert("Error", "Failed to save question");
    }
  };

  const handleUpdateSubQuestion = async () => {
    const { text, subquestionId, questionId } = state.updateQuestion;
    
    if (!text || !subquestionId || !questionId) {
      Alert.alert("Error", "Please select a sub-question to edit");
      return;
    }

    try {
      await DataService.updateFeelingsAndNeedsSubquestions(
        state.updateQuestion,
        "feelings-questions"
      );
      dispatch({ type: actionTypes.SET_UPDATE_QUESTION, payload: initialState.updateQuestion });
      loadKnowledge();
    } catch (error) {
      console.error("Error updating sub-question:", error);
      Alert.alert("Error", "Failed to update sub-question");
    }
  };

  const handleShowSubItems = async (subquestion) => {
    dispatch({ type: actionTypes.SET_SELECTED_SUBQUESTION, payload: subquestion.id });
    
    if (state.isAdmin) {
      try {
        const items = await DataService.getSubItems(
          subquestion.questionId,
          subquestion.id,
          'feelings-questions'
        );
        dispatch({ type: actionTypes.SET_SUB_ITEMS, payload: items });
      } catch (error) {
        console.error('Error loading sub-items:', error);
      }
    }
    
    // Load answer options
    try {
      const options = await DataService.getAnswerOptions(subquestion.id, 'feelings-questions');
      dispatch({ type: actionTypes.SET_ANSWER_OPTIONS, payload: options || [] });
    } catch (error) {
      console.error('Error loading answer options:', error);
    }
  };

  const handleSubItemSelect = (item) => {
    dispatch({ type: actionTypes.SET_SELECTED_SUB_ITEM, payload: item });
    dispatch({ type: actionTypes.SET_EDIT_MODAL, payload: true });
  };

  const handleSubItemSave = async ({ question, answer }) => {
    if (!state.selectedSubItem) return;

    try {
      const success = await DataService.updateSubItem({
        questionId: state.knowledge[0]?.questionId,
        subquestionId: state.selectedSubquestionId,
        subItemId: state.selectedSubItem.id,
        question,
        answer
      }, 'feelings-questions');

      if (success) {
        Alert.alert('Success', 'Sub-item updated successfully');
        // Refresh sub-items
        const items = await DataService.getSubItems(
          state.knowledge[0]?.questionId,
          state.selectedSubquestionId,
          'feelings-questions'
        );
        dispatch({ type: actionTypes.SET_SUB_ITEMS, payload: items });
      }
    } catch (error) {
      console.error('Error updating sub-item:', error);
      Alert.alert('Error', 'Failed to update sub-item');
    }
  };

  const handleAddAnswerOption = async () => {
    if (!state.newAnswerOption.trim() || !state.selectedSubquestionId) {
      Alert.alert('Error', 'Please enter an answer option');
      return;
    }

    try {
      const newOption = {
        text: state.newAnswerOption.trim(),
        subquestionId: state.selectedSubquestionId,
        createdAt: new Date(),
        createdBy: auth.currentUser.uid
      };

      await DataService.addAnswerOption(newOption, 'feelings-questions');
      dispatch({ type: actionTypes.SET_NEW_ANSWER_OPTION, payload: '' });
      
      // Refresh options
      const options = await DataService.getAnswerOptions(state.selectedSubquestionId, 'feelings-questions');
      dispatch({ type: actionTypes.SET_ANSWER_OPTIONS, payload: options || [] });
      
      Alert.alert('Success', 'Answer option added successfully');
    } catch (error) {
      console.error('Error adding answer option:', error);
      Alert.alert('Error', 'Failed to add answer option');
    }
  };

  const handleSelectAnswerOption = async (option) => {
    if (!state.isAdmin) {
      dispatch({ type: actionTypes.SET_SELECTED_ANSWER_OPTION, payload: option.id });
      
      const userAnswer = {
        questionId: state.knowledge[0]?.questionId,
        subquestionId: state.selectedSubquestionId,
        optionId: option.id,
        userId: auth.currentUser.uid,
        answer: option.text,
        createdAt: new Date(),
      };

      try {
        await DataService.checkExistingRecordAndUpdate(
          "user-feelings-answers",
          userAnswer
        );
        Alert.alert("Success", "Your answer has been saved");
        dispatch({ type: actionTypes.RESET_SELECTION });
      } catch (error) {
        console.error("Error saving answer:", error);
        Alert.alert("Error", "Failed to save your answer");
      }
    }
  };

  const handleDeleteAnswerOption = async (optionId) => {
    try {
      await DataService.deleteAnswerOption(optionId, state.selectedSubquestionId, 'feelings-questions');
      
      // Refresh options
      const options = await DataService.getAnswerOptions(state.selectedSubquestionId, 'feelings-questions');
      dispatch({ type: actionTypes.SET_ANSWER_OPTIONS, payload: options || [] });
      
      Alert.alert('Success', 'Answer option deleted successfully');
    } catch (error) {
      console.error('Error deleting answer option:', error);
      Alert.alert('Error', 'Failed to delete answer option');
    }
  };

  // Render functions
  const renderSubQuestion = ({ item }) => {
    const isSelected = state.updateQuestion.subquestionId === item.id;
    const hasAnswers = item.answers && item.answers.some((a) => a.answerText.trim() !== "");

    return (
      <QuestionCard
        item={item}
        isAdmin={state.isAdmin}
        isSelected={isSelected}
        hasContent={hasAnswers}
        onPress={() => handleShowSubItems(item)}
        onEditPress={() => {
          if (state.isAdmin) {
            dispatch({
              type: actionTypes.SET_UPDATE_QUESTION,
              payload: {
                subquestionId: item.id,
                questionId: item.questionId,
                text: item.subquestionText,
              }
            });
          }
        }}
        onSubItemsPress={() => handleShowSubItems(item)}
      />
    );
  };

  const renderMainQuestion = ({ item, index }) => {
    const subquestions = item.subquestions?.filter(sq => {
      if (state.isAdmin) return true;
      return sq.subquestionText && sq.subquestionText.trim() !== "";
    }) || [];

    return (
      <>
        <TouchableOpacity onPress={() => dispatch({ type: actionTypes.TOGGLE_EXPAND, payload: index })}>
          <View style={styles.listItem}>
            <View style={styles.itemContent}>
              <View style={styles.itemNumber}>
                <Text style={styles.itemNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.itemText}>{item.question}</Text>
              <Ionicons
                name={state.expandedIndex === index ? "chevron-up" : "chevron-down"}
                size={24}
                color="#FFF"
              />
            </View>
          </View>
        </TouchableOpacity>

        {state.expandedIndex === index && (
          <>
            {state.isAdmin && (
              <View style={styles.subQuestionInputContainer}>
                <TextInput
                  style={styles.expandedInput}
                  placeholder="Update sub-question here..."
                  placeholderTextColor="#FFFFFF80"
                  value={state.updateQuestion.text}
                  onChangeText={(text) =>
                    dispatch({
                      type: actionTypes.SET_UPDATE_QUESTION,
                      payload: { ...state.updateQuestion, text }
                    })
                  }
                />
                <TouchableOpacity onPress={handleUpdateSubQuestion} style={styles.sendButton}>
                  <Ionicons name="paper-plane-outline" size={24} color="#274472" />
                </TouchableOpacity>
              </View>
            )}

            {state.selectedSubquestionId ? (
              <View style={styles.subItemsContainer}>
                <View style={styles.subItemHeader}>
                  <Text style={styles.subItemHeaderText}>
                    {state.isAdmin ? "Sub-Items & Answer Options" : "Answer Options"}
                  </Text>
                  <TouchableOpacity onPress={() => dispatch({ type: actionTypes.RESET_SELECTION })}>
                    <Ionicons name="close" size={24} color="#FFF" />
                  </TouchableOpacity>
                </View>

                {state.isAdmin && (
                  <>
                    <SubItemsGrid
                      subItems={state.subItems}
                      selectedId={state.selectedSubItem?.id}
                      onSelectItem={handleSubItemSelect}
                    />
                    <View style={styles.divider} />
                  </>
                )}

                <AnswerOptionsList
                  answerOptions={state.answerOptions}
                  selectedOption={state.selectedAnswerOption}
                  isAdmin={state.isAdmin}
                  newOptionText={state.newAnswerOption}
                  onOptionTextChange={(text) => 
                    dispatch({ type: actionTypes.SET_NEW_ANSWER_OPTION, payload: text })
                  }
                  onAddOption={handleAddAnswerOption}
                  onSelectOption={handleSelectAnswerOption}
                  onDeleteOption={handleDeleteAnswerOption}
                />
              </View>
            ) : (
              <FlatList
                data={subquestions}
                keyExtractor={(item) => item.id}
                renderItem={renderSubQuestion}
                numColumns={3}
                contentContainerStyle={styles.grid}
                columnWrapperStyle={styles.columnWrapper}
                keyboardShouldPersistTaps="handled"
              />
            )}
          </>
        )}
      </>
    );
  };

  if (state.loading) {
    return (
      <LinearGradient colors={["#5885AF", "#5885AF"]} style={styles.background}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="white" />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#5885AF", "#5885AF"]} style={styles.background}>
      <Header onBack={() => navigation.goBack()} title="Feelings" />
      
      <View style={styles.container}>
        <FlatList
          data={state.knowledge}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderMainQuestion}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.mainList}
        />

        {state.isAdmin && state.knowledge.length === 0 && (
          <View style={styles.bottomContainer}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter main question..."
                placeholderTextColor="#FFFFFF"
                value={state.mainQuestion}
                onChangeText={(text) => 
                  dispatch({ type: actionTypes.SET_MAIN_QUESTION, payload: text })
                }
              />
              <TouchableOpacity onPress={handleAddMainQuestion} style={styles.sendButton}>
                <Ionicons name="paper-plane-outline" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <SubItemEditModal
        visible={state.editModalVisible}
        subItem={state.selectedSubItem}
        onSave={handleSubItemSave}
        onClose={() => {
          dispatch({ type: actionTypes.SET_EDIT_MODAL, payload: false });
          dispatch({ type: actionTypes.SET_SELECTED_SUB_ITEM, payload: null });
        }}
      />
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

export default FeelingsRevamped;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    paddingHorizontal: 20,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  mainList: {
    paddingBottom: 100,
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
  grid: {
    padding: 16,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  subQuestionInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#41729F",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  expandedInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
  },
  sendButton: {
    marginLeft: 10,
    justifyContent: "center",
  },
  subItemsContainer: {
    backgroundColor: "#41729F",
    borderRadius: 10,
    margin: 16,
    overflow: 'hidden',
  },
  subItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#FFFFFF30',
  },
  subItemHeaderText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#FFFFFF30',
    marginVertical: 16,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
  },
  inputContainer: {
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
});