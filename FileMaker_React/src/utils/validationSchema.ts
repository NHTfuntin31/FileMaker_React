import { z } from "zod"

export const validationSchema = z.object({
	username: z.string().nonempty("ユーザー名は必須です").min(4, "4文字以上入力"),
	password: z.string().nonempty("パスワードは必須です"),
})