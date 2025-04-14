import {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  serverTimestamp,
  arrayUnion,
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

  static async checkExistingRecordAndUpdate(collectionPath, data) {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user');

    // Add timestamp

    try {
      // Try to save to Firestore
      if (await this.isOnline()) {
        const answersCollection = collection(db, collectionPath);

        const q = query(
          answersCollection,
          where('questionId', '==', data.questionId),
          where('subquestionId', '==', data.subquestionId),
          where('userId', '==', data.userId)
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          // Record found, now check if the answerId is different
          const existingDoc = querySnapshot.docs[0];
          const existingAnswerId = existingDoc.data().answerId;

          if (existingAnswerId !== data.answerId) {
            // If answerId is different, update the answerId in the document
            await updateDoc(existingDoc.ref, {
              answerId: data.answerId,
            });
            console.log('AnswerId updated successfully!');
          } else {
            // If answerId is the same, no need to update anything
            console.log('Record already exists with the same answerId.');
          }
        } else {
          // No matching record found, so create a new document
          await setDoc(doc(answersCollection), data);
          console.log('New record added successfully!');
        }
      }
      //  else {
      //   // If offline, save locally with temporary ID
      //   const tempId = `temp_${Date.now()}`;
      //   await this.saveLocally(`${collectionPath}_${tempId}`, docData);
      //   return tempId;
      // }
    } catch (error) {
      console.error('Error adding document:', error);
    }
  }

  // Add document with offline support
  static async addDocument(collectionPath, data, id = null) {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user');

    // Add timestamp
    const docData = {
      ...data,
      createdAt: serverTimestamp(),
      createdBy: user.uid,
    };

    try {
      // Try to save to Firestore
      if (await this.isOnline()) {
        let docRef;

        if (id) {
          docRef = doc(db, collectionPath, id);
          await setDoc(docRef, docData); // Use setDoc when you're setting a specific document
        } else {
          docRef = await addDoc(collection(db, collectionPath), docData);
        }

        // Save locally as backup
        // await this.saveLocally(`${collectionPath}_${docRef.id}`, docData);
        return docRef.id;
      }
      //  else {
      //   // If offline, save locally with temporary ID
      //   const tempId = `temp_${Date.now()}`;
      //   await this.saveLocally(`${collectionPath}_${tempId}`, docData);
      //   return tempId;
      // }
    } catch (error) {
      console.error('Error adding document:', error);
    }
  }

  static async updateDocument(collectionPath, data, id) {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user');

    const docRef = doc(db, collectionPath, id);
    const clientTimestamp = new Date();

    const updateData = {
      ...data,
      createdBy: auth.currentUser.uid,
      createdAt: clientTimestamp,
    };

    try {
      if (await this.isOnline()) {
        await updateDoc(docRef, {
          answers: arrayUnion(updateData),
        });

        return;
      }
    } catch (error) {
      console.error('Error adding document:', error);
    }
  }

  static async updateQuestions(collectionPath, data, id) {
    const user = auth.currentUser;
    if (!user) throw new Error('No authenticated user');

    const docRef = doc(db, collectionPath, id);

    try {
      if (await this.isOnline()) {
        await updateDoc(docRef, {
          question: data,
        });
      }
    } catch (error) {
      console.error('Error adding document:', error);
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
      const tempKeys = keys.filter((key) => key.startsWith('temp_'));

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
        lastLogin: new Date().toISOString(),
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
      if (await this.isOnline()) {
        const querySnapshot = await getDocs(collection(db, collectionPath));
        const documents = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          const currentDate = new Date().toDateString();

          const filteredAnswers = data?.answers?.filter((answer) => {
            const answerDate = new Date(
              answer?.createdAt?.seconds * 1000
            ).toDateString();

            return (
              answer.createdBy === auth.currentUser?.uid &&
              answerDate == currentDate
            );
          });

          return {
            id: doc.id,
            question: data.question,
            createdBy: data.createdBy,
            createdAt: data.createdAt,
            answers: filteredAnswers,
          };
        });
        // console.log(documents, "here is user documents---");

        // Save to local storage for future offline access
        // await this.saveLocally(collectionPath, documents);
        return documents;
      }

      return [];
    } catch (error) {
      console.error('Error getting collection:', error);
      return [];
    }
  }

  static async getFeelingAndNeedsQuestions(collectionPath) {
    try {
      if (await this.isOnline()) {
        const querySnapshot = await getDocs(collection(db, collectionPath));
        const documents = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          const currentDate = new Date().toDateString();

          return {
            id: doc.id,
            ...data,
          };
        });
        // console.log(documents, "here is user documents---");

        // Save to local storage for future offline access
        // await this.saveLocally(collectionPath, documents);
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

  static async getAnswesfromFeelingandNeeds(
    collectionPath,
    answersCollectionPath
  ) {
    const userId = auth.currentUser.uid;

    const result = [];

    const answersCollection = collection(db, answersCollectionPath);
    const q = query(answersCollection, where('userId', '==', userId));

    try {
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        for (const doc of querySnapshot.docs) {
          const answerData = doc.data();
          const { questionId, answerId } = answerData;

          let questionIndex = result.findIndex(
            (q) => q.questionId === questionId
          );

          if (questionIndex === -1) {
            const questionQuery = query(
              collection(db, collectionPath),
              where('questionId', '==', questionId)
            );

            const questionSnapshot = await getDocs(questionQuery);

            if (!questionSnapshot.empty) {
              questionSnapshot.forEach((questionDoc) => {
                const questionData = questionDoc.data();
                const { questionText, subquestions } = questionData;

                result.push({
                  questionId,
                  question: questionText,
                  answers: [],
                });

                questionIndex = result.findIndex(
                  (q) => q.questionId === questionId
                );

                const subquestion = subquestions.find((sub) =>
                  sub.answers.some((answer) => answer.id === answerId)
                );

                if (subquestion) {
                  const userAnswer = subquestion.answers.find(
                    (answer) => answer.id === answerId
                  );

                  if (userAnswer) {
                    result[questionIndex].answers.push({
                      questionId,
                      answerId: userAnswer.id,
                      answerText: userAnswer.answerText,
                    });
                  }
                }
              });
            }
          }
        }

        console.log(result);
        // return result;
      } else {
        console.log('No answers found for the current user.');
      }
      return result;
    } catch (error) {
      console.error(
        'Error fetching user answers and corresponding questions:',
        error
      );
    }
  }

  static async updateFeelingsAndNeedsSubquestions(data, collectionPath) {
    const userId = auth.currentUser.uid;

    try {
      const questionQuery = query(
        collection(db, collectionPath),
        where('questionId', '==', data.questionId)
      );

      const questionSnapshot = await getDocs(questionQuery);

      if (!questionSnapshot.empty) {
        const questionDoc = questionSnapshot.docs[0];
        const questionData = questionDoc.data();

        const subquestionIndex = questionData.subquestions.findIndex(
          (sub) => sub.id === data.subquestionId
        );

        if (subquestionIndex !== -1) {
          // Step 4: Update the subquestionText
          questionData.subquestions[subquestionIndex].subquestionText =
            data.text;

          // Step 5: Update the document in Firestore with the modified subquestions array
          await updateDoc(questionDoc.ref, {
            subquestions: questionData.subquestions,
          });

          console.log(
            `Subquestion text updated successfully for subquestionId: ${data.subquestionId}`
          );
        } else {
          console.log(`Subquestion with id ${data.subquestionId} not found.`);
        }
      } else {
        console.log(`No question found with questionId: ${questionId}`);
      }
    } catch (error) {
      console.error('Error updating subquestion text:', error);
    }
  }

  static async getUserAnswersFromAllCollections() {
    const currentUserUid = auth.currentUser?.uid;
    if (!currentUserUid) {
      throw new Error('User is not authenticated');
    }

    const feelingsAnswersData = await this.getAnswesfromFeelingandNeeds(
      'feelings-questions',
      'user-feelings-answers'
    );

    const needsAnswersData = await this.getAnswesfromFeelingandNeeds(
      'needs-questions',
      'user-needs-answers'
    );

    // Define the collections you want to query
    const collections = [
      'body-questions',
      'sos-questions',
      'knowledge-questions',
      'thoughts-questions',
    ];

    const allDocuments = [];

    for (let collectionName of collections) {
      const q = query(collection(db, collectionName));
      const querySnapshot = await getDocs(q);

      querySnapshot.forEach((doc) => {
        const data = doc.data();

        // Filter answers where the 'createdBy' matches the current user's UID
        const filteredAnswers = data.answers.filter(
          (answer) => answer.createdBy === currentUserUid
        );

        // console.log(
        //   filteredAnswers.length,
        //   collectionName,
        //   "all filtered answers length"
        // );

        // If there are any matching answers, add the document to the results
        if (filteredAnswers.length > 0) {
          allDocuments.push({
            ...data, // The original document data
            id: doc.id, // Document ID
            collection: collectionName, // The collection name for reference
            answers: filteredAnswers, // Only the answers that belong to the current user
          });
        }
      });
    }

    return [...allDocuments, ...feelingsAnswersData, ...needsAnswersData];
  }
}

export default DataService;
