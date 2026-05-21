import Dexie from 'dexie';

export const db = new Dexie('georef_db');

db.version(1).stores({
  captures: '++id, barcode, latitude, longitude, status, scanned_at' // Primary key and indexed props
});

export const saveCaptureLocal = async (captureData) => {
  return await db.captures.add({
    ...captureData,
    status: 'pending',
    scanned_at: new Date().toISOString()
  });
};

export const getPendingCaptures = async () => {
  return await db.captures.where('status').equals('pending').toArray();
};

export const markCaptureSynced = async (id) => {
  return await db.captures.update(id, { status: 'synced' });
};

export const clearSyncedCaptures = async () => {
  const synced = await db.captures.where('status').equals('synced').toArray();
  const ids = synced.map(c => c.id);
  return await db.captures.bulkDelete(ids);
};
