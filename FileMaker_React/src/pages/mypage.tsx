import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../component/Header";
import { LoginApi, getCashFAKE, getSchema, userInfo } from "../api/FileMakerApi";
import CalendarComponent from "../component/CalendarComponent";
import { Loading } from "../component/icon/loading";
import { CahchierComponent } from "../component/CahchierComponent";
import { useDispatch } from "react-redux";
import { createSchedule } from "../redux/schemaSlice";

const MyPage = () => {
	const navigate = useNavigate();
	const [isloading, setIsloading] = useState(false)
	const [cash, setCash] = useState<string | undefined>()
	const doctor_ID: string = userInfo(true);
	const dispatch = useDispatch()

	const fetchSchema = async (id: string) => {
		setIsloading(true)
		const data = await getSchema(id)
		dispatch(createSchedule(data))
		const cashData = await getCashFAKE()
		setCash(cashData)
		setIsloading(false)
	}

	const fetchLogin = async() => {
		await LoginApi(doctor_ID)
	} 

	useEffect(() => {
		fetchSchema(doctor_ID)
		fetchLogin()
		if (!doctor_ID) {
			navigate("/")
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const storedData = localStorage.getItem("isLogin");
	const userData = storedData ? JSON.parse(storedData) : "";
	const [menuNo, setMenuNo] = useState("61")

	const UserDisplay = userData?.Menu.find((f: any) => f.MenuNo == 6)

	const TaskMenu = () => {
		return (
			<div className="w-full">
				<ul className="w-full flex justify-center items-center gap-1">
					{
						UserDisplay.DisplayName.map((item: any, index: number) => {
							return (
								<li key={index}
								className="border p-2 rounded-t-xl cursor-pointer whitespace-nowrap hover:bg-sky-200 transition duration-200 ease-in-out"
								onClick={() => setMenuNo(`6${index+1}`)}>
									{item}
								</li>
							)
						})
					}
				</ul>
			</div>
		);
	};

	return (
		<>
			<Header />
			<div className="w-full mt-6">
				<TaskMenu />
			</div>
			<div className="bg-white w-full h-screen flex justify-center text-white">
				<div className="flex flex-col w-full max-w-5xl">
					{
						!isloading
							? <>
								<div className={menuNo != "61" ? "hidden" : "block"}>
									<div className="mx-5 mt-10 md:mx-16 pl-2 text-blue-500 font-bold bg-blue-100 border-l-4 border-blue-500">カレンダー</div>
									<CalendarComponent />
								</div>
								<div className={menuNo != "62" ? "hidden" : "block"}>
									<div className="mx-5 mt-10 md:mx-16 pl-2 text-blue-500 font-bold bg-blue-100 border-l-4 border-blue-500">出納帳管理</div>
									<CahchierComponent jsonData={cash}/>
								</div>
							</>
							: <div className="w-full h-[50%] flex justify-center items-center"><Loading /></div>
					}
				</div>
			</div>
		</>
	)
};

export default MyPage;
