import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";

const FileUploader = ({ onFileSelected, fileType = "all" }) => {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

  // Request permissions for media library access
  const requestMediaLibraryPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Sorry, we need media library permissions to upload files."
      );
      return false;
    }
    return true;
  };

  // Request permissions for camera access
  const requestCameraPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Sorry, we need camera permissions to take photos."
      );
      return false;
    }
    return true;
  };

  // Request permissions for audio recording
  const requestAudioPermissions = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Sorry, we need audio recording permissions to record audio."
      );
      return false;
    }
    return true;
  };

  // Pick a document from the device
  const pickDocument = async () => {
    try {
      setLoading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (
        result.canceled === false &&
        result.assets &&
        result.assets.length > 0
      ) {
        const fileData = result.assets[0];
        const fileInfo = {
          uri: fileData.uri,
          name: fileData.name,
          type: fileData.mimeType,
          size: fileData.size,
        };

        setSelectedFile(fileInfo);
        onFileSelected(fileInfo);
      }
    } catch (err) {
      console.error("Error picking document:", err);
      Alert.alert("Error", "Failed to pick document");
    } finally {
      setLoading(false);
    }
  };

  // Pick an image from the gallery
  const pickImage = async () => {
    if (!(await requestMediaLibraryPermissions())) return;

    try {
      setLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageInfo = {
          uri: result.assets[0].uri,
          name: result.assets[0].uri.split("/").pop(),
          type: "image/" + (result.assets[0].uri.split(".").pop() || "jpeg"),
          size: result.assets[0].fileSize,
        };

        setSelectedFile(imageInfo);
        onFileSelected(imageInfo);
      }
    } catch (err) {
      console.error("Error picking image:", err);
      Alert.alert("Error", "Failed to pick image");
    } finally {
      setLoading(false);
    }
  };

  // Take a photo with the camera
  const takePhoto = async () => {
    if (!(await requestCameraPermissions())) return;

    try {
      setLoading(true);
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageInfo = {
          uri: result.assets[0].uri,
          name: result.assets[0].uri.split("/").pop(),
          type: "image/" + (result.assets[0].uri.split(".").pop() || "jpeg"),
          size: result.assets[0].fileSize,
        };

        setSelectedFile(imageInfo);
        onFileSelected(imageInfo);
      }
    } catch (err) {
      console.error("Error taking photo:", err);
      Alert.alert("Error", "Failed to take photo");
    } finally {
      setLoading(false);
    }
  };

  // Record audio
  const startRecording = async () => {
    if (!(await requestAudioPermissions())) return;

    try {
      setLoading(true);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
      setLoading(false);
    } catch (err) {
      console.error("Error starting recording:", err);
      Alert.alert("Error", "Failed to start recording");
      setLoading(false);
    }
  };

  // Stop audio recording
  const stopRecording = async () => {
    if (!recording) return;

    try {
      setLoading(true);
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recording.getURI();
      if (uri) {
        const audioInfo = {
          uri,
          name: uri.split("/").pop(),
          type: "audio/m4a",
        };

        setSelectedFile(audioInfo);
        onFileSelected(audioInfo);
      }

      setRecording(null);
      setIsRecording(false);
    } catch (err) {
      console.error("Error stopping recording:", err);
      Alert.alert("Error", "Failed to save recording");
    } finally {
      setLoading(false);
    }
  };

  // Pick a video from the gallery
  const pickVideo = async () => {
    if (!(await requestMediaLibraryPermissions())) return;

    try {
      setLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
        videoMaxDuration: 60, // 1 minute max
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const videoInfo = {
          uri: result.assets[0].uri,
          name: result.assets[0].uri.split("/").pop(),
          type: "video/" + (result.assets[0].uri.split(".").pop() || "mp4"),
          size: result.assets[0].fileSize,
        };

        setSelectedFile(videoInfo);
        onFileSelected(videoInfo);
      }
    } catch (err) {
      console.error("Error picking video:", err);
      Alert.alert("Error", "Failed to pick video");
    } finally {
      setLoading(false);
    }
  };

  // Record video with the camera
  const recordVideo = async () => {
    if (!(await requestCameraPermissions())) return;

    try {
      setLoading(true);
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        videoMaxDuration: 60, // 1 minute max
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const videoInfo = {
          uri: result.assets[0].uri,
          name: result.assets[0].uri.split("/").pop(),
          type: "video/" + (result.assets[0].uri.split(".").pop() || "mp4"),
          size: result.assets[0].fileSize,
        };

        setSelectedFile(videoInfo);
        onFileSelected(videoInfo);
      }
    } catch (err) {
      console.error("Error recording video:", err);
      Alert.alert("Error", "Failed to record video");
    } finally {
      setLoading(false);
    }
  };

  // Clear selected file
  const clearFile = () => {
    setSelectedFile(null);
    onFileSelected(null);
  };

  // Render file preview based on file type
  const renderFilePreview = () => {
    if (!selectedFile) return null;

    const fileType = selectedFile.type || "";

    if (fileType.startsWith("image/")) {
      return (
        <View style={styles.previewContainer}>
          <Image
            source={{ uri: selectedFile.uri }}
            style={styles.imagePreview}
          />
          <TouchableOpacity style={styles.clearButton} onPress={clearFile}>
            <Ionicons name="close-circle" size={24} color="#FF5252" />
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.previewContainer}>
        <View style={styles.fileIconContainer}>
          <Ionicons
            name={
              fileType.startsWith("audio/")
                ? "musical-note"
                : fileType.startsWith("video/")
                ? "videocam"
                : "document"
            }
            size={40}
            color="#41729F"
          />
          <Text style={styles.fileName} numberOfLines={1}>
            {selectedFile.name}
          </Text>
        </View>
        <TouchableOpacity style={styles.clearButton} onPress={clearFile}>
          <Ionicons name="close-circle" size={24} color="#FF5252" />
        </TouchableOpacity>
      </View>
    );
  };

  // Determine which upload options to show based on fileType prop
  const renderUploadOptions = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#41729F" />
        </View>
      );
    }

    if (isRecording) {
      return (
        <View style={styles.recordingContainer}>
          <Text style={styles.recordingText}>Recording audio...</Text>
          <TouchableOpacity style={styles.stopButton} onPress={stopRecording}>
            <Ionicons name="stop-circle" size={50} color="#FF5252" />
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.optionsContainer}>
        {(fileType === "all" || fileType === "document") && (
          <TouchableOpacity style={styles.option} onPress={pickDocument}>
            <Ionicons name="document" size={30} color="#41729F" />
            <Text style={styles.optionText}>Document</Text>
          </TouchableOpacity>
        )}

        {(fileType === "all" || fileType === "image") && (
          <>
            <TouchableOpacity style={styles.option} onPress={pickImage}>
              <Ionicons name="images" size={30} color="#41729F" />
              <Text style={styles.optionText}>Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.option} onPress={takePhoto}>
              <Ionicons name="camera" size={30} color="#41729F" />
              <Text style={styles.optionText}>Camera</Text>
            </TouchableOpacity>
          </>
        )}

        {(fileType === "all" || fileType === "audio") && (
          <TouchableOpacity style={styles.option} onPress={startRecording}>
            <Ionicons name="mic" size={30} color="#41729F" />
            <Text style={styles.optionText}>Record Audio</Text>
          </TouchableOpacity>
        )}

        {(fileType === "all" || fileType === "video") && (
          <>
            <TouchableOpacity style={styles.option} onPress={pickVideo}>
              <Ionicons name="film" size={30} color="#41729F" />
              <Text style={styles.optionText}>Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.option} onPress={recordVideo}>
              <Ionicons name="videocam" size={30} color="#41729F" />
              <Text style={styles.optionText}>Record Video</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {selectedFile ? renderFilePreview() : renderUploadOptions()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    backgroundColor: "#274472",
    borderRadius: 10,
    padding: 15,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },
  option: {
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    margin: 5,
    backgroundColor: "#FFFFFF1A",
    borderRadius: 10,
    width: 90,
    height: 90,
  },
  optionText: {
    color: "#FFFFFF",
    marginTop: 5,
    fontSize: 12,
    textAlign: "center",
  },
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
  previewContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 5,
  },
  fileIconContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  fileName: {
    color: "#FFFFFF",
    marginLeft: 10,
    flex: 1,
  },
  clearButton: {
    padding: 5,
  },
  recordingContainer: {
    alignItems: "center",
    padding: 15,
  },
  recordingText: {
    color: "#FFFFFF",
    marginBottom: 10,
  },
  stopButton: {
    padding: 10,
  },
});

export default FileUploader;
