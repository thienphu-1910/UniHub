import sql from "../config/db.js";

export const workshopRepository = {
  addNewWorkshop: async ({
    title,
    description,
    aiSummary,
    summaryStatus,
    speaker,
    room,
    roomDiagram,
    startTime,
    endTime,
    registrationStartTime,
    registrationEndTime,
    capacity,
    availableSlots,
    isPaid,
    price,
    createdBy,
  }) => {
    try {
      const response = await sql`
      INSERT INTO workshops (title, description, ai_summary, summary_status, speaker, room, room_diagram, start_time, end_time, registration_start_time, registration_end_time, capacity, available_slots, is_paid, price, created_by)
      VALUES (${title}, ${description}, ${aiSummary}, ${summaryStatus}, ${speaker}, ${room}, ${roomDiagram}, ${startTime}, ${endTime}, ${registrationStartTime}, ${registrationEndTime}, ${capacity}, ${availableSlots}, ${isPaid}, ${price}, ${createdBy})
      RETURNING id, id AS "workshopId", title, description, ai_summary AS "aiSummary", summary_status AS "summaryStatus", speaker, room, room_diagram AS "roomDiagram", start_time AS "startTime", end_time AS "endTime", registration_start_time AS "registrationStartTime", registration_end_time AS "registrationEndTime", capacity, available_slots AS "availableSlots", is_paid AS "isPaid", price, created_by AS "createdBy"
    `;
      return response ? response[0] : null;
    } catch (e) {
      console.log(e);
      return null;
    }
  },

  getWorkshopList: async (page = 1, limit = 10) => {
    try {
      const response = await sql`
        SELECT id, title, speaker, is_paid AS "isPaid", price, capacity, available_slots AS "availableSlots", start_time AS "startTime", end_time AS "endTime", registration_start_time AS "registrationStartTime", registration_end_time AS "registrationEndTime", room
        FROM workshops
        WHERE start_time >= CURRENT_TIMESTAMP
      `;

      const offset = (page - 1) * limit;
      const list = response.slice(offset, offset + limit);

      const totalPage = response.length < limit ? 1 : response.length / limit;
      return {
        list,
        offset,
        totalPage: totalPage,
        limit,
      };
    } catch (e) {
      console.log(e);
      throw e;
    }
  },

  getWorkshopDetail: async (workshopId) => {
    try {
      const id = workshopId ?? "";

      const response = await sql`
        SELECT id, description, title, speaker, is_paid AS "isPaid", price, capacity, available_slots AS "availableSlots", start_time AS "startTime", end_time AS "endTime", registration_start_time AS "registrationStartTime", registration_end_time AS "registrationEndTime", room, ai_summary AS "aiSummary"
        FROM workshops
        WHERE id = ${id}
      `;

      return response ? response[0] : null;
    } catch (e) {
      throw e;
    }
  },

  getWorkshopForCache: async (workshopId) => {
    try {
      const response = await sql`
        SELECT
          w.id,
          w.description,
          w.title,
          w.speaker,
          w.is_paid AS "isPaid",
          w.price,
          w.capacity,
          GREATEST(
            w.capacity - COALESCE(active_registrations.total, 0),
            0
          ) AS "availableSlots",
          w.start_time AS "startTime",
          w.end_time AS "endTime",
          w.registration_start_time AS "registrationStartTime",
          w.registration_end_time AS "registrationEndTime",
          w.room,
          w.room_diagram AS "roomDiagram",
          w.ai_summary AS "aiSummary",
          w.summary_status AS "summaryStatus",
          w.created_by AS "createdBy"
        FROM workshops AS w
        LEFT JOIN (
          SELECT workshop_id, COUNT(*)::int AS total
          FROM registrations
          WHERE status IN ('pending', 'confirmed')
          GROUP BY workshop_id
        ) AS active_registrations
          ON active_registrations.workshop_id = w.id
        WHERE w.id = ${workshopId}
      `;

      return response ? response[0] : null;
    } catch (e) {
      throw e;
    }
  },
};
