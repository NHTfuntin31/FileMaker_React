import { z } from "zod"

const MAX_MB = 10;
const MAX_FILE_SIZE = MAX_MB * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = [
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // Excel (.xlsx)
	'application/vnd.ms-excel', // Excel (.xls)
	'application/pdf', // PDF
	'application/msword', // Word (.doc)
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // Word (.docx)
];

export const validationSchema = z.object({
	username: z.string().nonempty("ユーザー名は必須です").min(4, "4文字以上入力"),
	password: z.string().nonempty("パスワードは必須です"),
})

export const RegisterSchema = z.object({
	firstname: z.string().nonempty("ユーザー名は必須です").min(4, "4文字以上入力"),
	lastname: z.string().nonempty("ユーザー名は必須です"),
	firstname_kana: z.string().nonempty("ユーザー名は必須です"),
	lastname_kana: z.string().nonempty("ユーザー名は必須です"),
	email: z.string().email().nonempty("emailは必須です"),
	yubin: z.string().nonempty("郵便番号は必須です"),
	category: z.array(z.string()),
	sex: z.string().nonempty("性別は必須です"),
	file: z
		.any()
		.refine(
			(file) => file?.[0]?.size <= MAX_FILE_SIZE,
			`ファイルサイズが大きすぎます。${MAX_MB}MB以下のファイルを選択してください`,
		)
		.refine(
			(file) => ACCEPTED_IMAGE_TYPES.includes(file?.[0]?.type),
			'pdf, excel',
		),
})