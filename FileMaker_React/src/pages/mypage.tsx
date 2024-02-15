import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../component/Header";
import { getSchema, userInfo } from "../api/FileMakerApi";
import CalendarComponent from "../component/CalendarComponent";
import { Loading } from "../component/icon/loading";
// import { Loading } from "../component/icon/loading";


const MyPage = () => {
	const navigate = useNavigate();
	const [isloading, setIsloading] = useState(false)
	const [schema, setschema] = useState(null)
	const doctor_ID: string = userInfo(true);

	const fetchSchema = async () => {
		setIsloading(true)
		const data = await getSchema(doctor_ID)
		setschema(data)
		setIsloading(false)
	}

	useEffect(() => {
		fetchSchema()
		if (!doctor_ID) {
			navigate("/")
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<>
			<Header />
			<div className="bg-white w-full h-screen flex justify-center text-white">
				<div className="flex flex-col w-full max-w-5xl">
					<div className="mx-5 mt-10 md:mx-16 pl-2 text-blue-500 font-bold bg-blue-100 border-l-4 border-blue-500">カレンダー</div>
					{
						!isloading
						? <CalendarComponent jsonData={schema}/>
						: <div className="w-full h-[50%] flex justify-center items-center"><Loading /></div>
					}
				</div>
			</div>
		</>
	)
};

export default MyPage;
