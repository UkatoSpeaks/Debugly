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
  updateDoc,
  limit,
  startAfter,
  QueryDocumentSnapshot
} from "firebase/firestore";
import { db } from "./firebase";

export interface AnalysisComment {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  content: string;
  createdAt: any;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  createdAt: any;
}

export interface FileBuffer {
  id: string;
  name: string;
  content: string;
  isMainError?: boolean;
}

export interface AnalysisRecord {
  id?: string;
  userId: string;
  title: string;
  framework: string;
  language: string;
  originalError: string; // Maintain for legacy/simplicity
  context?: FileBuffer[]; // New multi-file context
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
  messages?: ChatMessage[];
  modelId?: string; // Track which model was used
  createdAt: any;
}

export const addAnalysisMessage = async (analysisId: string, message: Omit<ChatMessage, "createdAt">) => {
  try {
    const docRef = doc(db, "analyses", analysisId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) throw new Error("Analysis not found");
    
    const data = docSnap.data();
    const currentMessages = data.messages || [];
    
    await updateDoc(docRef, {
      messages: [...currentMessages, { ...message, createdAt: new Date() }]
    });
  } catch (error) {
    console.error("Error adding message to analysis:", error);
    throw error;
  }
};

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
    const data = querySnapshot.docs.map((d: any) => ({
      id: d.id,
      ...d.data()
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

export const getUserAnalysesPaginated = async (
  userId: string, 
  pageSize: number = 10, 
  lastVisibleDoc: QueryDocumentSnapshot | null = null,
  framework: string = "All"
) => {
  try {
    let constraints: any[] = [
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(pageSize)
    ];

    if (framework !== "All") {
      constraints.push(where("framework", "==", framework));
    }

    if (lastVisibleDoc) {
      constraints.push(startAfter(lastVisibleDoc));
    }

    const q = query(collection(db, "analyses"), ...constraints);
    const querySnapshot = await getDocs(q);
    const lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null;
    
    const data = querySnapshot.docs.map((d: any) => ({
      id: d.id,
      ...d.data()
    })) as AnalysisRecord[];

    return { data, lastVisible };
  } catch (error) {
    console.error("Error fetching paginated analyses:", error);
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

export const addAnalysisComment = async (analysisId: string, comment: Omit<AnalysisComment, "id" | "createdAt">) => {
  try {
    const commentRef = await addDoc(collection(db, "analyses", analysisId, "comments"), {
      ...comment,
      createdAt: serverTimestamp()
    });
    return commentRef.id;
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
};

export const getAnalysisComments = async (analysisId: string) => {
  try {
    const q = query(
      collection(db, "analyses", analysisId, "comments"),
      orderBy("createdAt", "asc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((d: any) => ({ id: d.id, ...d.data() } as AnalysisComment));
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }
};
