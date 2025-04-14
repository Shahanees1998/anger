// Import necessary libraries
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../firebase';
import DataService from '@/services/DataService';

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
  const [question, setQuestion] = useState('');
  const [answers, setAnswers] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [subAnswers, setSubAnswers] = useState([]);

  const [updateQuestion, setUpdateQuestion] = useState({
    text: '',
    questionId: '',
    subquestionId: '',
  });

  const [selectedRadioButtonId, setSelectedRadioButtonId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);

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
      console.error('Failed to load knowledge from AsyncStorage:', error);
    }
  };
  const checkAuth = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        navigation.replace('SignIn');
      }

      const userId = user?.uid;
      if (userId) {
        const userData = await DataService.getUserData(userId).catch(
          console.error
        );
        setIsAdmin(userData?.isAdmin);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      navigation.replace('SignIn');
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
    setUpdateQuestion({ text: '', subquestionId: '', questionId: '' });
  };

  const feelingsData = Array.from({ length: 9 }, (_, index) => ({
    id: index,
    text: `Feeling ${index + 1}`,
  }));

  const generateDummyAnswers = (questionId, subquestionId) => {
    const dummyAnswers = [];
    for (let i = 1; i <= 9; i++) {
      dummyAnswers.push({
        questionId,
        subquestionId,
        answerText: `needs answer ${i}`,
        id: `answer_${Math.random().toString(36).substr(2, 20)}`, // Generate unique ID for each answer
        createdBy: auth.currentUser.uid, // Assuming user is logged in
      });
    }
    return dummyAnswers;
  };

  const getAnswers = (item) => {
    setSubAnswers(item.answers);
    setSelectedCardId(item.id);
  };

  const subQuestions = (questionId) => {
    const subquestions = [];
    for (let i = 1; i <= 9; i++) {
      const subquestionId = `subquestion_${Math.random()
        .toString(36)
        .substr(2, 20)}`;
      subquestions.push({
        subquestionText: ` ${i}: needs text`,
        id: subquestionId,
        questionId,
        answers: generateDummyAnswers(questionId, subquestionId), // Generate 9 dummy answers
      });
    }
    return subquestions;
  };

  const addQuestion = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user');

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
        console.error('Error adding thought:', error);
        Alert.alert('Error', 'Failed to save thought');
      }

      setQuestion('');
    }
  };

  const handleUpdateSubQuestions = async () => {
    if (
      !updateQuestion.subquestionId &&
      !updateQuestion.questionId &&
      !updateQuestion.text
    ) {
      Alert.alert('Error', 'Please click on below item');
      return;
    }
    await DataService.updateFeelingsAndNeedsSubquestions(
      updateQuestion,
      'needs-questions'
    );
    setUpdateQuestion({ text: '', subquestionId: '', questionId: '' });

    loadKnowledge();
  };

  const renderNeedsCard = ({ item }) => {
    return (
      <View
        style={[styles.card, selectedCardId === item.id && styles.selectedCard]}
      >
        {!isAdmin && (
          <TouchableOpacity
            style={styles.circle}
            onPress={() => getAnswers(item)}
          >
            <Ionicons name="arrow-forward" size={24} color="#274472" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => {
            isAdmin &&
              setUpdateQuestion({
                subquestionId: item.id,
                questionId: item.questionId,
                text: item.subquestionText,
              });
          }}
        >
          <Text style={styles.cardText}>{item.subquestionText}</Text>
        </TouchableOpacity>
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
        'user-needs-answers',
        userAnswer
      );
      Alert.alert('Your answer has been submitted');
      setSelectedCardId(null);
    } catch (error) {
      console.log(error, 'error');
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
              ? 'radio-button-on'
              : 'radio-button-off'
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }
  return (
    <LinearGradient colors={['#5885AF', '#5885AF']} style={styles.background}>
      <Header onBack={() => navigation.goBack()} title="Need" />

      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="white" />
        ) : (
          <FlatList
            data={knowledge}
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
                              ? 'chevron-up'
                              : 'chevron-down'
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
                      />
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
  card: {
    flex: 1,
    margin: 8,
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: '#FFFFFF1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCard: {
    backgroundColor: '#274472',
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardText: {
    marginTop: 8,
    color: '#FFF',
    fontSize: 14,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 40,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listItem: {
    backgroundColor: '#274472',
    borderRadius: 50,
    padding: 8,
    marginBottom: 5,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  itemNumberText: {
    color: '#FFF',
    fontSize: 14,
  },
  itemText: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#41729F',
    padding: 12,
    borderRadius: 10,
    width: '90%',
  },
  input: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    paddingVertical: 0,
  },
  questionIcon: {
    backgroundColor: '#274472',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButton: {
    marginLeft: 10,
    justifyContent: 'center',
  },
  subThoughtInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#41729F',
    borderRadius: 10,
    paddingVertical: 0,
    paddingHorizontal: 10,
  },
  expandedInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
  },
  subThoughtSendButton: {
    marginLeft: 10,
    justifyContent: 'center',
  },
});
