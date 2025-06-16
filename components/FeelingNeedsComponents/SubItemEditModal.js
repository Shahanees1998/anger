import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const SubItemEditModal = ({ 
  visible, 
  subItem, 
  onSave, 
  onClose,
  labelOnly = false
}) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [label, setLabel] = useState('');
  const questionInputRef = useRef(null);
  const answerInputRef = useRef(null);
  const labelInputRef = useRef(null);

  useEffect(() => {
    if (subItem) {
      if (labelOnly) {
        setLabel(subItem.label || '');
      } else {
        setQuestion(subItem.question || '');
        setAnswer(subItem.answer || '');
      }
    }
  }, [subItem, labelOnly]);

  useEffect(() => {
    if (visible) {
      // Focus on appropriate input when modal opens
      setTimeout(() => {
        if (labelOnly && labelInputRef.current) {
          labelInputRef.current?.focus();
        } else if (questionInputRef.current) {
          questionInputRef.current?.focus();
        }
      }, 100);
    }
  }, [visible, labelOnly]);

  const handleSave = () => {
    if (labelOnly) {
      if (!label.trim()) {
        alert('Please enter a label');
        return;
      }
      onSave({ label });
    } else {
      if (!question.trim() && !answer.trim()) {
        alert('Please enter at least a question or answer');
        return;
      }
      onSave({ question, answer });
    }
    handleClose();
  };

  const handleClose = () => {
    setQuestion('');
    setAnswer('');
    setLabel('');
    Keyboard.dismiss();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{labelOnly ? 'Edit Sub-box Label' : 'Edit Sub-Item'}</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.inputContainer}>
            {labelOnly ? (
              <>
                <Text style={styles.label}>Label</Text>
                <TextInput
                  ref={labelInputRef}
                  style={styles.input}
                  placeholder="Enter label..."
                  placeholderTextColor="#FFFFFF60"
                  value={label}
                  onChangeText={setLabel}
                  multiline
                  numberOfLines={2}
                  textAlignVertical="top"
                  returnKeyType="done"
                />
              </>
            ) : (
              <>
                <Text style={styles.label}>Question</Text>
                <TextInput
                  ref={questionInputRef}
                  style={styles.input}
                  placeholder="Enter question..."
                  placeholderTextColor="#FFFFFF60"
                  value={question}
                  onChangeText={setQuestion}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  returnKeyType="next"
                  onSubmitEditing={() => answerInputRef.current?.focus()}
                />

                <Text style={styles.label}>Answer</Text>
                <TextInput
                  ref={answerInputRef}
                  style={styles.input}
                  placeholder="Enter answer..."
                  placeholderTextColor="#FFFFFF60"
                  value={answer}
                  onChangeText={setAnswer}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  returnKeyType="done"
                />
              </>
            )}
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={handleClose}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.saveButton]} 
              onPress={handleSave}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#41729F',
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  inputContainer: {
    maxHeight: 300,
  },
  label: {
    fontSize: 16,
    color: '#FFF',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#FFFFFF20',
    borderRadius: 10,
    padding: 12,
    color: '#FFF',
    fontSize: 16,
    minHeight: 80,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    minWidth: 100,
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  saveButton: {
    backgroundColor: '#274472',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});