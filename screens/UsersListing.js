import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Dimensions,
} from "react-native";
import { doc, updateDoc } from "firebase/firestore";
import { LinearGradient } from "expo-linear-gradient";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import InformationIcon from "../assets/information_icon.png";

import {
  measureFirestoreOperation,
  checkFirestoreConnection,
} from "../utils/firebaseUtils";
import CustomAlert from "@/components/CustomAlert";

const { width } = Dimensions.get("window");

const UsersListing = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});
  const [expandedIndex, setExpandedIndex] = useState(null);

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    new24h: 0,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const isConnected = await checkFirestoreConnection();
      if (!isConnected) {
        throw new Error("Unable to connect to database");
      }

      const usersList = await measureFirestoreOperation(async () => {
        const usersRef = collection(db, "users");
        const querySnapshot = await getDocs(usersRef);
        const users = [];
        const now = new Date();
        const last24h = new Date(now - 24 * 60 * 60 * 1000);
        let activeCount = 0;
        let newCount = 0;

        querySnapshot.forEach((doc) => {
          const userData = doc.data();

          if (!userData.isAdmin) {
            const createdAt = new Date(userData.createdAt);
            if (createdAt > last24h) {
              newCount++;
            }
            if (userData.lastActive) {
              const lastActive = new Date(userData.lastActive);
              if (lastActive > last24h) {
                activeCount++;
              }
            }
            users.push({
              id: doc.id,
              ...userData,
              createdAt: createdAt.toLocaleDateString(),
            });
          }
        });

        setStats({
          total: users.length,
          active: activeCount,
          new24h: newCount,
        });

        return users;
      }, "Fetch users operation");

      setUsers(usersList);
    } catch (error) {
      console.error("Error fetching users:", error);
      Alert.alert("Error", error.message || "Failed to fetch users");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigation.replace("SignIn");
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Error", "Failed to logout");
    }
  };

  const handleUserClick = (user) => {
    setAlertVisible(true);
    setAlertConfig({
      icon: InformationIcon,
      title: "Confirmation",
      message: `Are you sure you want to ${
        user.isDisabled ? "enable" : "disable"
      } this user?`,
      onContinue: async () => {
        try {
          const userRef = doc(db, "users", user.id);
          await updateDoc(userRef, {
            isDisabled: !user.isDisabled,
          });

          fetchUsers();

          setAlertVisible(false);

          Alert.alert(
            "Success",
            `User has been ${user.isDisabled ? "enabled" : "disabled"}`
          );
        } catch (error) {
          console.error("Error updating user:", error);
          Alert.alert("Error", "Failed to update user status");
          setAlertVisible(false);
        }
      },
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const renderStatCard = ({ title, value, icon, color }) => (
    <View style={[styles.statCard, { backgroundColor: color }]}>
      <View style={styles.statIconContainer}>
        <MaterialIcons name={icon} size={24} color="white" />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  const renderUserCard = ({ item }) => (
    <View style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={styles.userIcon}>
          <Text style={styles.userInitials}>
            {item.firstName?.[0] || ""}
            {item.lastName?.[0] || ""}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {item.firstName} {item.lastName}
          </Text>
          <Text style={styles.userEmail}>{item.email}</Text>
        </View>
      </View>
      <View style={styles.userDetails}>
        <View style={styles.detailRow}>
          <MaterialIcons name="date-range" size={16} color="#666" />
          <Text style={styles.detailText}>Joined: {item.createdAt}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons name="phone" size={16} color="#666" />
          <Text style={styles.detailText}>{item?.phone || "No phone"}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons name="person" size={16} color="#666" />
          <Text style={styles.detailText}>
            {item?.gender || "Gender not specified"}
          </Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => handleUserClick(item)}>
        <Text
          style={[
            styles.button,
            {
              backgroundColor: item?.isDisabled ? "#4CAF50" : "#FF5722",
            },
          ]}
        >
          {item.isDisabled ? "Enable" : "Disable"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const toggleExpand = (index) => {
    setExpandedIndex(index === expandedIndex ? null : index);
  };

  const ExpandedForm = ({ item, index }) => {
    return (
      <View style={styles.userCard}>
        {/* <View style={styles.userHeader}>
            <View style={styles.userIcon}>
              <Text style={styles.userInitials}>
                {item.firstName?.[0] || ""}
                {item.lastName?.[0] || ""}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {item.firstName} {item.lastName}
              </Text>
              <Text style={styles.userEmail}>{item.email}</Text>
            </View>
          </View> */}
        <View style={styles.userDetails}>
          <View style={styles.detailRow}>
            <MaterialIcons name="mail" size={16} color="#fff" />
            <Text style={styles.detailText}>{item.email}</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons name="date-range" size={16} color="#fff" />
            <Text style={styles.detailText}>Joined: {item.createdAt}</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons name="phone" size={16} color="#fff" />
            <Text style={styles.detailText}>{item?.phone || "No phone"}</Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons name="person" size={16} color="#fff" />
            <Text style={styles.detailText}>
              {item?.gender || "Gender not specified"}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleUserClick(item)}
        >
          <Text style={{ color: "#fff" }}>
            {item.isDisabled ? "Enable" : "Disable"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderContent = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Loading users...</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={users}
        // renderItem={renderUserCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item, index }) => (
          <>
            <TouchableOpacity onPress={() => toggleExpand(index)}>
              <View style={styles.listItem}>
                <View style={styles.itemContent}>
                  <View style={styles.userIcon}>
                    <Text style={styles.userInitials}>
                      {item.firstName?.[0] || ""}
                      {item.lastName?.[0] || ""}
                    </Text>
                  </View>
                  <Text style={styles.itemText}>
                    {" "}
                    {item.firstName} {item.lastName}
                  </Text>

                  <Ionicons
                    name={
                      expandedIndex === index
                        ? "chevron-forward"
                        : "chevron-down"
                    }
                    size={24}
                    color="#FFF"
                  />
                </View>
              </View>
            </TouchableOpacity>
            {expandedIndex === index && (
              <ExpandedForm item={item} index={index} />
            )}
          </>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="people-outline" size={50} color="#fff" />
            <Text style={styles.emptyText}>No users found</Text>
          </View>
        }
      />
    );
  };

  return (
    <LinearGradient
      colors={["#5885AF", "#5885AF"]}
      style={styles.background}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Users</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        {/* <View style={styles.statsContainer}>
          {renderStatCard({
            title: "Total Users",
            value: stats.total,
            icon: "people",
            color: "#4CAF50",
          })}
          {renderStatCard({
            title: "Active Users",
            value: stats.active,
            icon: "person",
            color: "#2196F3",
          })}
          {renderStatCard({
            title: "New Users",
            value: stats.new24h,
            icon: "person-add",
            color: "#FF9800",
          })}
        </View> */}
        {renderContent()}
        <CustomAlert
          visible={alertVisible}
          onClose={() => setAlertVisible(false)}
          {...alertConfig}
        />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
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
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
  },
  background: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  logoutButton: {
    padding: 10,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
  },
  statCard: {
    width: (width - 60) / 3,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  statIconContainer: {
    marginBottom: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  statTitle: {
    fontSize: 12,
    color: "#fff",
    textAlign: "center",
  },
  listContainer: {
    padding: 15,
  },
  userCard: {
    backgroundColor: "#FFFFFF1A",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  userIcon: {
    width: 35,
    height: 35,
    borderRadius: 25,
    backgroundColor: "#5885AF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  userInitials: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  userEmail: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  userDetails: {
    marginTop: 10,
    paddingTop: 10,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 3,
  },
  detailText: {
    fontSize: 14,
    color: "white",
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 10,
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
  },
  button: {
    borderRadius: 3,
    paddingVertical: 2,
    paddingHorizontal: 4,
    textAlign: "center",
    marginTop: 4,
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
  actionButton: {
    flex: 1,
    backgroundColor: "#274472",
    padding: 10,
    borderRadius: 10,
    marginRight: 5,
    alignItems: "center",
  },
});

export default UsersListing;
