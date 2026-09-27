import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { NewsItem } from '../types';
import { initialNews } from '../data/mockData';

const NEWS_COLL = 'news';

/**
 * Real-time listener for News and Publications list
 */
export function subscribeNews(
  onUpdate: (news: NewsItem[]) => void,
  onError?: (err: unknown) => void
) {
  try {
    const collRef = collection(db, NEWS_COLL);
    return onSnapshot(
      collRef,
      (snapshot) => {
        if (snapshot.empty) {
          // If Firestore is empty, fallback to initial mock news items
          onUpdate(initialNews);
          return;
        }

        const list: NewsItem[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as NewsItem);
        });

        // Sort: newer articles first (fallback to id comparison)
        list.sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          if (!isNaN(dateA) && !isNaN(dateB)) {
            return dateB - dateA;
          }
          return b.id.localeCompare(a.id);
        });

        onUpdate(list);
      },
      (error) => {
        console.warn('News Firestore listener fallback to initial list:', error);
        onUpdate(initialNews);
        if (onError) onError(error);
      }
    );
  } catch (error) {
    console.warn('Failed to subscribe to news:', error);
    onUpdate(initialNews);
    return () => {};
  }
}

/**
 * Save new news article to Firestore
 */
export async function saveNews(newsItem: NewsItem): Promise<void> {
  const path = `${NEWS_COLL}/${newsItem.id}`;
  try {
    const docRef = doc(db, NEWS_COLL, newsItem.id);
    await setDoc(docRef, newsItem);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * Update existing news article in Firestore
 */
export async function updateNews(newsItem: NewsItem): Promise<void> {
  const path = `${NEWS_COLL}/${newsItem.id}`;
  try {
    const docRef = doc(db, NEWS_COLL, newsItem.id);
    await setDoc(docRef, newsItem, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Delete news article from Firestore
 */
export async function deleteNews(newsId: string): Promise<void> {
  const path = `${NEWS_COLL}/${newsId}`;
  try {
    const docRef = doc(db, NEWS_COLL, newsId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
