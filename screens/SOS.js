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
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SOS = ({ navigation }) => {
  const [text, setText] = useState("");
  const [answers, setAnswers] = useState([]);
  const [likedIndexes, setLikedIndexes] = useState(new Set());

  useEffect(() => {
    const fetchAnswers = async () => {
      try {
        const storedAnswers = await AsyncStorage.getItem("answers");
        if (storedAnswers) {
          setAnswers(JSON.parse(storedAnswers));
        }
      } catch (error) {
        console.error("Error fetching answers:", error);
      }
    };

    fetchAnswers();
  }, []);


  useEffect(() => {
    const saveAnswers = async () => {
      try {
        await AsyncStorage.setItem("answers", JSON.stringify(answers));
      } catch (error) {
        console.error("Error saving answers:", error);
      }
    };

    if (answers.length) {
      saveAnswers();
    }
  }, [answers]);

  const addAnswer = () => {
    if (text.trim()) {
      const newAnswers = [...answers, text.trim()];
      setAnswers(newAnswers);
      setText(""); 
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

  return (
    <LinearGradient colors={["#5885AF", "#5885AF"]} style={styles.background}>
      <Header onBack={() => navigation.goBack()} title="SOS" />
      <View style={styles.container}>
        <FlatList
          data={answers}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.listItem}>
              <View style={styles.itemContent}>
                <View style={styles.itemNumber}>
                  <Text style={styles.itemNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.itemText}>{item}</Text>
                <TouchableOpacity onPress={() => toggleLike(index)} style={{marginRight:10}}>
                  <Ionicons
                    name={
                      likedIndexes.has(index) ? "heart" : "heart-outline"
                    }
                    size={24}
                    color="#FFF"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigation.navigate("Ready", { item })}
                >
                  <Ionicons name="chevron-down" size={24} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />

        <View style={styles.bottomContainer}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter your text..."
              placeholderTextColor="#FFFFFF80"
              value={text}
              onChangeText={setText}
            />
            <TouchableOpacity onPress={addAnswer} style={styles.sendButton}>
              <Ionicons name="paper-plane" size={24} color="#41729F" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.questionIcon}>
            <Ionicons name="help" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
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
});
