import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Initialize Firebase App Check if reCAPTCHA key is configured
export let appCheck: ReturnType<typeof initializeAppCheck> | null = null;

if (typeof window !== 'undefined') {
  const recaptchaKey = firebaseConfig.recaptchaSiteKey || (import.meta as any).env?.VITE_RECAPTCHA_SITE_KEY;
  if (recaptchaKey && recaptchaKey.trim().length > 0) {
    try {
      // In development / preview, enable debug token if specified
      if (process.env.NODE_ENV !== 'production') {
        (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
      }
      appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(recaptchaKey),
        isTokenAutoRefreshEnabled: true,
      });
      console.log('Firebase App Check berhasil diinisialisasi.');
    } catch (appCheckErr) {
      console.warn('Firebase App Check initialization skipped/deferred:', appCheckErr);
    }
  } else {
    // Graceful notice: App Check is ready to activate once recaptchaSiteKey is provided in config
    console.info('Firebase App Check siap diaktifkan setelah reCAPTCHA v3 key ditambahkan di firebase-applet-config.json.');
  }
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test server connection on boot
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase connection test: client offline or initial setup.');
    }
  }
}
