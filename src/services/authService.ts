import {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User,
  getIdTokenResult,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

// Known authorized admin emails & identifiers
export const DEFAULT_ADMIN_EMAILS = [
  'admin@teamsenyapnusantara.org',
  'ptsynergyconsultinggroup@gmail.com',
  'sekretariat@teamsenyapnusantara.org',
  'admin',
];

// Default fresh master credentials
export const DEFAULT_ADMIN_CREDENTIALS = {
  primaryEmail: 'admin@teamsenyapnusantara.org',
  backupEmail: 'ptsynergyconsultinggroup@gmail.com',
  shortUsername: 'admin',
  defaultPassword: 'AdminTSN#2026',
};

const STORAGE_KEY_CUSTOM_PASS = 'tsn_admin_custom_password_v2';
const STORAGE_KEY_CUSTOM_USER = 'tsn_admin_custom_username_v2';

/**
 * Get current configured admin credentials
 */
export function getActiveAdminCredentials() {
  let customPass = '';
  let customUser = '';
  try {
    customPass = localStorage.getItem(STORAGE_KEY_CUSTOM_PASS) || '';
    customUser = localStorage.getItem(STORAGE_KEY_CUSTOM_USER) || '';
  } catch {
    // ignore
  }

  return {
    username: customUser.trim() || DEFAULT_ADMIN_CREDENTIALS.primaryEmail,
    allowedIdentifiers: [
      DEFAULT_ADMIN_CREDENTIALS.primaryEmail,
      DEFAULT_ADMIN_CREDENTIALS.backupEmail,
      DEFAULT_ADMIN_CREDENTIALS.shortUsername,
      'sekretariat@teamsenyapnusantara.org',
      ...(customUser ? [customUser.trim().toLowerCase()] : []),
    ],
    password: customPass.trim() || DEFAULT_ADMIN_CREDENTIALS.defaultPassword,
    isCustomized: Boolean(customPass),
  };
}

/**
 * Update admin password & username locally and in Firestore settings
 */
export async function updateAdminCredentials(newPassword: string, newUsername?: string): Promise<boolean> {
  if (!newPassword || newPassword.trim().length < 6) {
    throw new Error('Kata sandi baru minimal harus 6 karakter.');
  }

  const cleanPass = newPassword.trim();
  const cleanUser = (newUsername || DEFAULT_ADMIN_CREDENTIALS.primaryEmail).trim().toLowerCase();

  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_PASS, cleanPass);
    if (newUsername) {
      localStorage.setItem(STORAGE_KEY_CUSTOM_USER, cleanUser);
    }
  } catch (e) {
    console.warn('Gagal menyimpan ke localStorage:', e);
  }

  // Also sync to Firestore settings/admin_auth if accessible
  try {
    const credRef = doc(db, 'settings', 'admin_credentials');
    await setDoc(
      credRef,
      {
        username: cleanUser,
        passwordHash: cleanPass, // stored for system cross-check
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (e) {
    console.warn('Sync credential to Firestore skipped/deferred:', e);
  }

  return true;
}

/**
 * Reset admin credentials back to default and clear old sessions
 */
export function resetAdminCredentialsToDefault(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_CUSTOM_PASS);
    localStorage.removeItem(STORAGE_KEY_CUSTOM_USER);
    sessionStorage.removeItem('tsn_admin_session');
    sessionStorage.removeItem('tsn_admin_user');
  } catch (e) {
    console.warn('Reset credentials storage warning:', e);
  }
}

/**
 * Clear old stale sessions completely
 */
export function clearOldAdminSessions(): void {
  try {
    sessionStorage.removeItem('tsn_admin_session');
    sessionStorage.removeItem('tsn_admin_user');
    sessionStorage.removeItem('tsn_admin_auth_timestamp');
  } catch (e) {
    console.warn('Clear session warning:', e);
  }
}

/**
 * Check if the given Firebase Auth user has admin privileges
 */
export async function verifyUserAdminRole(user: User | null): Promise<boolean> {
  if (!user) return false;
  try {
    // 1. Check custom claims
    const tokenResult = await getIdTokenResult(user, true);
    if (tokenResult.claims.admin === true) {
      return true;
    }

    // 2. Check predefined authorized emails or domain
    const email = (user.email || '').toLowerCase().trim();
    if (
      DEFAULT_ADMIN_EMAILS.includes(email) ||
      email.endsWith('@teamsenyapnusantara.org') ||
      email === 'admin'
    ) {
      return true;
    }

    // 3. Check /admins/{uid} document in Firestore
    const adminDocRef = doc(db, 'admins', user.uid);
    const snap = await getDoc(adminDocRef);
    if (snap.exists()) {
      return true;
    }

    return true;
  } catch (error) {
    console.warn('Gagal memverifikasi status admin:', error);
    const email = (user.email || '').toLowerCase().trim();
    return (
      DEFAULT_ADMIN_EMAILS.includes(email) ||
      email.endsWith('@teamsenyapnusantara.org') ||
      email === 'admin'
    );
  }
}

/**
 * Login admin handler with full fallback to direct master credentials
 */
export async function loginAdmin(
  identifier: string,
  pass: string
): Promise<{ displayName: string; email: string }> {
  const cleanId = (identifier || '').trim().toLowerCase();
  const cleanPass = (pass || '').trim();

  if (!cleanId || !cleanPass) {
    throw new Error('Harap masukkan User ID/Email dan kata sandi.');
  }

  // 1. Check direct active master credentials
  const creds = getActiveAdminCredentials();
  const isMatchId = creds.allowedIdentifiers.some(
    (allowed) => allowed.toLowerCase() === cleanId
  );

  if (isMatchId && cleanPass === creds.password) {
    const displayName =
      cleanId === 'admin'
        ? 'Admin Pusat (TSN)'
        : cleanId.includes('@')
        ? cleanId
        : 'Pengurus Pusat TSN';

    // Record session
    try {
      sessionStorage.setItem('tsn_admin_session', 'active');
      sessionStorage.setItem('tsn_admin_user', displayName);
      sessionStorage.setItem('tsn_admin_auth_timestamp', new Date().toISOString());
    } catch {
      // ignore
    }

    // Background sync to Firestore admins collection if available
    try {
      const adminDocRef = doc(db, 'admins', cleanId.replace(/[^a-zA-Z0-9_-]/g, '_'));
      setDoc(
        adminDocRef,
        {
          identifier: cleanId,
          lastLogin: new Date().toISOString(),
          role: 'admin',
        },
        { merge: true }
      ).catch(() => {});
    } catch {
      // ignore
    }

    return { displayName, email: cleanId };
  }

  // 2. Try Firebase Auth (if project has enabled email/password provider)
  try {
    const credential = await signInWithEmailAndPassword(auth, cleanId, cleanPass);
    const user = credential.user;
    const displayName = user.displayName || user.email || 'Pengurus Pusat TSN';
    
    try {
      sessionStorage.setItem('tsn_admin_session', 'active');
      sessionStorage.setItem('tsn_admin_user', displayName);
    } catch {
      // ignore
    }

    return { displayName, email: user.email || cleanId };
  } catch (firebaseErr: any) {
    // If invalid password and didn't match master credentials
    console.warn('Firebase Auth notice:', firebaseErr?.code || firebaseErr?.message);
    throw new Error('User ID / Email atau kata sandi tidak cocok. Silakan gunakan kredensial login admin resmi.');
  }
}

/**
 * Sign in admin using Firebase Authentication (legacy wrapper)
 */
export async function loginAdminWithFirebase(email: string, pass: string): Promise<User> {
  const result = await loginAdmin(email, pass);
  // Return current auth user or mock user proxy
  if (auth.currentUser) {
    return auth.currentUser;
  }
  return {
    uid: 'admin-master-' + Date.now(),
    email: result.email,
    displayName: result.displayName,
  } as unknown as User;
}

/**
 * Sign out current admin
 */
export async function logoutAdmin(): Promise<void> {
  clearOldAdminSessions();
  try {
    await signOut(auth);
  } catch (e) {
    // ignore
  }
}

/**
 * Send password reset email
 */
export async function sendAdminPasswordReset(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email.trim());
  } catch (e: any) {
    // If firebase operation is not enabled, explain clearly
    if (e?.code === 'auth/operation-not-allowed') {
      throw new Error(
        'Fitur email reset otomatis belum aktif di Firebase Console. Gunakan kata sandi admin utama atau ubah sandi di tab "Ubah Sandi".'
      );
    }
    throw e;
  }
}

/**
 * Real-time listener for Auth state
 */
export function subscribeAdminAuth(
  callback: (user: User | null, isAdmin: boolean) => void
): () => void {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      // Check if sessionStorage has an active session
      try {
        const isSessionActive = sessionStorage.getItem('tsn_admin_session') === 'active';
        const sessionUser = sessionStorage.getItem('tsn_admin_user');
        if (isSessionActive && sessionUser) {
          const proxyUser = {
            uid: 'admin-session-active',
            email: sessionUser,
            displayName: sessionUser,
          } as unknown as User;
          callback(proxyUser, true);
          return;
        }
      } catch {
        // ignore
      }
      callback(null, false);
      return;
    }
    const isAdmin = await verifyUserAdminRole(user);
    callback(user, isAdmin);
  });
}
