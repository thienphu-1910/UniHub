import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;
const sql = postgres(connectionString, {
  types: {
    numeric: {
      to: 0,
      from: [1700], // OID của DECIMAL/NUMERIC
      serialize: (x) => String(x),
      parse: (x) => parseFloat(x), // ✅ Parse thành number thay vì string
    },
  },
});

export default sql;
