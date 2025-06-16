import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const QuestionCard = ({ 
  item, 
  isAdmin, 
  isSelected, 
  hasContent,
  onPress,
  onEditPress,
  onSubItemsPress 
}) => {
  return (
    <View style={[
      styles.card,
      isSelected && styles.selectedCard,
      !hasContent && !isAdmin && styles.disabledCard,
    ]}>
      {!isAdmin && (
        <TouchableOpacity
          style={[styles.circle, !hasContent && styles.disabledCircle]}
          onPress={onPress}
          disabled={!hasContent}
        >
          <Ionicons
            name="arrow-forward"
            size={24}
            color="#274472"
          />
        </TouchableOpacity>
      )}
      
      <TouchableOpacity
        onPress={onEditPress}
        style={styles.textContainer}
        disabled={!isAdmin}
      >
        <Text style={[styles.cardText, isSelected && styles.selectedText]}>
          {item.subquestionText || (isAdmin ? "Empty - Click to edit" : "Not available")}
        </Text>
      </TouchableOpacity>
      
      {isAdmin && (
        <TouchableOpacity
          style={styles.subItemsButton}
          onPress={onSubItemsPress}
        >
          <Ionicons name="grid-outline" size={16} color="#FFF" />
          <Text style={styles.subItemsButtonText}>9 Items</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 4,
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: "#FFFFFF1A",
    justifyContent: "center",
    alignItems: "center",
    position: 'relative',
  },
  selectedCard: {
    backgroundColor: "#274472",
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  disabledCard: {
    opacity: 0.5,
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    position: 'absolute',
    top: 10,
  },
  disabledCircle: {
    opacity: 0.5,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  cardText: {
    color: "#FFF",
    fontSize: 14,
    textAlign: "center",
  },
  selectedText: {
    color: "#FFD700",
    fontWeight: "bold",
  },
  subItemsButton: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#274472',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  subItemsButtonText: {
    color: '#FFF',
    fontSize: 10,
    marginLeft: 2,
  },
});