import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { AuditLog } from '../types';

const AUDIT_COLL = 'auditLogs';

/**
 * Record an audit log entry for admin activities
 */
export async function recordAuditLog(
  action: AuditLog['action'],
  targetId: string,
  details: string
): Promise<void> {
  const user = auth.currentUser;
  const adminEmail = user?.email || 'admin@teamsenyapnusantara.org';
  const adminUid = user?.uid || 'system';
  const logId = `AUDIT-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const timestamp = new Date().toISOString();

  const logEntry: AuditLog = {
    id: logId,
    timestamp,
    adminEmail,
    adminUid,
    action,
    targetId,
    details,
  };

  try {
    const docRef = doc(db, AUDIT_COLL, logId);
    await setDoc(docRef, logEntry);
  } catch (error) {
    console.warn('Gagal mencatat audit trail ke Firestore (mungkin izin terbatas):', error);
  }
}

/**
 * Subscribe to recent audit logs (Admin only)
 */
export function subscribeAuditLogs(
  onUpdate: (logs: AuditLog[]) => void,
  onError?: (err: unknown) => void
): () => void {
  // Only authenticated admins should query audit logs
  if (!auth.currentUser) {
    onUpdate([]);
    return () => {};
  }

  try {
    const collRef = collection(db, AUDIT_COLL);
    const q = query(collRef, orderBy('timestamp', 'desc'), limit(100));

    return onSnapshot(
      q,
      (snapshot) => {
        const list: AuditLog[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as AuditLog);
        });
        onUpdate(list);
      },
      (error) => {
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.LIST, AUDIT_COLL);
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, AUDIT_COLL);
    return () => {};
  }
}
