import { registrationService } from "../services/registration.service.js";
import { registrationEvent, clients } from "../jobs/events/registration.event.js";
import redis from "../config/redis.js";

export const registrationController = {
  createRegistration: async (req, res) => {
    try {
      const result = await registrationService.createRegistration({
        workshopId: req.params.workshopId,
        user: req.user,
      });

      console.log(result);

      if (!result.success) {
        return res.status(result.statusCode).json({
          success: result.success,
          code: result.code,
          message: result.message,
        });
      }

      return res.status(201).json({
        success: true,
        message: "Registration created successfully",
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  },

  getWorkshopRegisteredStudents: async (req, res) => {
    const workshopId = req.params.workshopId;
    try {
      const response =
        await registrationService.getWorkshopRegisteredStudents(workshopId);
      return res.status(200).json({
        success: true,
        message: "Get all registered students successfully",
        data: {
          list: response,
        },
      });
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: e?.message || "",
      });
    }
  },

  // getRegistrationStatus: async (req, res) => {
  //   const { userId } = req.user;
  //   const workshopId = req.params.workshopId;

  //   try {
  //     const holdkey = `slot-hold-${workshopId}-${userId}`;
  //     const id = await redis.get(holdkey);
  //     if (id) {
  //       res.write(`data: ${JSON.stringify({
  //         status: "prepending",
  //         registrationId: id,
  //       })}\n\n`);
  //     }
  //     console.log(id)

  //     const result = await registrationService.getRegistrationStatus(
  //       workshopId,
  //       userId,
  //     );

  //     res.setHeader("Content-Type", "text/event-stream");
  //     res.setHeader("Cache-Control", "no-cache");
  //     res.setHeader("Connection", "keep-alive");
  //     res.flushHeaders();
  //     res.write(`event: registration-status\n\n`);
  //     if (result) {
  //       const { status, idempotencyKey, registrationId } = result;
  //       res.write(`data: ${JSON.stringify({
  //         status,
  //         idempotencyKey,
  //         registrationId
  //       })}\n\n`);
  //     }

  //     const key = `${workshopId}:${userId}`;
  //     clients.set(key, res);

  //     req.on("close", () => {
  //       console.log("Client close connection!");
  //       clients.delete(key);
  //       res.end();
  //     });

  //   } catch (e) {
  //     return res.status(500).json({
  //       success: false,
  //       message: "Database Unavailable",
  //     })
  //   }
  // },

  getRegistrationStatus: async (req, res) => {
    const { userId } = req.user;
    const workshopId = req.params.workshopId;
    const key = `${workshopId}:${userId}`;

    try {
      // 1. PHẢI THIẾT LẬP VÀ GỬI HEADERS SSE ĐẦU TIÊN
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      // // Nếu dùng compression middleware (như gzip), cần có header này hoặc dùng res.flush()
      // res.setHeader("X-Accel-Buffering", "no");
      res.flushHeaders();

      // 2. Đăng ký client vào map ngay để tránh mất event nếu service xử lý quá nhanh
      clients.set(key, res);

      // 3. Check Redis cho trạng thái giữ chỗ (Slot hold)
      const holdkey = `slot-hold-${workshopId}-${userId}`;
      const id = await redis.get(holdkey);

      if (id) {
        // Đúng format SSE: định nghĩa event trước, KHÔNG dùng \n\n ở giữa event và data
        res.write(`event: registration-status\n`);
        res.write(
          `data: ${JSON.stringify({ status: "prepending", registrationId: id })}\n\n`,
        );
      }

      // 4. Lấy trạng thái chính thức từ DB Service
      const result = await registrationService.getRegistrationStatus(
        workshopId,
        userId,
      );

      if (result) {
        const { status, idempotencyKey, registrationId } = result;
        res.write(`event: registration-status\n`);
        res.write(
          `data: ${JSON.stringify({ status, idempotencyKey, registrationId })}\n\n`,
        );
      }

      // 5. Xử lý đóng kết nối an toàn
      req.on("close", () => {
        console.log(`Client ${key} closed connection!`);
        clients.delete(key);
        res.end();
      });
    } catch (e) {
      console.error("SSE Error:", e);
      // Nếu chưa gửi header thì có thể trả về 500 JSON, nhưng nếu đã flushHeaders thì phải gửi qua format SSE
      if (!res.headersSent) {
        return res
          .status(500)
          .json({ success: false, message: "Database Unavailable" });
      } else {
        res.write(`event: error\n`);
        res.write(
          `data: ${JSON.stringify({ message: "Database Unavailable" })}\n\n`,
        );
        clients.delete(key);
        res.end();
      }
    }
  },

  getWorkshopConfirmedRegistration: async (req, res) => {
    const workshopId = req.params.workshopId;
    //console.log(workshopId)
    try {
      const registrations =
        await registrationService.getWorkshopConfirmedRegistration(workshopId);

      return res.status(200).json({
        success: true,
        message: "Get registrations successfully",
        data: {
          registrations,
        },
      });
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: "Database Unavailable",
      });
    }
  },

  getQRCodeData: async (req, res) => {
    const workshopId = req.params.workshopId;
    try {
      const response = await registrationService.getQRCodeData(workshopId);
      return res.status(200).json({
        success: true,
        message: "Get QR code data successfully",
        data: {
          qrCodeData: response,
        }
      });
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: "Database Unavailable",
      });
    }
  }
};
