import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  serverTimestamp,
  doc,
  getDoc,
  deleteDoc,
  updateDoc
} from "firebase/firestore";
import { db } from "./firebase";

export interface AnalysisRecord {
  id?: string;
  userId: string;
  title: string;
  framework: string;
  language: string;
  originalError: string;
  whatBroke: string;
  whyHappened: string;
  fixSteps: { id: string; text: string }[];
  codePatch: {
    comment: string;
    code: string;
  };
  prevention: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  status: "Resolved" | "Pinned";
  createdAt: any;
}

export const saveAnalysis = async (analysis: Omit<AnalysisRecord, "id" | "createdAt" | "status">) => {
  try {
    const docRef = await addDoc(collection(db, "analyses"), {
      ...analysis,
      status: "Resolved",
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving analysis:", error);
    throw error;
  }
};

export const getUserAnalyses = async (userId: string) => {
  try {
    const q = query(
      collection(db, "analyses"),
      where("userId", "==", userId)
    );
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AnalysisRecord[];

    // Sort in-memory to avoid mandatory composite index requirements for where + orderBy
    return data.sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });
  } catch (error) {
    console.error("Error fetching analyses:", error);
    throw error;
  }
};

export const getAnalysisById = async (id: string) => {
  try {
    const docRef = doc(db, "analyses", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as AnalysisRecord;
    }
    return null;
  } catch (error) {
    console.error("Error fetching analysis by ID:", error);
    throw error;
  }
};

export const deleteAnalysis = async (id: string) => {
  try {
    await deleteDoc(doc(db, "analyses", id));
  } catch (error) {
    console.error("Error deleting analysis:", error);
    throw error;
  }
};

export const updateAnalysisStatus = async (id: string, status: "Resolved" | "Pinned") => {
  try {
    const docRef = doc(db, "analyses", id);
    await updateDoc(docRef, { status });
  } catch (error) {
    console.error("Error updating analysis status:", error);
    throw error;
  }
};

export const getUserStats = async (userId: string) => {
  try {
    const q = query(collection(db, "analyses"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return {
      totalFixes: querySnapshot.size,
      timeSaved: querySnapshot.size * 5 // Rough estimate: 5 mins saved per fix
    };
  } catch (error) {
    console.error("Error fetching user stats:", error);
    throw error;
  }
};
