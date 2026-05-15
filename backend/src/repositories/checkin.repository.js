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

  synchronizeCheckinData: async () => {

  },
}