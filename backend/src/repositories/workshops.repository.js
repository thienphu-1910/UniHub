import sql from "../config/db.js";

export const workshopsRepository = {
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
    capacity,
    availableSlots,
    price,
    createdBy,
  }) => {
    try {
      console.log(price)
      const response = await sql`
      INSERT INTO workshops (title, description, ai_summary, summary_status, speaker, room, room_diagram, start_time, end_time, capacity, available_slots, price, created_by)
      VALUES (${title}, ${description}, ${aiSummary}, ${summaryStatus}, ${speaker}, ${room}, ${roomDiagram}, ${startTime}, ${endTime}, ${capacity}, ${availableSlots}, ${price}, ${createdBy})
      RETURNING id AS "workshopId", title, description, ai_summary AS "aiSummary", summary_status AS "summaryStatus", speaker, room, room_diagram AS "roomDiagram", start_time AS "startTime", end_time AS "endTime", capacity, available_slots AS "availableSlots", price, created_by AS "createdBy"
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
        SELECT id, title, speaker, price, capacity, available_slots AS "availableSlots", start_time AS "startTime", end_time AS "endTime", room
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
      }
    } catch (e) {
      console.log(e);
      throw e;
    }
  },

  getWorkshopDetail: async (workshopId) => {
    try {
      const response = await sql`
        SELECT id, title, speaker, price, capacity, available_slots AS "availableSlots", start_time AS "startTime", end_time AS "endTime", room, ai_summary AS "aiSummary"
        FROM workshops
        WHERE id = ${workshopId}
      `;

      return response ? response[0] : null;
    } catch (e) {
      throw e;
    }
  }
};
