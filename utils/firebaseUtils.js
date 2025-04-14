import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export const measureFirestoreOperation = async (operation, operationName) => {
  const startTime = Date.now();
  try {
    const result = await operation();
    const endTime = Date.now();
    console.log(`${operationName} took ${endTime - startTime} milliseconds`);
    return result;
  } catch (error) {
    console.error(`${operationName} failed:`, error);
    throw error;
  }
};

export const checkFirestoreConnection = async () => {
  try {
    const testRef = doc(db, '_connection_test_', 'test');
    await setDoc(testRef, { timestamp: serverTimestamp() });
    await deleteDoc(testRef);
    console.log('Firestore connection successful');
    return true;
  } catch (error) {
    console.error('Firestore connection failed:', error);
    return false;
  }
}; 