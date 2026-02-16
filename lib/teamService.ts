import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
  setDoc,
  deleteDoc,
  orderBy
} from "firebase/firestore";
import { db } from "./firebase";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  createdAt: any;
}

export interface TeamMember {
  uid: string;
  email: string;
  role: 'admin' | 'member';
  joinedAt: any;
}

export interface DebugCluster {
  id: string;
  orgId: string;
  name: string;
  description: string;
  isPublic: boolean; // accessible to anyone in the org
  createdAt: any;
}

export interface Invitation {
  id: string;
  orgId: string;
  orgName: string;
  email: string;
  role: 'admin' | 'member';
  invitedBy: string;
  status: 'pending' | 'accepted' | 'revoked';
  createdAt: any;
}

export const createOrganization = async (ownerId: string, name: string) => {
  try {
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const orgRef = await addDoc(collection(db, "organizations"), {
      name,
      slug,
      ownerId,
      createdAt: serverTimestamp()
    });

    // Add owner as the first admin member
    await setDoc(doc(db, "organizations", orgRef.id, "members", ownerId), {
      uid: ownerId,
      role: 'admin',
      joinedAt: serverTimestamp()
    });

    // Create a global membership record for lookup
    await addDoc(collection(db, "memberships"), {
      uid: ownerId,
      orgId: orgRef.id,
      orgName: name,
      role: 'admin',
      joinedAt: serverTimestamp()
    });

    return orgRef.id;
  } catch (error) {
    console.error("Error creating organization:", error);
    throw error;
  }
};

export const inviteMember = async (orgId: string, orgName: string, email: string, role: 'admin' | 'member', invitedBy: string) => {
  try {
    const inviteRef = await addDoc(collection(db, "invitations"), {
      orgId,
      orgName,
      email,
      role,
      invitedBy,
      status: 'pending',
      createdAt: serverTimestamp()
    });
    return inviteRef.id;
  } catch (error) {
    console.error("Error inviting member:", error);
    throw error;
  }
};

export const acceptInvitation = async (invitationId: string, userId: string) => {
  try {
    const inviteRef = doc(db, "invitations", invitationId);
    const inviteSnap = await getDoc(inviteRef);

    if (!inviteSnap.exists()) throw new Error("Invitation not found");
    const inviteData = inviteSnap.data() as Invitation;

    if (inviteData.status !== 'pending') throw new Error("Invitation is no longer valid");

    // 1. Update invitation status
    await updateDoc(inviteRef, {
      status: 'accepted',
      acceptedAt: serverTimestamp()
    });

    // 2. Add to org members
    await setDoc(doc(db, "organizations", inviteData.orgId, "members", userId), {
      uid: userId,
      role: inviteData.role,
      joinedAt: serverTimestamp()
    });

    // 3. Add to global memberships for fast lookup
    await addDoc(collection(db, "memberships"), {
      uid: userId,
      orgId: inviteData.orgId,
      orgName: inviteData.orgName,
      role: inviteData.role,
      joinedAt: serverTimestamp()
    });

    return inviteData.orgId;
  } catch (error) {
    console.error("Error accepting invitation:", error);
    throw error;
  }
};

export const getUserOrganizations = async (userId: string) => {
  try {
    const q = query(
      collection(db, "memberships"), 
      where("uid", "==", userId),
      orderBy("joinedAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((d: any) => ({
      ...d.data(),
      id: d.id
    }));
  } catch (error) {
    console.error("Error fetching user organizations:", error);
    // If it's an index error, Firestore usually provides a link in the console
    return [];
  }
};

export const getOrgInvitations = async (orgId: string) => {
  try {
    const q = query(collection(db, "invitations"), where("orgId", "==", orgId), where("status", "==", "pending"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((d: any) => ({ id: d.id, ...d.data() } as Invitation));
  } catch (error) {
    console.error("Error fetching org invitations:", error);
    throw error;
  }
};

export const getOrgClusters = async (orgId: string) => {
  try {
    const q = query(collection(db, "clusters"), where("orgId", "==", orgId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((d: any) => ({ id: d.id, ...d.data() } as DebugCluster));
  } catch (error) {
    console.error("Error fetching org clusters:", error);
    throw error;
  }
};

export const createDebugCluster = async (orgId: string, name: string, description: string) => {
  try {
    const clusterRef = await addDoc(collection(db, "clusters"), {
      orgId,
      name,
      description,
      isPublic: true,
      createdAt: serverTimestamp()
    });
    return clusterRef.id;
  } catch (error) {
    console.error("Error creating debug cluster:", error);
    throw error;
  }
};
