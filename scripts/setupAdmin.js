import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDocs, collection, query, where, getFirestore } from "firebase/firestore";
import { auth, db } from "../firebase";

const setupAdmin = async () => {
  const adminEmail = "abc@gmail.com";
  const adminPassword = "abc@123";

  try {
    console.log('Checking for existing admin...');
    const adminQuery = query(collection(db, 'users'), where('isAdmin', '==', true));
    const adminSnapshot = await getDocs(adminQuery);
    
    if (!adminSnapshot.empty) {
      console.log('Admin account already exists');
      return;
    }

    console.log('No admin found, creating new admin...');
    
    // Create admin authentication
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      adminEmail,
      adminPassword
    );

    console.log('Admin auth created with UID:', userCredential.user.uid);

    // Create admin document
    const adminData = {
      email: adminEmail,
      firstName: 'Admin',
      lastName: 'User',
      isAdmin: true,
      userType: 'admin',
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      profile: {
        role: 'administrator',
        phone: '',
        gender: '',
        joinDate: new Date().toISOString()
      }
    };

    // Try alternative way to get Firestore instance
    const firestore = getFirestore();
    const userDocRef = doc(firestore, 'users', userCredential.user.uid);
    
    try {
      await setDoc(userDocRef, adminData, { merge: true });
      console.log('Admin document created successfully at:', userDocRef.path);
    } catch (docError) {
      console.error('Error creating admin document:', docError);
      // Try alternative approach
      await setDoc(doc(db, 'users', userCredential.user.uid), adminData, { merge: true });
      console.log('Admin document created using alternative method');
    }

    // Verify document creation
    const verifyDoc = await getDocs(query(
      collection(db, 'users'),
      where('email', '==', adminEmail)
    ));

    if (verifyDoc.empty) {
      throw new Error('Admin document creation failed verification');
    }

    console.log('Admin setup completed successfully');
    return userCredential.user;

  } catch (error) {
    console.error('Setup Admin Error:', error);
    if (error.code === 'auth/email-already-in-use') {
      console.log('Admin email already exists, attempting to update document...');
      try {
        // Try to create/update document for existing auth
        const existingUsers = await getDocs(query(
          collection(db, 'users'),
          where('email', '==', adminEmail)
        ));
        
        if (existingUsers.empty) {
          const adminData = {
            email: adminEmail,
            firstName: 'Admin',
            lastName: 'User',
            isAdmin: true,
            userType: 'admin',
            createdAt: new Date().toISOString(),
            lastActive: new Date().toISOString(),
            profile: {
              role: 'administrator',
              phone: '',
              gender: '',
              joinDate: new Date().toISOString()
            }
          };
          
          await setDoc(doc(db, 'users', auth.currentUser.uid), adminData, { merge: true });
          console.log('Created document for existing admin auth');
        }
      } catch (docError) {
        console.error('Error updating existing admin:', docError);
      }
    } else {
      console.error('Error creating admin:', error);
      throw error;
    }
  }
};

export default setupAdmin; 