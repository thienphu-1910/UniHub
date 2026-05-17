const SECRET_KEY_STRING = import.meta.env.VITE_QR_SECRET_KEY;

const getKey = async () => {
  const encoder = new TextEncoder();
  const rawKey = encoder.encode(SECRET_KEY_STRING);

  // Replicate: crypto.createHash('sha256').update(secret).digest()
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", rawKey);

  // ĐỒNG BỘ BACKEND: Định nghĩa rõ ràng thuật toán mã hóa là AES-CBC với độ dài 256 bits
  return window.crypto.subtle.importKey(
    "raw",
    hashBuffer,
    {
      name: "AES-CBC",
      length: 256, // Bắt buộc phải là 256 để khớp với aes-256-cbc của backend
    },
    false,
    ["decrypt"],
  );
};

const hexToBytes = (hex) => {
  if (!hex) return new Uint8Array();
  const matches = hex.match(/.{1,2}/g);
  if (!matches) return new Uint8Array();
  return Uint8Array.from(matches.map((b) => parseInt(b, 16)));
};

export const decrypt = async (encryptedText) => {
  if (!encryptedText || !encryptedText.includes(":")) {
    throw new Error("Format chuỗi mã hóa không hợp lệ.");
  }

  // Tách IV và Ciphertext tương tự cách làm của backend (parts.shift())
  const firstColonIndex = encryptedText.indexOf(":");
  const ivHex = encryptedText.substring(0, firstColonIndex);
  const encryptedHex = encryptedText.substring(firstColonIndex + 1);

  const iv = hexToBytes(ivHex);
  const encryptedBytes = hexToBytes(encryptedHex);

  if (iv.length !== 16) {
    throw new Error("Độ dài IV không hợp lệ cho AES-CBC (Yêu cầu 16 bytes)");
  }

  const key = await getKey();

  try {
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-CBC",
        iv: iv,
      },
      key,
      encryptedBytes,
    );

    return new TextDecoder().decode(decryptedBuffer);
  } catch (error) {
    console.error(
      "Lỗi giải mã: Khóa sai, dữ liệu bị bóp méo hoặc sai padding.",
      error,
    );
    throw new Error(
      "Giải mã thất bại. Vui lòng kiểm tra lại Secret Key giữa 2 bên.",
    );
  }
};
