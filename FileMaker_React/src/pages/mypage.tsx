import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../component/Header";
import { userInfo } from "../api/FileMakerApi";
import CalendarComponent from "../component/CalendarComponent";


const MyPage = () => {
	const navigate = useNavigate();

	const doctor_ID: string = userInfo(true);

	useEffect(() => {
		if (!doctor_ID) {
			navigate("/")
		}
	}, [navigate, doctor_ID])

	return (
		<>
			<Header />
			<div className="bg-sky-600 w-full h-screen flex flex-col text-white">

				<div className="flex flex-col bg-slate-800 h-svh md:justify-between">
					<div className="bg-white w-full content-center flex items-center justify-center">
						<div className="w-full max-w-5xl">
							<div className="mx-5 mt-10 md:mx-16 pl-2 text-blue-500 font-bold bg-blue-100 border-l-4 border-blue-500">カレンダー</div>
							<CalendarComponent edoctorID={doctor_ID} />
						</div>
					</div>
				</div>
			</div>
		</>
	)
};

export default MyPage;
