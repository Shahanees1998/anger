import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio, Video } from "expo-av";
import DataService from "@/services/DataService";
import { auth } from "@/firebase";
import FileUploader from "@/components/FileUploader";

const SOS = ({ navigation }) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswers] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showFilePicker, setShowFilePicker] = useState(false);

  const [sosQuesitons, setSosQuesitons] = useState([]);
  const [likedIndexes, setLikedIndexes] = useState(new Set());
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

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
    if (!question.trim()) {
      Alert.alert("Please fill in the question field");
      return;
    }

    const questionData = {
      question,
      answers: [
        {
          answerText: answer.trim(),
          mediaFile: selectedFile,
          createdBy: auth.currentUser.uid,
          createdAt: new Date().toISOString(),
        },
      ],
    };

    try {
      await DataService.addDocument(`sos-questions`, questionData);
      setQuestion("");
      setAnswers("");
      setSelectedFile(null);
      fetchSos();
    } catch (error) {
      console.error("Error adding question:", error);
      Alert.alert("Error", "Failed to save question");
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
                  {!isAdmin && (
                    <TouchableOpacity
                      onPress={() => toggleLike(index)}
                      style={{ marginRight: 10 }}
                    >
                      <Ionicons
                        name={
                          likedIndexes.has(index) ? "heart" : "heart-outline"
                        }
                        size={24}
                        color="#FFF"
                      />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => toggleExpand(index)}>
                    <Ionicons
                      name={
                        expandedIndex === index ? "chevron-up" : "chevron-down"
                      }
                      size={24}
                      color="#FFF"
                    />
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
          ListFooterComponent={
            !isAdmin ? (
              <TouchableOpacity
                style={styles.icebergItem}
                onPress={() => navigation.navigate("Iceberg")}
              >
                <View style={styles.itemContent}>
                  <View style={styles.itemNumber}>
                    <Text style={styles.itemNumberText}>
                      {sosQuesitons.length + 1}
                    </Text>
                  </View>
                  <Text style={styles.itemText}>My Iceberg</Text>
                  <View style={{ width: 24, marginRight: 10 }} />
                  <Ionicons name="chevron-forward" size={24} color="#FFF" />
                </View>
              </TouchableOpacity>
            ) : null
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
            <View style={styles.mediaContainer}>
              <View style={[styles.inputContainer, { flex: 1 }]}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your answer..."
                  placeholderTextColor="#FFFFFF"
                  value={answer}
                  onChangeText={setAnswers}
                  autoCapitalize="none"
                  selectionColor="#FFFFFF"
                  multiline
                />
              </View>
              <Ionicons
                onPress={() => {
                  setShowFilePicker(!showFilePicker);
                }}
                name="attach-outline"
                size={24}
                color="#fff"
              />
              <TouchableOpacity onPress={addAnswer} style={styles.sendButton}>
                <Ionicons name="paper-plane-outline" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            {showFilePicker && (
              <FileUploader onFileSelected={setSelectedFile} fileType="all" />
            )}
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

const MediaDisplay = ({ mediaFile }) => {
  const [sound, setSound] = useState();
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    return sound ? () => sound.unloadAsync() : undefined;
  }, [sound]);

  if (!mediaFile) return null;

  const { type, uri, name } = mediaFile;

  if (type.startsWith("image/")) {
    return (
      <View style={styles.mediaContainer}>
        <Image
          source={{ uri }}
          style={styles.mediaPreview}
          resizeMode="contain"
        />
        <Text style={styles.mediaLabel}>Image</Text>
      </View>
    );
  }

  if (type.startsWith("video/")) {
    return (
      <View style={styles.mediaContainer}>
        <Video
          ref={videoRef}
          source={{ uri }}
          style={styles.mediaPreview}
          useNativeControls
          resizeMode="contain"
        />
        <Text style={styles.mediaLabel}>Video</Text>
      </View>
    );
  }

  if (type.startsWith("audio/")) {
    const playSound = async () => {
      if (sound && isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        if (sound) {
          await sound.unloadAsync();
        }
        const { sound: newSound } = await Audio.Sound.createAsync({ uri });
        setSound(newSound);
        setIsPlaying(true);
        await newSound.playAsync();

        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            setIsPlaying(false);
          }
        });
      }
    };

    return (
      <View style={styles.mediaContainer}>
        <TouchableOpacity onPress={playSound} style={styles.audioButton}>
          <Ionicons
            name={isPlaying ? "pause-circle" : "play-circle"}
            size={40}
            color="#FFFFFF"
          />
          <Text style={styles.audioText}>
            {isPlaying ? "Pause Audio" : "Play Audio"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.mediaContainer}>
      <TouchableOpacity style={styles.documentButton}>
        <Ionicons name="document" size={40} color="#FFFFFF" />
        <Text style={styles.documentText}>{name || "Document"}</Text>
      </TouchableOpacity>
    </View>
  );
};

const ExpandedForm = ({
  thought,
  index,
  thoughts,
  setThoughts,
  fetchThoughts,
}) => {
  const [subAnswerText, setSubAnswertText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [filteredAnswers, setFilteredAnswers] = useState([]);
  const [adminAnswers, setAdminAnswers] = useState([]);

  useEffect(() => {
    if (thought?.answers) {
      const userId = auth.currentUser.uid;
      
      // Use the centralized filtering method
      DataService.filterAnswersForUser(thought.answers, userId).then((filtered) => {
        // Separate admin and user answers
        const adminAnswersTemp = filtered.filter(answer => answer.isAdminAnswer);
        const userAnswers = filtered.filter(answer => !answer.isAdminAnswer);
        
        setFilteredAnswers(userAnswers);
        setAdminAnswers(adminAnswersTemp);
      });
    }
  }, [thought]);

  const handleAddSubThought = async () => {
    if (subAnswerText.trim() || selectedFile) {
      const data = {
        answers: [
          ...(thought.answers || []),
          {
            answerText: subAnswerText.trim(),
            mediaFile: selectedFile,
            createdBy: auth.currentUser.uid,
            createdAt: new Date().toISOString(),
          },
        ],
      };

      await DataService.updateDocument(`sos-questions`, data, thought.id);
      setSubAnswertText("");
      setSelectedFile(null);
      fetchThoughts();
    }
  };

  const renderAnswer = (answer, subIndex, isAdmin = false) => (
    <View
      key={`${isAdmin ? "admin" : "user"}-${subIndex}`}
      style={[styles.subThoughtItem, isAdmin && styles.adminAnswerItem]}
    >
      {isAdmin && (
        <View style={styles.adminBadge}>
          <Text style={styles.adminBadgeText}>Admin Response</Text>
        </View>
      )}
      {answer.answerText && (
        <Text style={styles.subThoughtText}>{answer.answerText}</Text>
      )}
      {answer.mediaFile && <MediaDisplay mediaFile={answer.mediaFile} />}
    </View>
  );

  return (
    <View style={styles.expandedContainer}>
      {/* Show admin answers first */}
      {adminAnswers.map((answer, subIndex) =>
        renderAnswer(answer, subIndex, true)
      )}

      {/* Show user's own answers */}
      {filteredAnswers.map((answer, subIndex) =>
        renderAnswer(answer, subIndex, false)
      )}

      {/* Input section for logged-in users */}
      {auth.currentUser?.uid && (
        <>
          <View style={styles.subThoughtInputContainer}>
            <TextInput
              style={styles.expandedInput}
              placeholder="Add your response..."
              placeholderTextColor="#FFFFFF80"
              value={subAnswerText}
              onChangeText={setSubAnswertText}
              autoCapitalize="none"
              selectionColor="#FFFFFF"
              multiline
            />
            <Ionicons
              onPress={() => {
                setShowFilePicker(!showFilePicker);
              }}
              name="attach-outline"
              size={24}
              color="#274472"
            />
            <TouchableOpacity
              onPress={handleAddSubThought}
              style={styles.subThoughtSendButton}
            >
              <Ionicons name="paper-plane-outline" size={26} color="#274472" />
            </TouchableOpacity>
          </View>
          {showFilePicker && (
            <FileUploader onFileSelected={setSelectedFile} fileType="all" />
          )}
        </>
      )}
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
  adminAnswerItem: {
    backgroundColor: "#274472",
    borderWidth: 1,
    borderColor: "#5885AF",
  },
  adminBadge: {
    backgroundColor: "#5885AF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 5,
  },
  adminBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
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
  icebergItem: {
    backgroundColor: "#274472",
    borderRadius: 50,
    padding: 12,
    marginBottom: 10,
  },
  mediaContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  mediaPreview: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginTop: 10,
  },
  audioButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  audioText: {
    color: "#FFFFFF",
    marginLeft: 10,
  },
  documentButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  documentText: {
    color: "#FFFFFF",
    marginLeft: 10,
  },
  mediaLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
});
