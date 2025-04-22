import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Dimensions,
  ScrollView,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import {
  measureFirestoreOperation,
  checkFirestoreConnection,
} from "../utils/firebaseUtils";
import DataService from "../services/DataService";

const { width } = Dimensions.get("window");

const AdminDashboard = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    new24h: 0,
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedSection, setSelectedSection] = useState("");
  const [questions, setQuestions] = useState([{ question: "", answer: "" }]);
  const [isAddingQuestions, setIsAddingQuestions] = useState(false);

  // Sections where questions can be added
  const sections = [
    { id: "knowledge-questions", name: "Knowledge" },
    { id: "thoughts-questions", name: "Thoughts" },
    { id: "sos-questions", name: "SOS" },
    { id: "body-questions", name: "Body" },
    { id: "feelings-questions", name: "Feelings" },
    { id: "needs-questions", name: "Needs" },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const isConnected = await checkFirestoreConnection();
      if (!isConnected) {
        throw new Error("Unable to connect to database");
      }

      const usersList = await measureFirestoreOperation(async () => {
        const usersRef = collection(db, "users");
        const querySnapshot = await getDocs(usersRef);
        // console.log(querySnapshot.docs, "al users");
        const users = [];
        const now = new Date();
        const last24h = new Date(now - 24 * 60 * 60 * 1000);
        let activeCount = 0;
        let newCount = 0;

        querySnapshot.forEach((doc) => {
          const userData = doc.data();
          console.log(userData, "finalll", doc.id);

          if (!userData.isAdmin) {
            const createdAt = new Date(userData.createdAt);
            if (createdAt > last24h) {
              newCount++;
            }
            if (userData.lastActive) {
              const lastActive = new Date(userData.lastActive);
              if (lastActive > last24h) {
                activeCount++;
              }
            }
            users.push({
              id: doc.id,
              ...userData,
              createdAt: createdAt.toLocaleDateString(),
            });
          }
        });

        setStats({
          total: users.length,
          active: activeCount,
          new24h: newCount,
        });

        return users;
      }, "Fetch users operation");

      setUsers(usersList);
    } catch (error) {
      console.error("Error fetching users:", error);
      Alert.alert("Error", error.message || "Failed to fetch users");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigation.replace("SignIn");
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Error", "Failed to logout");
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const renderStatCard = ({ title, value, icon, color }) => (
    <View style={[styles.statCard, { backgroundColor: color }]}>
      <View style={styles.statIconContainer}>
        <MaterialIcons name={icon} size={24} color="white" />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  const renderUserCard = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={styles.userIcon}>
          <Text style={styles.userInitials}>
            {item.firstName?.[0] || ""}
            {item.lastName?.[0] || ""}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {item.firstName} {item.lastName}
          </Text>
          <Text style={styles.userEmail}>{item.email}</Text>
        </View>
      </View>
      <View style={styles.userDetails}>
        <View style={styles.detailRow}>
          <MaterialIcons name="date-range" size={16} color="#666" />
          <Text style={styles.detailText}>Joined: {item.createdAt}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons name="phone" size={16} color="#666" />
          <Text style={styles.detailText}>
            {item.profile?.phone || "No phone"}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons name="person" size={16} color="#666" />
          <Text style={styles.detailText}>
            {item.profile?.gender || "Gender not specified"}
          </Text>
        </View>
        {item.lastActive && (
          <View style={styles.detailRow}>
            <MaterialIcons name="access-time" size={16} color="#666" />
            <Text style={styles.detailText}>
              Last active: {new Date(item.lastActive).toLocaleString()}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderContent = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading users...</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={users}
        renderItem={renderUserCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="people-outline" size={50} color="#fff" />
            <Text style={styles.emptyText}>No users found</Text>
          </View>
        }
      />
    );
  };

  // Add a new question input field
  const addQuestionField = () => {
    setQuestions([...questions, { question: "", answer: "" }]);
  };

  // Remove a question input field
  const removeQuestionField = (index) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
  };

  // Handle question input change
  const handleQuestionChange = (text, index, field) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = text;
    setQuestions(updatedQuestions);
  };

  // Submit all questions
  const submitQuestions = async () => {
    if (!selectedSection) {
      Alert.alert("Error", "Please select a section");
      return;
    }

    // Validate all questions
    const invalidQuestions = questions.filter((q) => !q.question.trim());
    if (invalidQuestions.length > 0) {
      Alert.alert("Error", "Please fill in all question fields");
      return;
    }

    setIsAddingQuestions(true);
    try {
      // Structure and requirements differ by section
      if (
        selectedSection === "feelings-questions" ||
        selectedSection === "needs-questions"
      ) {
        await submitFeelingsOrNeedsQuestions();
      } else {
        // For other sections like knowledge, thoughts, sos, body
        await submitRegularQuestions();
      }

      Alert.alert("Success", "All questions added successfully");
      setIsModalVisible(false);
      setQuestions([{ question: "", answer: "" }]);
      setSelectedSection("");
    } catch (error) {
      console.error("Error adding questions:", error);
      Alert.alert("Error", "Failed to add questions");
    } finally {
      setIsAddingQuestions(false);
    }
  };

  // Submit questions for regular sections
  const submitRegularQuestions = async () => {
    for (const item of questions) {
      const questionData = {
        question: item.question,
        answers: [],
      };

      // Add answer if provided
      if (item.answer && item.answer.trim()) {
        questionData.answers.push({
          answerText: item.answer,
          createdBy: auth.currentUser.uid,
          createdAt: new Date(),
        });
      }

      await DataService.addDocument(selectedSection, questionData);
    }
  };

  // Submit questions for feelings or needs
  const submitFeelingsOrNeedsQuestions = async () => {
    for (const item of questions) {
      const newQuestionId = Math.random().toString(36).substr(2, 20);

      // Create subquestions structure required for feelings/needs
      const subquestions = [];
      for (let i = 1; i <= 9; i++) {
        const subquestionId = `subquestion_${Math.random()
          .toString(36)
          .substr(2, 9)}`;

        // Generate dummy answers as required by the feelings/needs structure
        const answers = [];
        for (let j = 1; j <= 9; j++) {
          answers.push({
            id: `answer_${Math.random().toString(36).substr(2, 9)}`,
            answerText: `${item.question} answer ${j}`,
          });
        }

        subquestions.push({
          subquestionText: `${item.question} subquestion ${i}`,
          id: subquestionId,
          questionId: newQuestionId,
          answers,
        });
      }

      const questionData = {
        question: item.question,
        questionId: newQuestionId,
        subquestions,
      };

      await DataService.addDocument(
        selectedSection,
        questionData,
        newQuestionId
      );
    }
  };

  return (
    <LinearGradient
      colors={["#5885AF", "#5885AF"]}
      style={styles.background}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Admin Dashboard</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setIsModalVisible(true)}
            >
              <MaterialIcons name="add-circle" size={24} color="#fff" />
              <Text style={styles.addButtonText}>Add Questions</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsContainer}>
          {renderStatCard({
            title: "Total Users",
            value: stats.total,
            icon: "people",
            color: "#4CAF50",
          })}
          {renderStatCard({
            title: "Active Users",
            value: stats.active,
            icon: "person",
            color: "#2196F3",
          })}
          {renderStatCard({
            title: "New Users",
            value: stats.new24h,
            icon: "person-add",
            color: "#FF9800",
          })}
        </View>

        {renderContent()}

        {/* Modal for adding multiple questions */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={() => setIsModalVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.modalContainer}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Multiple Questions</Text>
                <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                  <MaterialIcons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScrollView}>
                {/* Section selector */}
                <Text style={styles.inputLabel}>Select Section:</Text>
                <View style={styles.sectionSelector}>
                  {sections.map((section) => (
                    <TouchableOpacity
                      key={section.id}
                      style={[
                        styles.sectionButton,
                        selectedSection === section.id &&
                          styles.selectedSectionButton,
                      ]}
                      onPress={() => setSelectedSection(section.id)}
                    >
                      <Text
                        style={[
                          styles.sectionButtonText,
                          selectedSection === section.id &&
                            styles.selectedSectionText,
                        ]}
                      >
                        {section.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Question inputs */}
                <Text style={styles.inputLabel}>Questions:</Text>
                {questions.map((questionItem, index) => (
                  <View key={index} style={styles.questionContainer}>
                    <View style={styles.questionHeader}>
                      <Text style={styles.questionNumber}>
                        Question {index + 1}
                      </Text>
                      {questions.length > 1 && (
                        <TouchableOpacity
                          onPress={() => removeQuestionField(index)}
                        >
                          <MaterialIcons
                            name="delete"
                            size={24}
                            color="#FF5252"
                          />
                        </TouchableOpacity>
                      )}
                    </View>

                    <TextInput
                      style={styles.input}
                      placeholder="Enter question"
                      value={questionItem.question}
                      onChangeText={(text) =>
                        handleQuestionChange(text, index, "question")
                      }
                    />

                    {selectedSection !== "feelings-questions" &&
                      selectedSection !== "needs-questions" && (
                        <TextInput
                          style={styles.input}
                          placeholder="Enter default answer (optional)"
                          value={questionItem.answer}
                          onChangeText={(text) =>
                            handleQuestionChange(text, index, "answer")
                          }
                        />
                      )}
                  </View>
                ))}

                {/* Add more questions button */}
                <TouchableOpacity
                  style={styles.addMoreButton}
                  onPress={addQuestionField}
                >
                  <MaterialIcons name="add-circle" size={20} color="#2196F3" />
                  <Text style={styles.addMoreButtonText}>
                    Add Another Question
                  </Text>
                </TouchableOpacity>

                {/* Submit button */}
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    isAddingQuestions && styles.disabledButton,
                  ]}
                  onPress={submitQuestions}
                  disabled={isAddingQuestions}
                >
                  {isAddingQuestions ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>
                      Submit Questions
                    </Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
  },
  background: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  logoutButton: {
    padding: 10,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
  },
  statCard: {
    width: (width - 60) / 3,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  statIconContainer: {
    marginBottom: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  statTitle: {
    fontSize: 12,
    color: "#fff",
    textAlign: "center",
  },
  listContainer: {
    padding: 15,
  },
  userCard: {
    backgroundColor: "yellow",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  userIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#5885AF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  userInitials: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  userDetails: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    marginTop: 10,
    paddingTop: 10,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 3,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
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
  loadingText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  addButtonText: {
    color: "#fff",
    marginLeft: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalScrollView: {
    maxHeight: "70%",
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  sectionSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  sectionButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#eee",
    marginRight: 10,
    marginBottom: 10,
  },
  selectedSectionButton: {
    backgroundColor: "#2196F3",
  },
  sectionButtonText: {
    color: "#333",
  },
  selectedSectionText: {
    color: "#fff",
  },
  questionContainer: {
    marginBottom: 20,
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  addMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  addMoreButtonText: {
    color: "#2196F3",
    marginLeft: 5,
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
});

export default AdminDashboard;
