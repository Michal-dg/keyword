/*  src/app.js
 *  ————————————————————————————————————————————
 *  Bootstrap Firebase (v9 modular) + kilka utili,
 *  logika UI/auth trzymamy w osobnych plikach.
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  enableIndexedDbPersistence,
  serverTimestamp
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

/* ————————————————————————————————————————————
   Konfiguracja Firebase – klucze TYLKO dla
   englishapp-ff793. apiKey możesz trzymać w .env,
   reszta i tak jest publiczna.                 */
const firebaseConfig = {
  apiKey:             import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:         import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:          import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:      import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:  import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:              import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:      import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

/* ————————————————————————————————————————————
   Inicjalizacja i eksporty                     */
export const firebaseApp = initializeApp(firebaseConfig);
export const auth        = getAuth(firebaseApp);
export const db          = getFirestore(firebaseApp);
export const storage     = getStorage(firebaseApp);

/* ————————————————————————————————————————————
   Firestore offline-persistence (IndexedDB).
   synchronizeTabs:true → kilka kart współdzieli cache.
   W środowiskach bez okna (SSR, tests) pomijamy.    */
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db, { synchronizeTabs: true })
    .catch(err =>
      console.warn('⚠️  Offline persistence not włączone', err.code)
    );
}

/* ————————————————————————————————————————————
   Helpers wspólne dla całej aplikacji          */
export const ENGLISH_ACCENT = 'en-GB';

export const getToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export const addDays = (date, days) => {
  const r = new Date(date);
  r.setDate(r.getDate() + days);
  return r;
};

export const serverNow = () => serverTimestamp();

/* ———————————————————————————————————————————— */
console.log('%c🔥 Firebase bootstrapped', 'color:#0284c7;font-weight:bold');