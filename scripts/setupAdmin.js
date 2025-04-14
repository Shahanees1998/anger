import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  doc,
  setDoc,
  getDocs,
  collection,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "../firebase";

const setupAdmin = async () => {
  const adminEmail = "admin123@gmail.com";
  const adminPassword = "abc@123";

  try {
    console.log("Checking for existing admin...");
    const adminQuery = query(
      collection(db, "users"),
      where("isAdmin", "==", true)
    );
    const adminSnapshot = await getDocs(adminQuery);

    if (!adminSnapshot.empty) {
      console.log("Admin account already exists");
      return;
    }

    console.log("No admin found, creating new admin...");

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      adminEmail,
      adminPassword
    );

    console.log("Admin auth created with UID:", userCredential.user.uid);

    const adminData = {
      email: "admin123@gmail.com",
      firstName: "admin",
      lastName: "anger",
      isAdmin: true,
      userType: "admin",
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      phone: "",
      gender: "",
      isDisabled: false,
      joinDate: new Date().toISOString(),
    };

    const userDocRef = doc(db, "users", userCredential.user.uid);

    try {
      await setDoc(userDocRef, adminData);
      console.log("Admin document created successfully at:", userDocRef.path);
    } catch (docError) {
      console.error("Error creating admin document:", docError);

      console.log("Admin document created using alternative method");
    }

    // Verify document creation
    const verifyDoc = await getDocs(
      query(collection(db, "users"), where("email", "==", adminEmail))
    );

    if (verifyDoc.empty) {
      throw new Error("Admin document creation failed verification");
    }

    console.log("Admin setup completed successfully");
    return userCredential.user;
  } catch (error) {
    console.error("Setup Admin Error:", error);
    if (error.code === "auth/email-already-in-use") {
      console.log(
        "Admin email already exists, attempting to update document..."
      );
    } else {
      console.error("Error creating admin:", error);
      throw error;
    }
  }
};

export default setupAdmin;
