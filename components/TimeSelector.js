import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Dimensions,
    Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Settings from "../assets/settings.png"

const TimeSelector = ({ selectedTime, onTimeSelect }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [slideAnim] = useState(new Animated.Value(Dimensions.get('window').height));

    const showModal = () => {
        setModalVisible(true);
        Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
        }).start();
    };

    const hideModal = () => {
        Animated.timing(slideAnim, {
            toValue: Dimensions.get('window').height,
            duration: 300,
            useNativeDriver: true,
        }).start(() => setModalVisible(false));
    };

    const handleSelect = (time) => {
        onTimeSelect(time);
        hideModal();
    };

    return (
        <>
            <TouchableOpacity
                style={styles.selector}
                onPress={showModal}
            >
                <Text style={styles.selectorText}>{selectedTime}</Text>
                <Image source={Settings} />
                {/* <Ionicons name="chevron-down" size={24} color="#000" /> */}
            </TouchableOpacity>


            <Modal
                transparent={true}
                visible={modalVisible}
                animationType="none"
                onRequestClose={hideModal}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={hideModal}
                >
                    <Animated.View
                        style={[
                            styles.modalContent,
                            {
                                transform: [{ translateY: slideAnim }],
                            },
                        ]}
                    >


                        <TouchableOpacity
                            style={styles.option}
                            onPress={() => handleSelect('Today')}
                        >
                            <Text style={styles.optionText}>Today</Text>
                            {selectedTime === 'Today' && (
                                <Ionicons name="checkmark" size={24} color="#007AFF" />
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.option}
                            onPress={() => handleSelect('Weekly')}
                        >
                            <Text style={styles.optionText}>Weekly</Text>
                            {selectedTime === 'Weekly' && (
                                <Ionicons name="checkmark" size={24} color="#007AFF" />
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.option}
                            onPress={() => handleSelect('Monthly')}
                        >
                            <Text style={styles.optionText}>Monthly</Text>
                            {selectedTime === 'Monthly' && (
                                <Ionicons name="checkmark" size={24} color="#007AFF" />
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.option}
                            onPress={() => handleSelect('Yearly')}
                        >
                            <Text style={styles.optionText}>Yearly</Text>
                            {selectedTime === 'Yearly' && (
                                <Ionicons name="checkmark" size={24} color="#007AFF" />
                            )}
                        </TouchableOpacity>
                    </Animated.View>
                </TouchableOpacity>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    selector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 10,
        backgroundColor: '#41729F',
        borderRadius: 10,
        
        width: "90%",
        
    },
    selectorText: {
        fontSize: 16,
        fontWeight: '500',
        color: "#fff"
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 20,
    },
  
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
    },
    option: {
        flexDirection: 'row',
        alignItem: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal:20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    optionText: {
        fontSize: 16,
    },
});

export default TimeSelector; 