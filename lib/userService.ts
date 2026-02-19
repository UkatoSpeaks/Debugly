import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  deleteDoc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase";
import { v4 as uuidv4 } from 'uuid';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  apiToken?: string;
  preferredKeys?: {
    gemini?: string;
    groq?: string;
  };
  createdAt: any;
}

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

export const generateApiToken = async (uid: string): Promise<string> => {
  try {
    const newToken = `dbly_${uuidv4().replace(/-/g, '')}`;
    const docRef = doc(db, "users", uid);
    const tokenDocRef = doc(db, "api_tokens", newToken);
    
    // Update user profile
    await updateDoc(docRef, {
      apiToken: newToken
    });

    // Create reverse mapping for fast lookup
    await setDoc(tokenDocRef, {
      userId: uid,
      createdAt: serverTimestamp()
    });
    
    return newToken;
  } catch (error) {
    console.error("Error generating API token:", error);
    throw error;
  }
};

export const revokeApiToken = async (uid: string, currentToken: string): Promise<void> => {
  try {
    const docRef = doc(db, "users", uid);
    const tokenDocRef = doc(db, "api_tokens", currentToken);
    
    await updateDoc(docRef, {
      apiToken: null
    });

    await deleteDoc(tokenDocRef);
  } catch (error) {
    console.error("Error revoking API token:", error);
    throw error;
  }
};

export const updatePreferredKeys = async (uid: string, keys: { gemini?: string; groq?: string }): Promise<void> => {
  try {
    const docRef = doc(db, "users", uid);
    await updateDoc(docRef, {
      preferredKeys: keys
    });
  } catch (error) {
    console.error("Error updating preferred keys:", error);
    throw error;
  }
};

export const getUserByToken = async (token: string): Promise<UserProfile | null> => {
  try {
    // Note: For production, we'd use a separate collection or a search index
    // For now, we'll assume a direct lookup if we had a dedicated token collection
    // but in Firestore, we usually use a 'tokens' collection where doc ID is the token.
    const tokenDocRef = doc(db, "api_tokens", token);
    const tokenSnap = await getDoc(tokenDocRef);
    
    if (tokenSnap.exists()) {
      const { userId } = tokenSnap.data();
      return getUserProfile(userId);
    }
    return null;
  } catch (error) {
    console.error("Error looking up user by token:", error);
    throw error;
  }
};
