import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Member, MemberPrivate } from '../types';
import { initialMembers } from '../data/mockData';
import { recordAuditLog } from './auditService';

const MEMBERS_COLL = 'members';

/**
 * Real-time listener for Members list (Public data)
 * Note: Browser auto-seeding removed as per security guidelines.
 */
export function subscribeMembers(
  onUpdate: (members: Member[]) => void,
  onError?: (err: unknown) => void
) {
  try {
    const collRef = collection(db, MEMBERS_COLL);
    return onSnapshot(
      collRef,
      (snapshot) => {
        if (snapshot.empty) {
          // Fallback to local initial roster for view only, NO database auto-writes
          onUpdate(initialMembers);
          return;
        }

        const list: Member[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as Member);
        });

        // Sort by status and ID
        list.sort((a, b) => {
          if (a.status === 'Menunggu Verifikasi' && b.status !== 'Menunggu Verifikasi') return -1;
          if (b.status === 'Menunggu Verifikasi' && a.status !== 'Menunggu Verifikasi') return 1;
          return a.id.localeCompare(b.id);
        });

        onUpdate(list);
      },
      (error) => {
        console.warn('Members Firestore listener fallback to initial roster:', error);
        onUpdate(initialMembers);
        if (onError) onError(error);
      }
    );
  } catch (error) {
    console.warn('Failed to subscribe members:', error);
    onUpdate(initialMembers);
    return () => {};
  }
}

/**
 * Fetch sensitive private details for a member (Admin restricted)
 */
export async function getMemberPrivateData(memberId: string): Promise<MemberPrivate | null> {
  const path = `${MEMBERS_COLL}/${memberId}/private/data`;
  try {
    const docRef = doc(db, MEMBERS_COLL, memberId, 'private', 'data');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as MemberPrivate;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

/**
 * Save new member registration
 * Separates public profile from private sensitive data (NIK, KTP, signature, phone, email)
 */
export async function saveMember(member: Member): Promise<void> {
  const publicPath = `${MEMBERS_COLL}/${member.id}`;
  const privatePath = `${MEMBERS_COLL}/${member.id}/private/data`;

  // Extract public fields
  const publicData: Member = {
    id: member.id,
    name: member.name,
    division: member.division,
    membershipType: member.membershipType,
    region: member.region,
    joinDate: member.joinDate,
    status: member.status || 'Menunggu Verifikasi',
    photoUrl: member.photoUrl,
    verifiedBy: member.verifiedBy,
    verifiedAt: member.verifiedAt,
  };

  // Extract sensitive private fields
  const privateData: MemberPrivate = {
    nik: member.nik,
    phone: member.phone,
    email: member.email,
    address: member.address,
    ktpUrl: member.ktpUrl,
    signatureUrl: member.signatureUrl,
    reason: member.reason,
    updatedAt: new Date().toISOString(),
  };

  try {
    // 1. Save public record
    const publicDocRef = doc(db, MEMBERS_COLL, member.id);
    await setDoc(publicDocRef, {
      ...publicData,
      createdAt: new Date().toISOString(),
    });

    // 2. Save private record in secured subcollection
    const privateDocRef = doc(db, MEMBERS_COLL, member.id, 'private', 'data');
    await setDoc(privateDocRef, privateData);

    await recordAuditLog(
      'UPDATE_MEMBER',
      member.id,
      `Pendaftaran anggota baru diajukan: ${member.name} (${member.id})`
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, publicPath);
  }
}

/**
 * Update member status or details (Admin only)
 */
export async function updateMember(member: Member): Promise<void> {
  const publicPath = `${MEMBERS_COLL}/${member.id}`;
  try {
    const publicDocRef = doc(db, MEMBERS_COLL, member.id);
    const publicPayload: Partial<Member> = {
      name: member.name,
      division: member.division,
      membershipType: member.membershipType,
      region: member.region,
      joinDate: member.joinDate,
      status: member.status,
      photoUrl: member.photoUrl,
      verifiedBy: member.verifiedBy,
      verifiedAt: member.verifiedAt,
    };

    await setDoc(publicDocRef, publicPayload, { merge: true });

    // If private fields are present in the update object, update the private subcollection
    if (member.nik || member.phone || member.email || member.address || member.ktpUrl || member.signatureUrl) {
      const privateDocRef = doc(db, MEMBERS_COLL, member.id, 'private', 'data');
      await setDoc(
        privateDocRef,
        {
          nik: member.nik,
          phone: member.phone,
          email: member.email,
          address: member.address,
          ktpUrl: member.ktpUrl,
          signatureUrl: member.signatureUrl,
          reason: member.reason,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }

    const actionType = member.status === 'Aktif' || member.status === 'Terverifikasi'
      ? 'VERIFY_MEMBER'
      : 'UPDATE_MEMBER';

    await recordAuditLog(
      actionType,
      member.id,
      `Pembaruan data anggota: ${member.name} (${member.id}) - Status: ${member.status}`
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, publicPath);
  }
}

/**
 * Delete member from Firestore (Admin only)
 */
export async function deleteMember(memberId: string, memberName?: string): Promise<void> {
  const path = `${MEMBERS_COLL}/${memberId}`;
  try {
    const publicDocRef = doc(db, MEMBERS_COLL, memberId);
    const privateDocRef = doc(db, MEMBERS_COLL, memberId, 'private', 'data');

    await deleteDoc(privateDocRef).catch(() => {});
    await deleteDoc(publicDocRef);

    await recordAuditLog(
      'DELETE_MEMBER',
      memberId,
      `Penghapusan data anggota: ${memberName || memberId}`
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
