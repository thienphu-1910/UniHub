import z from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const ImageFileSchema = z
  .any()
  .refine((file) => file !== null, "Vui lòng chọn ảnh")
  .refine((file) => file?.size <= MAX_FILE_SIZE, "Kích thước ảnh tối đa 5MB")
  .refine(
    (file) => ["image/jpeg", "image/png", "image/webp"].includes(file?.type),
    "Chỉ chấp nhận .jpg, .png, .webp",
  );

const PdfFileSchema = z
  .any()
  .refine((file) => file !== null, "Vui lòng upload tài liệu PDF")
  .refine((file) => file?.size <= MAX_FILE_SIZE, "Kích thước PDF tối đa 5MB")
  .refine(
    (file) => file?.type === "application/pdf",
    "Chỉ chấp nhận định dạng .pdf",
  );


export const WorkshopSchema = z.object({
  title: z.string().trim().min(1, "Title không được để trống"),
  description: z.string().trim().min(1, "Description không được để trống"),
  capacity: z.coerce.number().int().positive(),
  price: z.coerce.number().min(0),
  room: z.string().trim().min(1),

  starTime: z.coerce.date(),
  endTime: z.coerce.date(),

  speakerName: z.string().trim(),
  speakderBio: z.string().trim(),
  speakderAvatar: ImageFileSchema.nullable(),

  pdfFile: PdfFileSchema.nullable(),
})
.refine((data) => data.endTime > data.starTime, {
  message: "Thời gian kết thúc phải sau thời gian bắt đầu",
  path: ["endTime"],
});
