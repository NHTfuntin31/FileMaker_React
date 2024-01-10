import { zodResolver } from "@hookform/resolvers/zod/src/zod.js";
import { ReactNode, useEffect } from "react";
import { useForm } from "react-hook-form";
import { RegisterSchema } from "../utils/validationSchema";
import { useNavigate } from "react-router-dom";

export interface RegisterForm {
	firstname: string;
	lastname: string;
	firstname_kana: string;
	lastname_kana: string;
	email: string;
	sex: string;
	yubin: string;
}

const Register = () => {
	const navigate = useNavigate()

	const storedData = localStorage.getItem("isUser");

	useEffect(() => {
		if (storedData) {
			navigate("/mypage");
		}
	}, [navigate, storedData]);

	const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({ mode: "onBlur", resolver: zodResolver(RegisterSchema) });

	const onSubmit = (data: RegisterForm) => {
		console.log(data);
	}

	return (
		<>
			<div className="bg-gradient-to-br from-sky-300 to-blue-500 w-full h-screen flex justify-center items-center text-black">
				<div className="bg-sky-200 bg-opacity-30 w-5/6 border-solid rounded-3xl backdrop-blur-md">
					<div className="mx-16 my-10">
						<div className="">
							<h2 className="text-4xl font-bold">Register</h2>
						</div>
						<form className="flex flex-col gap-3 mt-5"
							onSubmit={handleSubmit(onSubmit)}
						>
							{/* name */}
							<div className="flex flex-col gap-1">
								<span className="">お名前</span>
								<div className="flex justify-between gap-2">
									<input
										id="sei"
										type="text"
										{...register("firstname")}
										className="p-2 border-solid rounded-md text-black w-full"
										placeholder="性"
									/>
									<input
										id="mei"
										type="text"
										{...register("lastname")}
										className="p-2 border-solid rounded-md text-black  w-full"
										placeholder="名"
									/>
								</div>
								<p className="text-red-500">{errors.lastname?.message as ReactNode}|{errors.firstname?.message as ReactNode}</p>
							</div>
							<div className="flex flex-col gap-1">
								<span className="">ふりがな</span>
								<div className="flex justify-between gap-2">
									<input
										id="sei"
										type="text"
										className="p-2 border-solid rounded-md text-black w-full"
										placeholder="セイ"
										{...register("firstname_kana")}
									/>
									<input
										id="mei"
										type="text"
										className="p-2 border-solid rounded-md text-black  w-full"
										placeholder="メイ"
										{...register("lastname_kana")}
									/>
								</div>
								<p className="text-red-500">{errors.lastname_kana?.message as ReactNode}|{errors.firstname_kana?.message as ReactNode}</p>
							</div>
							{/* sex */}
							<div className="flex flex-col gap-1">
								<span className="">性別</span>
								<div className="flex items-center ml-3">
									<input 
										id="default-radio-1" 
										type="radio" 
										className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
										value="male"
										{...register("sex")}
									/>
									<label htmlFor="default-radio-1" className="ms-2 text-sm font-medium text-gray-900">男性</label>
								</div>
								<div className="flex items-center ml-3">
									<input 
										id="default-radio-2" 
										type="radio" 
										className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" 
										value="female"
										{...register("sex")}
									/>
									<label htmlFor="default-radio-2" className="ms-2 text-sm font-medium text-gray-900">女性</label>
								</div>
							</div>
							<div className="flex flex-col gap-1">
								<span className="">郵便番号</span>
								<input
									id="yubin"
									type="input"
									className="p-2 border-solid rounded-md text-black w-1/6"
									placeholder="000-0000"
									{...register("yubin")}
								/>
							</div>
							<div className="flex flex-col gap-1">
								<span className="">Eメール</span>
								<input
									id="email"
									type="input"
									className="p-2 border-solid rounded-md text-black"
									placeholder="email"
									{...register("email")}
								/>
								<p className="text-red-500">{errors.email?.message as ReactNode}</p>
							</div>
							<button
								className="bg-gradient-to-br from-sky-300 to-blue-500 p-2 mt-7 border-solid rounded-md w-5/12 self-center"
							>Register</button>
						</form>
					</div>
				</div>
			</div>
		</>
	)
}

export default Register