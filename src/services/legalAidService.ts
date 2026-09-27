import {
  collection,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { LegalAidCase } from '../types';
import { initialLegalAidCases } from '../data/mockData';
import { recordAuditLog } from './auditService';

const LEGAL_AID_COLL = 'legalAidCases';

/**
 * Save Legal Aid Case (Public submission)
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
 * Get single Legal Aid Case by ticket number (Public self-check)
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
 * Real-time listener for Legal Aid Cases (Admin only)
 */
export function subscribeLegalAidCases(
  onUpdate: (cases: LegalAidCase[]) => void,
  onError?: (err: unknown) => void
) {
  try {
    const collRef = collection(db, LEGAL_AID_COLL);
    const q = query(collRef, orderBy('submittedAt', 'desc'));
    return onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          onUpdate(initialLegalAidCases);
          return;
        }
        const list: LegalAidCase[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as LegalAidCase);
        });
        onUpdate(list);
      },
      (error) => {
        console.warn('Legal aid Firestore fallback:', error);
        onUpdate(initialLegalAidCases);
        if (onError) onError(error);
      }
    );
  } catch (error) {
    console.warn('Failed to subscribe to legal aid cases:', error);
    onUpdate(initialLegalAidCases);
    return () => {};
  }
}

/**
 * Update case status (Admin only)
 */
export async function updateLegalAidCaseStatus(
  ticketNumber: string,
  status: LegalAidCase['status']
): Promise<void> {
  const path = `${LEGAL_AID_COLL}/${ticketNumber}`;
  try {
    const docRef = doc(db, LEGAL_AID_COLL, ticketNumber);
    await setDoc(docRef, { status }, { merge: true });

    await recordAuditLog(
      'UPDATE_LEGAL_AID',
      ticketNumber,
      `Status penanganan kasus hukum #${ticketNumber} diperbarui menjadi: ${status}`
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
