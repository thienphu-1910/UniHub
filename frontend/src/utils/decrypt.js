const SECRET_KEY_STRING = import.meta.env.VITE_QR_SECRET_KEY;

const getKey = async () => {
  const encoder = new TextEncoder();
  const rawKey = encoder.encode(SECRET_KEY_STRING);

  // Replicate: crypto.createHash('sha256').update(secret).digest()
  const hashBuffer = await crypto.subtle.digest("SHA-256", rawKey);

  return crypto.subtle.importKey(
    "raw",
    hashBuffer,
    { name: "AES-CBC" },
    false,
    ["decrypt"],
  );
};

const hexToBytes = (hex) =>
  Uint8Array.from(hex.match(/.{1,2}/g).map((b) => parseInt(b, 16)));

export const decrypt = async (encryptedText) => {
  const [ivHex, ...rest] = encryptedText.split(":");
  const encryptedHex = rest.join(":");

  const iv = Uint8Array.from(hexToBytes(ivHex));
  const encryptedBytes = Uint8Array.from(hexToBytes(encryptedHex));

  const key = await getKey();

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: "AES-CBC", iv },
    key,
    encryptedBytes,
  );

  return new TextDecoder().decode(decryptedBuffer);
};

