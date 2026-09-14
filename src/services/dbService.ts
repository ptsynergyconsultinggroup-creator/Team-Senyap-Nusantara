import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  getDoc,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Member, Transaction, LegalAidCase, SiteConfig } from '../types';
import { initialMembers, initialTransactions, initialSiteConfig } from '../data/mockData';

const MEMBERS_COLL = 'members';
const TRANSACTIONS_COLL = 'transactions';
const LEGAL_AID_COLL = 'legalAidCases';
const SETTINGS_COLL = 'settings';

/**
 * Real-time listener for Members
 */
export function subscribeMembers(
  onUpdate: (members: Member[]) => void,
  onError?: (err: unknown) => void
) {
  try {
    const collRef = collection(db, MEMBERS_COLL);
    return onSnapshot(
      collRef,
      async (snapshot) => {
        if (snapshot.empty) {
          // Auto-seed initial members to Firestore so database starts ready
          try {
            const batch = writeBatch(db);
            initialMembers.forEach((m) => {
              const docRef = doc(db, MEMBERS_COLL, m.id);
              batch.set(docRef, m);
            });
            await batch.commit();
            onUpdate(initialMembers);
          } catch (seedErr) {
            console.warn('Initial seed skipped, using local defaults:', seedErr);
            onUpdate(initialMembers);
          }
          return;
        }

        const list: Member[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as Member);
        });

        // Sort by id or status
        list.sort((a, b) => {
          if (a.status === 'Menunggu Verifikasi' && b.status !== 'Menunggu Verifikasi') return -1;
          if (b.status === 'Menunggu Verifikasi' && a.status !== 'Menunggu Verifikasi') return 1;
          return a.id.localeCompare(b.id);
        });

        onUpdate(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, MEMBERS_COLL);
        if (onError) onError(error);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, MEMBERS_COLL);
    return () => {};
  }
}

/**
 * Save new member to Firestore
 */
export async function saveMember(member: Member): Promise<void> {
  const path = `${MEMBERS_COLL}/${member.id}`;
  try {
    const docRef = doc(db, MEMBERS_COLL, member.id);
    await setDoc(docRef, {
      ...member,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Update member in Firestore
 */
export async function updateMember(member: Member): Promise<void> {
  const path = `${MEMBERS_COLL}/${member.id}`;
  try {
    const docRef = doc(db, MEMBERS_COLL, member.id);
    await setDoc(docRef, member, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Delete member from Firestore
 */
export async function deleteMember(memberId: string): Promise<void> {
  const path = `${MEMBERS_COLL}/${memberId}`;
  try {
    const docRef = doc(db, MEMBERS_COLL, memberId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Real-time listener for Transactions (Kas)
 */
export function subscribeTransactions(
  onUpdate: (transactions: Transaction[]) => void,
  onError?: (err: unknown) => void
) {
  try {
    const collRef = collection(db, TRANSACTIONS_COLL);
    return onSnapshot(
      collRef,
      async (snapshot) => {
        if (snapshot.empty) {
          // Auto-seed initial transactions
          try {
            const batch = writeBatch(db);
            initialTransactions.forEach((t) => {
              const docRef = doc(db, TRANSACTIONS_COLL, t.id);
              batch.set(docRef, t);
            });
            await batch.commit();
            onUpdate(initialTransactions);
          } catch (seedErr) {
            console.warn('Initial trx seed skipped:', seedErr);
            onUpdate(initialTransactions);
          }
          return;
        }

        const list: Transaction[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as Transaction);
        });

        // Sort descending by date
        list.sort((a, b) => b.date.localeCompare(a.date));
        onUpdate(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, TRANSACTIONS_COLL);
        if (onError) onError(error);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, TRANSACTIONS_COLL);
    return () => {};
  }
}

/**
 * Save new transaction
 */
export async function saveTransaction(transaction: Transaction): Promise<void> {
  const path = `${TRANSACTIONS_COLL}/${transaction.id}`;
  try {
    const docRef = doc(db, TRANSACTIONS_COLL, transaction.id);
    await setDoc(docRef, transaction);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Delete transaction
 */
export async function deleteTransaction(transactionId: string): Promise<void> {
  const path = `${TRANSACTIONS_COLL}/${transactionId}`;
  try {
    const docRef = doc(db, TRANSACTIONS_COLL, transactionId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Save Legal Aid Case
 */
export async function saveLegalAidCase(legalCase: LegalAidCase): Promise<void> {
  const path = `${LEGAL_AID_COLL}/${legalCase.ticketNumber}`;
  try {
    const docRef = doc(db, LEGAL_AID_COLL, legalCase.ticketNumber);
    await setDoc(docRef, legalCase);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Get single Legal Aid Case by ticket number
 */
export async function getLegalAidCase(ticketNumber: string): Promise<LegalAidCase | null> {
  const cleanTicket = ticketNumber.trim();
  const path = `${LEGAL_AID_COLL}/${cleanTicket}`;
  try {
    const docRef = doc(db, LEGAL_AID_COLL, cleanTicket);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as LegalAidCase;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

/**
 * Real-time listener for Site Config
 */
export function subscribeSiteConfig(
  onUpdate: (config: SiteConfig) => void
) {
  try {
    const docRef = doc(db, SETTINGS_COLL, 'main');
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          onUpdate(snapshot.data() as SiteConfig);
        }
      },
      (error) => {
        console.warn('Config snapshot listener:', error);
      }
    );
  } catch (err) {
    console.warn('Site config subscribe err:', err);
    return () => {};
  }
}

/**
 * Save Site Config
 */
export async function saveSiteConfig(config: SiteConfig): Promise<void> {
  const path = `${SETTINGS_COLL}/main`;
  try {
    const docRef = doc(db, SETTINGS_COLL, 'main');
    await setDoc(docRef, config, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
