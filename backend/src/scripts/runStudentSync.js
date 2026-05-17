import "dotenv/config";
import { studentSyncService } from "../services/studentSync.service.js";
import sql from "../config/db.js";

try {
  const sourceFile = process.argv[2];
  const result = await studentSyncService.runLatestChunk({ sourceFile });
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await sql.end({ timeout: 1 });
}
