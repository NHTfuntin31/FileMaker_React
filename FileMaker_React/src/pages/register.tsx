// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";

export interface LoginForm {
	username: string;
	password: string;
}

const Register = () => {
	// const navigate = useNavigate()

	// const storedData = localStorage.getItem("isUser");

	// useEffect(() => {
	// 	if (!storedData) {
	// 		navigate("/");
	// 	}
	// }, [navigate, storedData]);
	
	// const { register, handleSubmit, formState: {errors} } = useForm<LoginForm>({mode: "onBlur", resolver: zodResolver(validationSchema)});

	// const onSubmit = (data: LoginForm) => {
	// 	LoginApi(data, navigate)
	// }

	return(
		<>
			<div className="bg-sky-600 w-full h-screen flex justify-center items-center text-white">
				<div className="bg-blue-300 bg-opacity-15 w-[32rem] h-[25rem] border-solid rounded-3xl backdrop-blur-md">
					<div className="mx-16 my-10">
						<div className="">
							<h2 className="text-4xl font-bold">Register</h2>
						</div>
						<form className="flex flex-col gap-3 mt-5">
				
							<button
							className="bg-blue-950 p-2 mt-7 border-solid rounded-md"
							>Sign In</button>
						</form>
					</div>
				</div>
			</div>
		</>
	)
}

export default Register