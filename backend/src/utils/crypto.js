import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const SECRET_KEY = crypto
  .createHash('sha256')
  .update(process.env.QR_SECRET_KEY || "unihub-dev-qr-secret")
  .digest();
const IV_LENGTH = 16;

export const encrypt = (text) => {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', SECRET_KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

export const decrypt = (encryptedText) => {
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts.shift(), 'hex');
    const encrypted = parts.join(':');
    const decipher = crypto.createDecipheriv('aes-256-cbc', SECRET_KEY, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
