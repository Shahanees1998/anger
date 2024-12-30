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
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage

const Thoughts = ({ navigation }) => {
  const [text, setText] = useState("");
  const [thoughts, setThoughts] = useState([]); // Will store {text: string, subThoughts: string[]}
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [subThoughtText, setSubThoughtText] = useState("");

  useEffect(() => {
    const loadThoughts = async () => {
      try {
        const storedThoughts = await AsyncStorage.getItem("thoughts");
        if (storedThoughts) {
          setThoughts(JSON.parse(storedThoughts));
        }
      } catch (error) {
        console.error("Failed to load thoughts from AsyncStorage", error);
      }
    };
    loadThoughts();
  }, []);

  const addThought = () => {
    if (text.trim()) {
      const newThoughts = [...thoughts, { text: text.trim(), subThoughts: [] }];
      setThoughts(newThoughts);
      setText("");
      saveThoughts(newThoughts);
    }
  };

  const saveThoughts = async (thoughtsToSave) => {
    try {
      await AsyncStorage.setItem("thoughts", JSON.stringify(thoughtsToSave));
    } catch (error) {
      console.error("Failed to save thoughts to AsyncStorage", error);
    }
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
              <View style={styles.listItem}>
                <View style={styles.itemContent}>
                  <View style={styles.itemNumber}>
                    <Text style={styles.itemNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.itemText}>{item.text}</Text>
                  <TouchableOpacity onPress={() => toggleExpand(index)}>
                    <Ionicons
                      name={expandedIndex === index ? "chevron-forward" : "chevron-down"}
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
                  thoughts={thoughts}
                  setThoughts={setThoughts}
                  saveThoughts={saveThoughts}
                />
              )}
            </>
          )}
        />

        {/* Input Field */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter your text..."
            placeholderTextColor="#FFFFFF"
            value={text}
            onChangeText={setText}
          />
          <TouchableOpacity onPress={addThought} style={styles.sendButton}>
            <Ionicons name="paper-plane-outline" size={24} color="#fff" />
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

const ExpandedForm = ({ thought, index, thoughts, setThoughts, saveThoughts }) => {
  const [localSubThoughtText, setLocalSubThoughtText] = useState("");

  const handleAddSubThought = () => {
    if (localSubThoughtText.trim()) {
      const updatedThoughts = thoughts.map((t, i) => {
        if (i === index) {
          return {
            ...t,
            subThoughts: [...(t.subThoughts || []), localSubThoughtText.trim()]
          };
        }
        return t;
      });
      setThoughts(updatedThoughts);
      setLocalSubThoughtText("");
      saveThoughts(updatedThoughts);
    }
  };

  return (
    <View style={styles.expandedContainer}>
      {/* Show existing sub-thoughts */}
      {thought.subThoughts?.map((subThought, subIndex) => (
        <View key={subIndex} style={styles.subThoughtItem}>
          <Text style={styles.subThoughtText}>{subThought}</Text>
        </View>
      ))}
      
      {/* Input for new sub-thought */}
      <View style={styles.subThoughtInputContainer}>
        <TextInput
          style={styles.expandedInput}
          placeholder="Add a sub-thought..."
          placeholderTextColor="#FFFFFF80"
          value={localSubThoughtText}
          onChangeText={setLocalSubThoughtText}
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#41729F",
    borderRadius: 10,
    paddingVertical: 0,
    paddingHorizontal:10
  },
  expandedInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
  },
  subThoughtSendButton: {
    marginLeft: 10,
    justifyContent: 'center',
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
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#41729F",
    padding: 12,
    borderRadius: 10,
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
  },
  input: {
    flex: 1,
    color: "#FFF",
    fontSize: 16,
    paddingVertical: 0, // Adjusts alignment
  },
  sendButton: {
    marginLeft: 10,
    color: "#fff",
    justifyContent: "center", // Centers the icon vertically
  },
});
