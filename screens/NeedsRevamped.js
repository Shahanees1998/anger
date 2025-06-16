import React, { useEffect, useReducer, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "../firebase";
import DataService from "@/services/DataService";

// Import custom components
import { SubItemEditModal } from "../components/FeelingNeedsComponents/SubItemEditModal";

// State management with reducer
const initialState = {
  containers: [],
  loading: false,
  expandedIndex: null,
  selectedBoxId: null,
  subBoxes: [],
  updateBox: {
    label: "",
    containerId: "",
    boxId: "",
  },
  editModalVisible: false,
  selectedSubBox: null,
  isAdmin: false,
  containerTitle: "",
  error: null,
  userSelection: null,
};

const actionTypes = {
  SET_LOADING: "SET_LOADING",
  SET_CONTAINERS: "SET_CONTAINERS",
  SET_ERROR: "SET_ERROR",
  TOGGLE_EXPAND: "TOGGLE_EXPAND",
  SET_SELECTED_BOX: "SET_SELECTED_BOX",
  SET_SUB_BOXES: "SET_SUB_BOXES",
  SET_UPDATE_BOX: "SET_UPDATE_BOX",
  SET_EDIT_MODAL: "SET_EDIT_MODAL",
  SET_SELECTED_SUB_BOX: "SET_SELECTED_SUB_BOX",
  SET_IS_ADMIN: "SET_IS_ADMIN",
  SET_CONTAINER_TITLE: "SET_CONTAINER_TITLE",
  SET_USER_SELECTION: "SET_USER_SELECTION",
  RESET_SELECTION: "RESET_SELECTION",
};

function reducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    case actionTypes.SET_CONTAINERS:
      return { ...state, containers: action.payload };
    case actionTypes.SET_ERROR:
      return { ...state, error: action.payload };
    case actionTypes.TOGGLE_EXPAND:
      return {
        ...state,
        expandedIndex:
          state.expandedIndex === action.payload ? null : action.payload,
        selectedBoxId: null,
        updateBox: initialState.updateBox,
      };
    case actionTypes.SET_SELECTED_BOX:
      return { ...state, selectedBoxId: action.payload };
    case actionTypes.SET_SUB_BOXES:
      return { ...state, subBoxes: action.payload };
    case actionTypes.SET_UPDATE_BOX:
      return { ...state, updateBox: action.payload };
    case actionTypes.SET_EDIT_MODAL:
      return { ...state, editModalVisible: action.payload };
    case actionTypes.SET_SELECTED_SUB_BOX:
      return { ...state, selectedSubBox: action.payload };
    case actionTypes.SET_IS_ADMIN:
      return { ...state, isAdmin: action.payload };
    case actionTypes.SET_CONTAINER_TITLE:
      return { ...state, containerTitle: action.payload };
    case actionTypes.SET_USER_SELECTION:
      return { ...state, userSelection: action.payload };
    case actionTypes.RESET_SELECTION:
      return {
        ...state,
        selectedBoxId: null,
        subBoxes: [],
      };
    default:
      return state;
  }
}

const NeedsRevamped = ({ navigation }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Load containers
  const loadContainers = useCallback(async () => {
    try {
      dispatch({ type: actionTypes.SET_LOADING, payload: true });
      const containerList = await DataService.getBoxContainers(
        "needs-boxes"
      );
      console.log("Loaded containers:", containerList);
      dispatch({ type: actionTypes.SET_CONTAINERS, payload: containerList });
      
      // Load user's current selection if exists
      if (auth.currentUser) {
        const selection = await DataService.getUserSelection("user-needs-selections", auth.currentUser.uid);
        if (selection && selection.selectedAt) {
          const hoursSinceSelection = (new Date() - new Date(selection.selectedAt)) / (1000 * 60 * 60);
          if (hoursSinceSelection < 24) {
            dispatch({ type: actionTypes.SET_USER_SELECTION, payload: selection });
          }
        }
      }
    } catch (error) {
      console.error("Failed to load containers:", error);
      dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
    } finally {
      dispatch({ type: actionTypes.SET_LOADING, payload: false });
    }
  }, []);

  // Check authentication and admin status
  const checkAuth = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        navigation.replace("SignIn");
        return;
      }

      const userData = await DataService.getUserData(user.uid);
      dispatch({
        type: actionTypes.SET_IS_ADMIN,
        payload: userData?.isAdmin || false,
      });
    } catch (error) {
      console.error("Auth check failed:", error);
      navigation.replace("SignIn");
    }
  }, [navigation]);

  useEffect(() => {
    checkAuth();
    loadContainers();
  }, [checkAuth, loadContainers]);

  // Handlers
  const handleAddContainer = async () => {
    if (state.containers.length > 0) {
      Alert.alert("Error", "Only one container is allowed");
      return;
    }

    try {
      const newContainerId = Math.random().toString(36).substring(2, 22);
      const boxes = Array.from({ length: 9 }, (_, index) => ({
        id: `box_${newContainerId}_${index}`,
        boxLabel: `Box ${index + 1}`,
        containerId: newContainerId,
        subBoxes: Array.from({ length: 9 }, (_, subIndex) => ({
          id: `subbox_${newContainerId}_${index}_${subIndex}`,
          label: `Sub-box ${subIndex + 1}`,
          createdAt: new Date(),
          createdBy: "system",
        })),
      }));

      const newContainer = {
        title: state.containerTitle || "Needs",
        containerId: newContainerId,
        boxes,
      };

      console.log("Creating new container:", newContainer);
      await DataService.addDocument(
        "needs-boxes",
        newContainer,
        newContainerId
      );
      dispatch({ type: actionTypes.SET_CONTAINER_TITLE, payload: "" });
      loadContainers();
      Alert.alert("Success", "Container created with 9 boxes");
    } catch (error) {
      console.error("Error adding container:", error);
      Alert.alert("Error", "Failed to save container");
    }
  };

  const handleUpdateBox = async () => {
    const { label, boxId, containerId } = state.updateBox;

    if (!label || !boxId || !containerId) {
      Alert.alert("Error", "Please select a box to edit");
      return;
    }

    try {
      await DataService.updateBoxLabel(
        {
          label,
          boxId,
          containerId
        },
        "needs-boxes"
      );
      dispatch({
        type: actionTypes.SET_UPDATE_BOX,
        payload: initialState.updateBox,
      });
      loadContainers();
    } catch (error) {
      console.error("Error updating box label:", error);
      Alert.alert("Error", "Failed to update box label");
    }
  };

  const handleShowSubBoxes = async (box) => {
    dispatch({
      type: actionTypes.SET_SELECTED_BOX,
      payload: box.id,
    });

    // Load sub-boxes
    try {
      const subBoxes = await DataService.getSubBoxes(
        box.containerId,
        box.id,
        "needs-boxes"
      );
      dispatch({ type: actionTypes.SET_SUB_BOXES, payload: subBoxes || box.subBoxes || [] });
    } catch (error) {
      console.error("Error loading sub-boxes:", error);
      // Fallback to boxes from container data
      dispatch({ type: actionTypes.SET_SUB_BOXES, payload: box.subBoxes || [] });
    }
  };

  const handleSubBoxSelect = async (subBox) => {
    if (state.isAdmin) {
      // Admin can edit the sub-box label
      dispatch({ type: actionTypes.SET_SELECTED_SUB_BOX, payload: subBox });
      dispatch({ type: actionTypes.SET_EDIT_MODAL, payload: true });
    } else {
      // User selects the sub-box
      try {
        const selection = {
          userId: auth.currentUser.uid,
          containerId: state.containers[0]?.containerId,
          boxId: state.selectedBoxId,
          subBoxId: subBox.id,
          selectedAt: new Date(),
        };
        
        await DataService.saveUserSelection("user-needs-selections", selection);
        dispatch({ type: actionTypes.SET_USER_SELECTION, payload: selection });
        Alert.alert("Success", "Your selection has been saved for 24 hours");
        dispatch({ type: actionTypes.RESET_SELECTION });
      } catch (error) {
        console.error("Error saving selection:", error);
        Alert.alert("Error", "Failed to save your selection");
      }
    }
  };

  const handleSubBoxSave = async ({ label }) => {
    if (!state.selectedSubBox) return;

    try {
      const success = await DataService.updateSubBoxLabel(
        {
          containerId: state.containers[0]?.containerId,
          boxId: state.selectedBoxId,
          subBoxId: state.selectedSubBox.id,
          label,
        },
        "needs-boxes"
      );

      if (success) {
        Alert.alert("Success", "Sub-box label updated successfully");
        // Refresh sub-boxes
        const currentBox = state.containers[0]?.boxes.find(b => b.id === state.selectedBoxId);
        if (currentBox) {
          await handleShowSubBoxes(currentBox);
        }
      }
    } catch (error) {
      console.error("Error updating sub-box label:", error);
      Alert.alert("Error", "Failed to update sub-box label");
    }
  };


  // Render functions
  const renderBox = ({ item }) => {
    const isSelected = state.updateBox.boxId === item.id;
    const hasLabel = item.boxLabel && item.boxLabel.trim() !== "";
    const isUserSelected = state.userSelection?.boxId === item.id;

    return (
      <TouchableOpacity
        style={[
          styles.boxCard,
          isSelected && styles.selectedBox,
          isUserSelected && styles.userSelectedBox,
          !hasLabel && !state.isAdmin && styles.disabledBox
        ]}
        onPress={() => (hasLabel || state.isAdmin) && handleShowSubBoxes(item)}
        disabled={!hasLabel && !state.isAdmin}
      >
        <Text style={[styles.boxLabel, !hasLabel && styles.emptyLabel]}>
          {item.boxLabel || "Empty"}
        </Text>
        {state.isAdmin && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              dispatch({
                type: actionTypes.SET_UPDATE_BOX,
                payload: {
                  boxId: item.id,
                  containerId: item.containerId,
                  label: item.boxLabel,
                },
              });
            }}
          >
            <Ionicons name="pencil" size={16} color="#FFF" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const renderContainer = ({ item }) => {
    const boxes = item.boxes?.filter(box => {
      if (state.isAdmin) return true;
      return box.boxLabel && box.boxLabel.trim() !== "";
    }) || [];

    return (
      <>
        <View style={styles.containerHeader}>
          <Text style={styles.containerTitle}>{item.title || "Needs"}</Text>
          {state.userSelection && (
            <View style={styles.selectionInfo}>
              <Text style={styles.selectionText}>Current Selection: Box {state.userSelection.boxId}</Text>
              <Text style={styles.selectionTime}>Expires in {Math.floor(24 - ((new Date() - new Date(state.userSelection.selectedAt)) / (1000 * 60 * 60)))} hours</Text>
            </View>
          )}
        </View>

        {state.isAdmin && (
          <View style={styles.boxInputContainer}>
            <TextInput
              style={styles.expandedInput}
              placeholder="Update box label here..."
              placeholderTextColor="#FFFFFF80"
              value={state.updateBox.label}
              onChangeText={(text) =>
                dispatch({
                  type: actionTypes.SET_UPDATE_BOX,
                  payload: { ...state.updateBox, label: text }
                })
              }
            />
            <TouchableOpacity onPress={handleUpdateBox} style={styles.sendButton}>
              <Ionicons name="paper-plane-outline" size={24} color="#274472" />
            </TouchableOpacity>
          </View>
        )}

        {state.selectedBoxId ? (
          <View style={styles.subBoxesContainer}>
            <View style={styles.subBoxHeader}>
              <Text style={styles.subBoxHeaderText}>Sub-boxes</Text>
              <TouchableOpacity onPress={() => dispatch({ type: actionTypes.RESET_SELECTION })}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={state.subBoxes}
              keyExtractor={(item) => item.id}
              renderItem={({ item: subBox }) => (
                <TouchableOpacity
                  style={[
                    styles.subBoxCard,
                    state.userSelection?.subBoxId === subBox.id && styles.userSelectedSubBox
                  ]}
                  onPress={() => handleSubBoxSelect(subBox)}
                >
                  <Text style={styles.subBoxLabel}>{subBox.label || "Empty"}</Text>
                </TouchableOpacity>
              )}
              numColumns={3}
              contentContainerStyle={styles.grid}
              columnWrapperStyle={styles.columnWrapper}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        ) : (
          <FlatList
            data={boxes}
            keyExtractor={(item) => item.id}
            renderItem={renderBox}
            numColumns={3}
            contentContainerStyle={styles.grid}
            columnWrapperStyle={styles.columnWrapper}
            keyboardShouldPersistTaps="handled"
          />
        )}
      </>
    );
  };

  if (state.loading) {
    return (
      <LinearGradient colors={["#5885AF", "#5885AF"]} style={styles.background}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="white" />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#5885AF", "#5885AF"]} style={styles.background}>
      <Header onBack={() => navigation.goBack()} title="Needs" />

      <View style={styles.container}>
        <FlatList
          data={state.containers}
          keyExtractor={(_, index) => index.toString()}
          renderItem={renderContainer}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.mainList}
        />

        {state.isAdmin && state.containers.length === 0 && (
          <View style={styles.bottomContainer}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter container title (optional)..."
                placeholderTextColor="#FFFFFF"
                value={state.containerTitle}
                onChangeText={(text) =>
                  dispatch({
                    type: actionTypes.SET_CONTAINER_TITLE,
                    payload: text,
                  })
                }
              />
              <TouchableOpacity
                onPress={handleAddContainer}
                style={styles.sendButton}
              >
                <Ionicons name="add-circle-outline" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <SubItemEditModal
        visible={state.editModalVisible}
        subItem={state.selectedSubBox}
        onSave={handleSubBoxSave}
        onClose={() => {
          dispatch({ type: actionTypes.SET_EDIT_MODAL, payload: false });
          dispatch({ type: actionTypes.SET_SELECTED_SUB_BOX, payload: null });
        }}
        labelOnly={true}
      />
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

export default NeedsRevamped;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    paddingHorizontal: 20,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  mainList: {
    paddingBottom: 100,
  },
  grid: {
    padding: 16,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  boxInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#41729F",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  expandedInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
  },
  sendButton: {
    marginLeft: 10,
    justifyContent: "center",
  },
  subBoxesContainer: {
    backgroundColor: "#41729F",
    borderRadius: 10,
    margin: 16,
    overflow: "hidden",
  },
  subBoxHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#FFFFFF30",
  },
  subBoxHeaderText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  bottomContainer: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
  },
  inputContainer: {
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
  containerHeader: {
    padding: 16,
    backgroundColor: "#274472",
    borderRadius: 10,
    marginBottom: 16,
  },
  containerTitle: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  selectionInfo: {
    marginTop: 8,
    alignItems: "center",
  },
  selectionText: {
    color: "#FFF",
    fontSize: 14,
  },
  selectionTime: {
    color: "#FFFFFF80",
    fontSize: 12,
  },
  boxCard: {
    backgroundColor: "#274472",
    borderRadius: 10,
    padding: 16,
    margin: 4,
    flex: 1,
    minHeight: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedBox: {
    backgroundColor: "#41729F",
  },
  userSelectedBox: {
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  disabledBox: {
    opacity: 0.5,
  },
  boxLabel: {
    color: "#FFF",
    fontSize: 16,
    textAlign: "center",
  },
  emptyLabel: {
    color: "#FFFFFF60",
    fontStyle: "italic",
  },
  editButton: {
    position: "absolute",
    top: 8,
    right: 8,
    padding: 4,
  },
  subBoxCard: {
    backgroundColor: "#274472",
    borderRadius: 8,
    padding: 12,
    margin: 4,
    flex: 1,
    minHeight: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  userSelectedSubBox: {
    backgroundColor: "#FFD700",
  },
  subBoxLabel: {
    color: "#FFF",
    fontSize: 14,
    textAlign: "center",
  },
});
