import { 
  doc, 
  setDoc, 
  getDoc, 
  collection,
  addDoc,
  query,
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

class DataService {
  // Check if we're online
  static async isOnline() {
    const netInfo = await NetInfo.fetch();
    return netInfo.isConnected && netInfo.isInternetReachable;
  }

  // Save data locally
  static async saveLocally(key, data) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving locally:', error);
    }
  }

  // Get local data
  static async getLocal(key) {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting local data:', error);
      return null;
    }
  }

  // Add document with offline support
  static async addDocument(collectionPath, data) {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user');

    // Add timestamp
    const docData = {
      ...data,
      createdAt: serverTimestamp(),
      userId: user.uid
    };

    try {
      // Try to save to Firestore
      if (await this.isOnline()) {
        const docRef = await addDoc(collection(db, collectionPath), docData);
        // Save locally as backup
        await this.saveLocally(`${collectionPath}_${docRef.id}`, docData);
        return docRef.id;
      } else {
        // If offline, save locally with temporary ID
        const tempId = `temp_${Date.now()}`;
        await this.saveLocally(`${collectionPath}_${tempId}`, docData);
        return tempId;
      }
    } catch (error) {
      console.error('Error adding document:', error);
      // Save locally if Firestore fails
      const tempId = `temp_${Date.now()}`;
      await this.saveLocally(`${collectionPath}_${tempId}`, docData);
      return tempId;
    }
  }

  // Get document with offline support
  static async getDocument(path) {
    try {
      // Try to get from Firestore first
      if (await this.isOnline()) {
        const docSnap = await getDoc(doc(db, path));
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Update local cache
          await this.saveLocally(path, data);
          return data;
        }
      }
      
      // If offline or doc doesn't exist, try local cache
      return await this.getLocal(path);
    } catch (error) {
      console.error('Error getting document:', error);
      // Return local cache if available
      return await this.getLocal(path);
    }
  }

  // Sync pending changes when online
  static async syncPendingChanges() {
    if (!(await this.isOnline())) return;

    try {
      const keys = await AsyncStorage.getAllKeys();
      const tempKeys = keys.filter(key => key.startsWith('temp_'));

      for (const key of tempKeys) {
        const data = await this.getLocal(key);
        if (data) {
          // Upload to Firestore
          const docRef = await addDoc(collection(db, data.collection), data);
          // Remove temp data
          await AsyncStorage.removeItem(key);
          // Save with real ID
          await this.saveLocally(`${data.collection}_${docRef.id}`, data);
        }
      }
    } catch (error) {
      console.error('Error syncing pending changes:', error);
    }
  }

  // Get user data with offline support
  static async getUserData(userId) {
    try {
      // First try to get from local storage
      const localData = await this.getLocal(`users/${userId}`);
      if (localData) {
        return localData;
      }

      // If online and no local data, try Firestore
      if (await this.isOnline()) {
        const docSnap = await getDoc(doc(db, 'users', userId));
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Save to local storage for future offline access
          await this.saveLocally(`users/${userId}`, data);
          return data;
        }
      }

      return null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  // Save user auth state
  static async saveAuthState(user) {
    if (!user) return;
    try {
      const authData = {
        uid: user.uid,
        email: user.email,
        lastLogin: new Date().toISOString()
      };
      await this.saveLocally('authUser', authData);
    } catch (error) {
      console.error('Error saving auth state:', error);
    }
  }

  // Get saved auth state
  static async getAuthState() {
    try {
      return await this.getLocal('authUser');
    } catch (error) {
      console.error('Error getting auth state:', error);
      return null;
    }
  }

  // Get collection with offline support
  static async getCollection(collectionPath) {
    try {
      // First try to get from local storage
      const localData = await this.getLocal(collectionPath);
      if (localData) {
        return localData;
      }

      // If online and no local data, try Firestore
      if (await this.isOnline()) {
        const querySnapshot = await getDocs(collection(db, collectionPath));
        const documents = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Save to local storage for future offline access
        await this.saveLocally(collectionPath, documents);
        return documents;
      }

      return [];
    } catch (error) {
      console.error('Error getting collection:', error);
      return [];
    }
  }

  static async verifyAdmin(userId) {
    try {
      // Check local first
      const savedAdmin = await this.getLocal('adminAuth');
      if (savedAdmin?.uid === userId && savedAdmin?.isAdmin) {
        return true;
      }

      // If online, check Firestore
      if (await this.isOnline()) {
        const adminDoc = await getDoc(doc(db, 'admins', userId));
        return adminDoc.exists() && adminDoc.data().isAdmin;
      }

      return false;
    } catch (error) {
      console.error('Error verifying admin:', error);
      return false;
    }
  }

  static async clearAdminAuth() {
    try {
      await this.saveLocally('adminAuth', null);
    } catch (error) {
      console.error('Error clearing admin auth:', error);
    }
  }
}

export default DataService; 