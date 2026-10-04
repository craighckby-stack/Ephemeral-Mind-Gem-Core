/**
 * DARLEK CANN ARCHITECTURAL HEADER
 * File: src/lib/memory.ts
 * Role: Core system component participating in autonomous cognitive evolution cycles.
 * Architecture: Type-safe modular unit with resilient state interfaces.
 */

import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, Firestore } from 'firebase/firestore';
import { MemoryRecord } from '../types';

let db: Firestore | null = null;
const APP_ID = 'emg-kernel-app';

// Helper to check if Firebase is available
function getFirebaseConfig(): any {
  // Check injected global variables
  const win = window as any;
  if (win.__firebase_config) {
    try {
      return typeof win.__firebase_config === 'string'
        ? JSON.parse(win.__firebase_config)
        : win.__firebase_config;
    } catch (e) {
      console.error('Failed to parse __firebase_config', e);
    }
  }
  return null;
}

export function initStorage(): { mode: 'cloud' | 'local'; userId: string } {
  const config = getFirebaseConfig();
  let mode: 'cloud' | 'local' = 'local';
  let userId = 'LOCAL_KERNEL_USER';

  // Generate or retrieve a persistent anonymous local ID if offline
  let localId = localStorage.getItem('emg_local_user_id');
  if (!localId) {
    localId = 'EMG-USER-' + Math.random().toString(36).substring(2, 11).toUpperCase();
    localStorage.setItem('emg_local_user_id', localId);
  }
  userId = localId;

  if (config && Object.keys(config).length > 0) {
    try {
      const app = getApps().length === 0 ? initializeApp(config) : getApp();
      db = getFirestore(app);
      mode = 'cloud';
      // If we have an authentication token we could sign in, but for fallback
      // we can also track cloud mode. If firestore fails we gracefully fallback.
      console.log('Firebase initialized in storage mode.');
    } catch (err) {
      console.error('Firebase storage init failed, falling back to localStorage', err);
      mode = 'local';
    }
  }

  return { mode, userId };
}

export async function saveRecord(topic: string, record: MemoryRecord): Promise<void> {
  // Save locally first for robust redundancy
  const localKey = `emg_memory_${encodeURIComponent(topic.toLowerCase())}`;
  localStorage.setItem(localKey, JSON.stringify(record));

  // Add to listing index of topics
  const topicsJson = localStorage.getItem('emg_topics_index') || '[]';
  const topics: string[] = JSON.parse(topicsJson);
  if (!topics.includes(topic)) {
    topics.push(topic);
    localStorage.setItem('emg_topics_index', JSON.stringify(topics));
  }

  // If cloud Firestore is available, save to cloud too
  if (db) {
    try {
      const localUser = localStorage.getItem('emg_local_user_id') || 'ANON';
      const docRef = doc(db, `artifacts/${APP_ID}/users/${localUser}/memories/${encodeURIComponent(topic.toLowerCase())}`);
      await setDoc(docRef, record, { merge: true });
      console.log('Successfully backed up memory to cloud Firestore.');
    } catch (err) {
      console.warn('Firestore backup failed, saved to local cache only.', err);
    }
  }
}

export async function loadRecord(topic: string): Promise<MemoryRecord | null> {
  // Check local cache first
  const localKey = `emg_memory_${encodeURIComponent(topic.toLowerCase())}`;
  const localData = localStorage.getItem(localKey);
  if (localData) {
    try {
      return JSON.parse(localData);
    } catch (e) {
      console.error('Failed to parse local record', e);
    }
  }

  // If local missing, check Cloud storage if available
  if (db) {
    try {
      const localUser = localStorage.getItem('emg_local_user_id') || 'ANON';
      const docRef = doc(db, `artifacts/${APP_ID}/users/${localUser}/memories/${encodeURIComponent(topic.toLowerCase())}`);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const cloudRecord = docSnap.data() as MemoryRecord;
        // Cache locally for next time
        localStorage.setItem(localKey, JSON.stringify(cloudRecord));
        return cloudRecord;
      }
    } catch (err) {
      console.warn('Firestore retrieval failed', err);
    }
  }

  return null;
}

export async function exportAllMemory(): Promise<MemoryRecord[]> {
  const records: MemoryRecord[] = [];
  const topicsJson = localStorage.getItem('emg_topics_index') || '[]';
  const topics: string[] = JSON.parse(topicsJson);

  for (const t of topics) {
    const key = `emg_memory_${encodeURIComponent(t.toLowerCase())}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        records.push(JSON.parse(raw));
      } catch (e) {
        console.error('Parse error on key', key, e);
      }
    }
  }

  return records;
}

export async function importAllMemory(records: MemoryRecord[]): Promise<number> {
  let importedCount = 0;
  const topicsJson = localStorage.getItem('emg_topics_index') || '[]';
  const topics: string[] = JSON.parse(topicsJson);

  for (const record of records) {
    if (!record.topic || !record.synthesis || !record.perspectives) continue;

    const localKey = `emg_memory_${encodeURIComponent(record.topic.toLowerCase())}`;
    localStorage.setItem(localKey, JSON.stringify(record));

    if (!topics.includes(record.topic)) {
      topics.push(record.topic);
    }
    importedCount++;
  }

  localStorage.setItem('emg_topics_index', JSON.stringify(topics));
  return importedCount;
}
