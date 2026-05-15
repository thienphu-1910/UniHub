import sql from "../config/db.js";

export const checkinRepository = {
  checkin: async ( staffId, registrationId ) => {
    try {
      await sql`
        INSERT INTO checkins (registration_id, checked_in_by)
        VALUES (${registrationId}, ${staffId})
      `;
    } catch (e) {
      throw e;
    }
  },

  synchronizeCheckinData: async (staffId, checkinData) => {
    try {
      const rows = checkinData.map(data => ({
        registration_id: data.registrationId,
        checked_in_by: staffId,
        checked_in_at: data.checkedInAt,
        is_offline: true,
        synced_at: new Date(),
      }));
      await sql`
        INSERT INTO checkins
        VALUES ${sql(rows)}
        ON CONFLICT (registration_id) DO NOTHING
      `
    } catch (e) {
      throw e;
    }
  },
}