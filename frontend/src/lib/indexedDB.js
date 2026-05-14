// Using Indexed DB from browser
import { openDB } from "idb";

const DB_NAME = "unihub_database";
const DB_VERSION = 1;
const STORE = "checkin";

async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, {
          keyPath: "id",
        });
      }
    },
  });
}

export async function saveItem(item) {
  const db = await getDB();
  const tx = db.transaction(STORE, "readwrite");

  await tx.store.put(item);
  await tx.done;
}

export async function saveItems(items) {
  const db = await getDB();
  const tx = db.transaction(STORE, "readwrite");

  await Promise.all(items.map((item) => tx.store.put(item)));

  await tx.done;
}

export async function getAllItems() {
  const db = await getDB();
  return db.getAll(STORE);
}

export async function deleteItem(id) {
  const db = await getDB();
  return db.delete(STORE, id);
}

export async function clearItems() {
  const db = await getDB();
  return db.clear(STORE);
}
