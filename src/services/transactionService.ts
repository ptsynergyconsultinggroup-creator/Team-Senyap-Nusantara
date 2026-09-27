import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Transaction } from '../types';
import { initialTransactions } from '../data/mockData';
import { recordAuditLog } from './auditService';

const TRANSACTIONS_COLL = 'transactions';

/**
 * Real-time listener for Transactions (Public read)
 * Browser auto-seeding removed as per security guidelines.
 */
export function subscribeTransactions(
  onUpdate: (transactions: Transaction[]) => void,
  onError?: (err: unknown) => void
) {
  try {
    const collRef = collection(db, TRANSACTIONS_COLL);
    return onSnapshot(
      collRef,
      (snapshot) => {
        if (snapshot.empty) {
          // Fallback to local default data for display only, NO automatic writes
          onUpdate(initialTransactions);
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
        console.warn('Transactions Firestore listener fallback to initial list:', error);
        onUpdate(initialTransactions);
        if (onError) onError(error);
      }
    );
  } catch (error) {
    console.warn('Failed to subscribe transactions:', error);
    onUpdate(initialTransactions);
    return () => {};
  }
}

/**
 * Save new transaction (Admin only)
 */
export async function saveTransaction(transaction: Transaction): Promise<void> {
  const path = `${TRANSACTIONS_COLL}/${transaction.id}`;
  try {
    const docRef = doc(db, TRANSACTIONS_COLL, transaction.id);
    await setDoc(docRef, transaction);

    await recordAuditLog(
      'ADD_TRANSACTION',
      transaction.id,
      `Catatan kas ditambahkan: ${transaction.type.toUpperCase()} Rp ${transaction.amount.toLocaleString('id-ID')} (${transaction.category} - ${transaction.description})`
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Delete transaction (Admin only)
 */
export async function deleteTransaction(transactionId: string, desc?: string): Promise<void> {
  const path = `${TRANSACTIONS_COLL}/${transactionId}`;
  try {
    const docRef = doc(db, TRANSACTIONS_COLL, transactionId);
    await deleteDoc(docRef);

    await recordAuditLog(
      'DELETE_TRANSACTION',
      transactionId,
      `Penghapusan catatan kas ID: ${transactionId} ${desc ? `(${desc})` : ''}`
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
