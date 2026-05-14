import z from "zod";

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 5MB

const ImageFileSchema = z
  .any()
  .refine((file) => file !== null, "Vui lòng chọn ảnh")
  .refine((file) => file?.size <= MAX_FILE_SIZE, "Kích thước ảnh tối đa 5MB")
  .refine(
    (file) => ["image/jpeg", "image/png", "image/webp, image/jpeg"].includes(file?.mimetype),
    "Chỉ chấp nhận .jpg, .png, .webp",
  );

const PdfFileSchema = z
  .any()
  .refine((file) => file !== null, "Vui lòng upload tài liệu PDF")
  .refine((file) => file?.size <= MAX_FILE_SIZE, "Kích thước PDF tối đa 5MB")
  .refine(
    (file) => file?.mimetype === "application/pdf",
    "Chỉ chấp nhận định dạng .pdf",
  );


export const WorkshopSchema = z.object({
  title: z.string().trim().min(1, "Title không được để trống"),
  description: z.string().trim(),
  capacity: z.coerce.number().int().positive(),
  price: z.coerce.number().min(0),
  room: z.string().trim().min(1),

  startTime: z.coerce.date(),
  endTime: z.coerce.date(),

  speakerName: z.string().trim(),
  speakerBio: z.string().trim(),
  speakerAvatar: ImageFileSchema.nullable(),

  pdfFile: PdfFileSchema.nullable(),
})
.refine((data) => data.endTime > data.startTime, {
  message: "Thời gian kết thúc phải sau thời gian bắt đầu",
  path: ["endTime"],
});
