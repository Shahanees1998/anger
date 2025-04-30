import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import InputField from "./InputField";

const CustomAlert = ({
  visible,
  onClose,
  icon,
  title,
  message,
  email,
  onContinue,
  value,
  helpQuestionAnswer,
  setHelpQuestionAnswer,
  initialHelpData,
}) => {
  const [dValue, setDValue] = useState(value);
  const [helpData, setHelpData] = useState(
    initialHelpData || {
      question: "",
      answer: "",
    }
  );

  useEffect(() => {
    if (initialHelpData) {
      setHelpData(initialHelpData);
    }
  }, [initialHelpData]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {icon && (
            <View style={styles.iconWrapper}>
              <Image source={icon} style={styles.image} />
            </View>
          )}

          {title && !helpQuestionAnswer && (
            <Text style={styles.title}>{title}</Text>
          )}
          {message && !helpQuestionAnswer && (
            <Text style={styles.message}>{message}</Text>
          )}
          {email && <Text style={styles.email}>{email}</Text>}

          {value && (
            <View style={styles.container}>
              <InputField
                placeholder={`Edit your ${title}`}
                value={dValue}
                onChangeText={setDValue}
              />
            </View>
          )}

          {helpQuestionAnswer && (
            <>
              <View style={styles.container}>
                <InputField
                  placeholder="Enter help question"
                  value={helpData.question}
                  onChangeText={(text) =>
                    setHelpData((prev) => ({ ...prev, question: text }))
                  }
                />
              </View>
              <View style={styles.container}>
                <InputField
                  placeholder="Enter help answer"
                  multiline={true}
                  numberOfLines={3}
                  value={helpData.answer}
                  onChangeText={(text) =>
                    setHelpData((prev) => ({ ...prev, answer: text }))
                  }
                />
              </View>
            </>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => onContinue(helpQuestionAnswer ? helpData : dValue)}
            >
              <Text style={styles.buttonText}>
                {helpQuestionAnswer
                  ? initialHelpData
                    ? "Update"
                    : "Save"
                  : "Continue"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  iconWrapper: {
    marginBottom: 10,
  },
  image: {
    height: 48,
    width: 48,
  },
  title: {
    fontSize: 16,
    fontWeight: "Normal",
    marginBottom: 10,
  },
  message: {
    fontSize: 12,
    color: "#555",
    textAlign: "center",
    marginBottom: 10,
  },
  email: {
    fontSize: 14,
    color: "#007BFF",
    marginBottom: 20,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#274472",
    padding: 10,
    borderRadius: 10,
    marginRight: 5,
    alignItems: "center",
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    marginLeft: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
  },
  secondaryButtonText: {
    color: "#000",
  },
  container: {
    width: "100%",
  },
});

export default CustomAlert;
