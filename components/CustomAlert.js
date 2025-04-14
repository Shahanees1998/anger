import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import InputField from './InputField';

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
}) => {
  const [dValue, setDValue] = useState(value);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Icon */}
          {icon && (
            <View style={styles.iconWrapper}>
              <Image source={icon} style={styles.image} />
            </View>
          )}

          {title && <Text style={styles.title}>{title}</Text>}

          {message && <Text style={styles.message}>{message}</Text>}

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
                  placeholder={`Add help Question`}
                  value={helpQuestionAnswer.question}
                  onChangeText={(t) => {
                    setHelpQuestionAnswer((prev) => ({
                      ...prev,
                      question: t,
                    }));
                  }}
                />
              </View>
              <View style={styles.container}>
                <InputField
                  placeholder={`Add help Answer`}
                  value={helpQuestionAnswer.answer}
                  onChangeText={(t) =>
                    setHelpQuestionAnswer({
                      ...helpQuestionAnswer,
                      answer: t,
                    })
                  }
                />
              </View>
            </>
          )}

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() =>
                onContinue(helpQuestionAnswer ? helpQuestionAnswer : dValue)
              }
            >
              <Text style={styles.buttonText}>Continue</Text>
            </TouchableOpacity>
            {/* <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onClose}
            >
              <Text style={styles.secondarybuttonText}>Cancel</Text>
            </TouchableOpacity> */}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
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
    fontWeight: 'Normal',
    marginBottom: 10,
  },
  message: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
    marginBottom: 10,
  },
  email: {
    fontSize: 14,
    color: '#007BFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#274472',
    padding: 10,
    borderRadius: 10,
    marginRight: 5,
    alignItems: 'center',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    marginLeft: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
  },
  secondarybuttonText: {
    color: '#000',
  },
  container: {
    width: '100%',
  },
});

export default CustomAlert;
