import { ReactNode, useEffect } from "react";
import { useForm } from "react-hook-form"
import { validationSchema } from "../utils/validationSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginApi } from "../api/FileMakerApi";
import { useNavigate } from "react-router-dom";

export interface LoginForm {
	username: string;
	password: string;
}

const Login = () => {
	const navigate = useNavigate()

	useEffect(()=>{
		const storedData = localStorage.getItem("isUser");
		console.log(4554545)
		storedData ? navigate("/mypage") : <div>kjkj</div>;
	},[navigate])
	
	const { register, handleSubmit, formState: {errors} } = useForm<LoginForm>({mode: "onBlur", resolver: zodResolver(validationSchema)});

	const onSubmit = (data: LoginForm) => {
		LoginApi(data, navigate)
	}

	return(
		<>
			<div className="bg-gradient-to-br from-sky-300 to-blue-500 w-full h-screen flex justify-center items-center text-black">
				<div className="bg-sky-200 bg-opacity-40 w-[32rem] h-[25rem] border-solid rounded-3xl backdrop-blur-md">
					<div className="mx-16 my-10">
						<div className="">
							<h2 className="text-4xl font-bold">Login</h2>
						</div>
						<form className="flex flex-col gap-3 mt-5"  onSubmit={handleSubmit(onSubmit)}>
							<div className="flex flex-col gap-1">
								<span className="">UserName</span>
								<input 
								id="username"
								type="text"
								{...register("username")}
								className="p-2 border-solid rounded-md text-black"
								placeholder="0000"
								/>
								<p className="text-red-500">{errors.username?.message as ReactNode}</p>
							</div>
							<div className="flex flex-col gap-1">
								<span className="">Password</span>
								<input 
								id="password"
								type="password"
								{...register("password")}
								className="p-2 border-solid rounded-md text-black"
								placeholder="password"
								/>
								<p className="text-red-500">{errors.password?.message as ReactNode}</p>
							</div>
							<button
							className="bg-gradient-to-br from-sky-300 to-blue-500 p-2 mt-7 border-solid rounded-md"
							>Sign In</button>
						</form>
					</div>
				</div>
			</div>
		</>
	)
}

export default Login