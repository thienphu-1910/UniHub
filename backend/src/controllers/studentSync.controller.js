import { addStudentSyncJob } from "../jobs/queues/studentSync.queue.js";
import { studentSyncService } from "../services/studentSync.service.js";

export const studentSyncController = {
  runStudentSync: async (req, res) => {
    try {
      if (req.query.mode === "direct") {
        const result = await studentSyncService.runLatestChunk({});
        return res.status(result.success ? 200 : 422).json({
          success: result.success,
          data: result,
        });
      }

      const job = await addStudentSyncJob({});
      return res.status(202).json({
        success: true,
        message: "Student sync job queued",
        data: {
          jobId: job.id,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error?.message || "Can not run student sync",
      });
    }
  },

  getStudentSyncImports: async (req, res) => {
    try {
      const page = Number.parseInt(req.query.page, 10) || 1;
      const limit = Number.parseInt(req.query.limit, 10) || 20;
      const imports = await studentSyncService.listImports({ page, limit });

      return res.status(200).json({
        success: true,
        data: {
          list: imports,
          page,
          limit,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error?.message || "Can not get student sync imports",
      });
    }
  },
};

