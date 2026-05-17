// Using Indexed DB from browser
import { openDB } from "idb";

const DB_NAME = "unihub_database";
const DB_VERSION = 1;
const STORE = "checkin";

async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      db.createObjectStore(STORE, { keyPath: "workshopId" }); // new keyPath
    },
  });
}

// Download & store all registrations for an event from backend
export async function saveWorkshopRegistrations(workshopId, registrations) {
  const db = await getDB();
  const tx = db.transaction(STORE, "readwrite");
  await tx.store.put({ workshopId, registrations });
  console.log("REGISTRATIONS:");
  console.log(registrations);
  await tx.done;
}

// Get all registrations for an event
export async function getRegistrations(workshopId) {
  const db = await getDB();
  const record = await db.get(STORE, workshopId);
  return record?.registrations ?? [];
}

// Mark a registration as checked in
export async function checkIn(workshopId, registrationId) {
  const db = await getDB();
  const tx = db.transaction(STORE, "readwrite");
  const record = await tx.store.get(workshopId);
  console.log(record);
  if (!record) throw new Error(`Event ${workshopId} not found`);

  const registration = record.registrations.find(
    (r) => r.registrationId === registrationId,
  );

  if (!registration)
    throw new Error(`Registration ${registrationId} not found`);
  if (registration.isCheckin) throw new Error(`Already checked in`);

  registration.isCheckin = true;
  registration.checkinAt = new Date().toISOString();

  await tx.store.put(record);
  await tx.done;

  return registration;
}

export async function getAllWorkshops() {
  const db = await getDB();
  return db.getAll(STORE);
}

export async function getAllRegistrations() {
  const db = await getDB();
  const events = await db.getAll(STORE);
  return events.flatMap((event) => event.registrations);
}

export async function clearItems() {
  const db = await getDB();
  return db.clear(STORE);
}

export async function isWorkshopEmpty(workshopId) {
  const db = await getDB();
  const tx = db.transaction(STORE, "readonly");

  // Lấy toàn bộ record của workshop dựa vào khóa chính
  const record = await tx.store.get(workshopId);

  // Đợi transaction hoàn thành
  await tx.done;

  // Nếu chưa có record nào trong DB -> Coi như trống (true)
  if (!record) {
    return true;
  }

  // Nếu có record, kiểm tra độ dài của mảng registrations
  return record.registrations.length === 0;
}