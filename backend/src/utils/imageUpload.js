import cloudinary from "../config/cloudinary.js";

export const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "avatars" }, // Bạn có thể tùy chỉnh folder tại đây
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      },
    );

    // Ghi dữ liệu từ buffer vào stream
    stream.end(fileBuffer);
  });
};
