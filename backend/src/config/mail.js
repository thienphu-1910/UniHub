import dotenv from "dotenv";

dotenv.config();

// Nodemailer Gmail configuration
export const mailConfig = {
  service: process.env.MAIL_SERVICE || "gmail",
  auth: {
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASS || "",
  },
  from: process.env.EMAIL_USER || "noreply@unihub.local",
};

export default mailConfig;
