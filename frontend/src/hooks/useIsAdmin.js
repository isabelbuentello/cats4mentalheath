import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config.js';

/**
 * Admin rights for the signed-in user. Returns `{ isAdmin, loading }`.
 *
 * Subscribes to onAuthStateChanged rather than reading auth.currentUser once on
 * mount: Firebase restores the session asynchronously, so on a hard refresh
 * currentUser is still null when effects first run. A one-shot check would read
 * null, set false, and never re-run — the admin nav button would vanish on
 * reload, and the admin page would show "Admin Access Required" to a real admin.
 *
 * `loading` stays true until auth has settled AND the user doc has been read, so
 * callers gating a whole page can wait instead of flashing a denial.
 */
export default function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        setIsAdmin(userDoc.exists() ? userDoc.data().isAdmin || false : false);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return { isAdmin, loading };
}
