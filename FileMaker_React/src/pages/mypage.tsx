import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../component/Header";
import { LoginApi, getCashFAKE, getSchema, userInfo } from "../api/FileMakerApi";
import CalendarComponent from "../component/CalendarComponent";
import { Loading } from "../component/icon/loading";
import { CahchierComponent } from "../component/CahchierComponent";
import { Evenodd_left } from "../component/icon/evenodd";
import { DropdownMenuProps } from "../utils/interface";

const MyPage = () => {
	const navigate = useNavigate();
	const [isloading, setIsloading] = useState(false)
	const [schema, setschema] = useState(null)
	const [cash, setCash] = useState<string | undefined>()
	const doctor_ID: string = userInfo(true);

	const [menuStates, setMenuStates] = useState<{ [key: number]: boolean }>({});

	const storedData = localStorage.getItem("isLogin");
	const userData = storedData ? JSON.parse(storedData) : "";
	const sessionUserRef = useRef(userData);
	const [menuNo, setMenuNo] = useState("61")

	const fetchSchema = async () => {
		setIsloading(true)
		const data = await getSchema(doctor_ID)
		const cashData = await getCashFAKE()
		setschema(data)
		setCash(cashData)
		setIsloading(false)
	}

	const fetchLogin = async() => {
		await LoginApi(doctor_ID)
	} 

	useEffect(() => {
		fetchSchema()
		fetchLogin()
		if (!doctor_ID) {
			navigate("/")
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const TaskMenu: React.FC<DropdownMenuProps> = ({ menu, isOpen, toggleDropdown }) => {
		const numberMenu = `${menu.MenuNo}${menu.Function[0]}`
		return (
			<ul className="pt-2">
				<li className="mb-2">
					<p
						data-te-collapse-init
						role="button"
						className="flex items-center px-2 hover:bg-secondary-100 focus:text-primary active:text-primary
						font-bold
						"
						onClick={toggleDropdown}
					>
						<Evenodd_left />
						Menu {menu.MenuNo}
					</p>
					{isOpen && (
						<ul className="!visible">
							{menu.DisplayName.map((item: string, index: number) => (
								<li 
									key={index} 
									className="ml-4 px-2 hover:bg-secondary-100 mb-1 cursor-pointer"
									onClick={() => setMenuNo(numberMenu)}
									>
									{item}
								</li>
							))}
						</ul>
					)}
				</li>
			</ul>
		);
	};

	const toggleDropdown = (menuNo: number): void => {
		setMenuStates((prevStates) => ({
			...prevStates,
			[menuNo]: !prevStates[menuNo]
		}));
	};

	return (
		<>
			<Header />
			<div className="w-full flex md:w-1/5 md:flex-col">
						{/* <li className="px-2 hover:bg-secondary-100">One</li> */}
						{/* slice(1). */}
						{sessionUserRef.current.Menu.map((menu: any) => (
							<TaskMenu
								key={menu.MenuNo}
								menu={menu}
								isOpen={menuStates[menu.MenuNo] || false}
								toggleDropdown={() => toggleDropdown(menu.MenuNo)}
							/>
						))}
					</div>
			<div className="bg-white w-full h-screen flex justify-center text-white">
				<div className="flex flex-col w-full max-w-5xl">
					{
						!isloading
							? <>
								<div className={menuNo != "61" ? "hidden" : "block"}>
									<div className="mx-5 mt-10 md:mx-16 pl-2 text-blue-500 font-bold bg-blue-100 border-l-4 border-blue-500">カレンダー</div>
									<CalendarComponent jsonData={schema} />
								</div>
								<div className={menuNo != "71" ? "hidden" : "block"}>
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
