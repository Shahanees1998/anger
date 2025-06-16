import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const AnswerOptionsList = ({
  answerOptions,
  selectedOption,
  isAdmin,
  newOptionText,
  onOptionTextChange,
  onAddOption,
  onSelectOption,
  onDeleteOption,
}) => {
  const renderOption = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.optionCard,
        selectedOption === item.id && styles.selectedOption,
      ]}
      onPress={() => onSelectOption(item)}
    >
      <Text style={styles.optionText}>{item.text}</Text>
      
      {isAdmin && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDeleteOption(item.id)}
        >
          <Ionicons name="trash" size={16} color="#FF4444" />
        </TouchableOpacity>
      )}
      
      {!isAdmin && (
        <Ionicons
          name={selectedOption === item.id ? "radio-button-on" : "radio-button-off"}
          size={24}
          color="#FFF"
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {isAdmin && (
        <>
          <Text style={styles.sectionTitle}>Answer Options</Text>
          <View style={styles.addOptionContainer}>
            <TextInput
              style={styles.addOptionInput}
              placeholder="Add new answer option..."
              placeholderTextColor="#FFFFFF80"
              value={newOptionText}
              onChangeText={onOptionTextChange}
              returnKeyType="done"
              onSubmitEditing={onAddOption}
            />
            <TouchableOpacity
              style={styles.addButton}
              onPress={onAddOption}
            >
              <Ionicons name="add" size={24} color="#274472" />
            </TouchableOpacity>
          </View>
        </>
      )}

      <FlatList
        data={answerOptions}
        keyExtractor={(item) => item.id}
        renderItem={renderOption}
        contentContainerStyle={styles.optionsList}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginHorizontal: 16,
    marginVertical: 8,
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
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  optionCard: {
    backgroundColor: '#FFFFFF2A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedOption: {
    backgroundColor: '#274472',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  optionText: {
    color: '#FFF',
    fontSize: 14,
    flex: 1,
  },
  deleteButton: {
    padding: 4,
    marginLeft: 8,
  },
});