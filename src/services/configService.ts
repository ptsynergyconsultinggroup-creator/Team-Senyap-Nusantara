import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { SiteConfig } from '../types';
import { initialSiteConfig } from '../data/mockData';
import { recordAuditLog } from './auditService';

const SETTINGS_COLL = 'settings';

/**
 * Real-time listener for Site Config
 */
export function subscribeSiteConfig(onUpdate: (config: SiteConfig) => void) {
  try {
    const docRef = doc(db, SETTINGS_COLL, 'main');
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          onUpdate(snapshot.data() as SiteConfig);
        } else {
          onUpdate(initialSiteConfig);
        }
      },
      (error) => {
        console.warn('Config snapshot listener fallback to initialSiteConfig:', error);
        onUpdate(initialSiteConfig);
      }
    );
  } catch (err) {
    console.warn('Site config subscribe err:', err);
    onUpdate(initialSiteConfig);
    return () => {};
  }
}

/**
 * Save Site Config (Admin only)
 */
export async function saveSiteConfig(config: SiteConfig): Promise<void> {
  const path = `${SETTINGS_COLL}/main`;
  try {
    const docRef = doc(db, SETTINGS_COLL, 'main');
    await setDoc(docRef, config, { merge: true });

    await recordAuditLog(
      'UPDATE_CONFIG',
      'settings-main',
      'Pengaturan identitas dan profil organisasi diperbarui'
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}
