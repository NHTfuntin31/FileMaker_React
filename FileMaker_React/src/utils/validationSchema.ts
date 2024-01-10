import { z } from "zod"

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
	sex: z.string().nonempty("性別は必須です"),
})