import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../component/Header";
import { useGetCash, useGetHoliday, useGetSchema, useLogin, userInfo } from "../api/FileMakerApi";
import CalendarComponent from "../component/CalendarComponent";
import { Loading } from "../component/icon/loading";
import { CahchierComponent } from "../component/CahchierComponent";

const MyPage = () => {
	const navigate = useNavigate();
	const doctor_ID: string = userInfo(true);
	const [menuNo, setMenuNo] = useState("61")
	useEffect(() => {
		if (!doctor_ID) {
			navigate("/")
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const {error: login_err} = useLogin(doctor_ID);
	const {isFetching: schema_fetching, error: schema_err} = useGetSchema(doctor_ID);
	const {isFetching: cash_fetching, error: cash_err} = useGetCash(doctor_ID);
	const {isFetching: holiday_fetching, error: holiday_err} = useGetHoliday();

	if( schema_fetching || cash_fetching || holiday_fetching ) {
		return (
		<>
			<Header />
			<div className="bg-white w-full h-screen flex justify-center text-white">
				<div className="w-full h-[50%] flex justify-center items-center">
					<Loading />
				</div>
			</div>
		</>
		)
	}

	if(schema_err || cash_err || holiday_err) {
		console.log(schema_err, cash_err, holiday_err, login_err);
		return(
			<>
				メンテナンス中です。
				またお戻りください。
				大変申し訳ございません。
			</>
		)
	}

	const storedData = localStorage.getItem("isLogin");
	const userData = storedData ? JSON.parse(storedData) : "";

	const UserDisplay = userData?.Menu?.filter((f: any) => f.MenuNo == 6)

	const TaskMenu = () => {
		return (
				<ul className="w-full flex gap-1 max-w-5xl">
					{
						UserDisplay?.slice(1).map((item: any, index: number) => {
							return (
								<li key={index}
								className={"border p-2 rounded-t-xl cursor-pointer whitespace-nowrap hover:bg-gray-100 "
											+ (`${item?.MenuNo}${item?.Function[0]}` == menuNo && "bg-gray-100")}
								onClick={() => setMenuNo(`6${item?.Function}`)}>
									{item?.DisplayName}
								</li>
							)
						})
					}
				</ul>
		);
	};

	return (
		<>
			<Header />
			<div className="w-full mt-6 flex items-center justify-center">
				<TaskMenu />
			</div>
			<div className="bg-gray-100 w-full flex justify-center">
				<div className="bg-white flex flex-col w-full max-w-5xl">
					<div className="w-full h-3 bg-gray-100"></div>
					<div className={menuNo != "61" ? "hidden" : "block"}>
						<div className="mx-5 mt-10 md:mx-16 pl-2 text-blue-500 font-bold bg-blue-100 border-l-4 border-blue-500">カレンダー</div>
						<CalendarComponent />
					</div>
					<div className={menuNo != "62" ? "hidden" : "block"}>
						<div className="mx-5 mt-10 md:mx-16 pl-2 text-blue-500 font-bold bg-blue-100 border-l-4 border-blue-500">出納帳管理</div>
						<CahchierComponent />
					</div>
				</div>
			</div>
		</>
	)
};

export default MyPage;
