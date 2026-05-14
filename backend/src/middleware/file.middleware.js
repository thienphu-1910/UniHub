import multer from "multer"

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "avatar") {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Avatar must be an image!"), false);
  } else if (file.fieldname === "pdf") {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("File must be a PDF!"), false);
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // Giới hạn 5MB
});

const uploadMiddleware = upload.fields([
  { name: "avatar", maxCount: 1 },
  { name: "pdf", maxCount: 1 },
]);

export { uploadMiddleware };
