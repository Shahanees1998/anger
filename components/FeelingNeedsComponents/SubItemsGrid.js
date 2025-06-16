import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

export const SubItemsGrid = ({ subItems, selectedId, onSelectItem }) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.grid}>
        {subItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.itemCard,
              selectedId === item.id && styles.selectedCard,
            ]}
            onPress={() => onSelectItem(item)}
          >
            <Text style={styles.itemText} numberOfLines={2}>
              {item.question && item.answer
                ? `Q: ${item.question.slice(0, 20)}${item.question.length > 20 ? '...' : ''}`
                : 'Empty - Click to edit'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    maxHeight: 250,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    justifyContent: 'space-between',
  },
  itemCard: {
    width: '31%',
    aspectRatio: 1,
    margin: '1%',
    backgroundColor: '#FFFFFF2A',
    borderRadius: 8,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCard: {
    backgroundColor: '#FFD700',
  },
  itemText: {
    color: '#FFF',
    fontSize: 12,
    textAlign: 'center',
  },
});