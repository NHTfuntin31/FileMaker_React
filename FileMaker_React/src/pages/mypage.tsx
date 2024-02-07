import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
// import { Evenodd_bot, Evenodd_left } from "../component/icon/evenodd";
import { Evenodd_left } from "../component/icon/evenodd";
import Calendar from "./calendar";
import { Header } from "../component/Header";
import { userInfo } from "../api/FileMakerApi";

interface MenuItem {
	MenuNo: number;
	DisplayName: string[];
	Link: string[];
}

interface DropdownMenuProps {
	menu: MenuItem;
	isOpen: boolean;
	toggleDropdown: () => void;
}
const MyPage = () => {
	const navigate = useNavigate();
	// const [profile, setProfile] = useState<boolean>(false)

	const [menuStates, setMenuStates] = useState<{ [key: number]: boolean }>({});

	const userData = userInfo()
	const sessionUserRef = useRef(userData);

	useEffect(() => {
		if (!userData) {
			navigate("/")
		}
	}, [navigate, userData])
	if (!userData) {
		return <></>
	}


	// const UserMenu = () => {
	// 	return (
	// 		sessionUserRef.current.Menu[0].DisplayName.slice(1).map((item: string, index: number) => (
	// 			<a key={index} href={sessionUserRef.current.Menu[0].Link[index]} className="text-gray-700 block px-4 py-2 text-sm" role="menuitem" id={`menu-item-${index}`}>
	// 				{item}
	// 			</a>
	// 		))
	// 	);
	// };

	const TaskMenu: React.FC<DropdownMenuProps> = ({ menu, isOpen, toggleDropdown }) => {
		return (
			<ul className="pt-2">
				<li className="mb-2">
					<a
						data-te-collapse-init
						role="button"
						className="flex items-center px-2 hover:bg-secondary-100 focus:text-primary active:text-primary
						font-bold
						"
						onClick={toggleDropdown}
					>
						<Evenodd_left />
						Menu {menu.MenuNo}
					</a>
					{isOpen && (
						<ul className="!visible">
							{menu.DisplayName.map((item: string, index: number) => (
								<li key={index} className="ml-4 px-2 hover:bg-secondary-100 mb-1">
									<a href={menu.Link[index]}>{item}</a>
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
			<div className="bg-sky-600 w-full h-screen flex flex-col text-white">
				{/* <div className="flex justify-between px-5 py-4">
					<div>FILEMAKER</div>
					<div>
						<div className="relative inline-block text-left">
							<div>
								<button type="button" className="inline-flex w-full justify-center gap-x-1.5 rounded-full bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
									onClick={() => setProfile(!profile)}
								>
									{userData.UserInfo.Name}
									<Evenodd_bot />
								</button>
							</div>
							{
								profile && (
									<div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="menu-button" >
										<div className="py-1" role="none">
											<UserMenu />
										</div>
									</div>
								)
							}
						</div>
					</div>
				</div> */}
				


				<div className="flex flex-col bg-slate-800 h-svh md:justify-between">
					<div className="hidden w-full md:w-1/5 md:flex-col">
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
					<div className="bg-white w-full content-center flex items-center justify-center">
						<div className="w-full max-w-5xl">
							<div className="mx-5 mt-10 md:mx-16 pl-2 text-blue-500 font-bold bg-blue-100 border-l-4 border-blue-500">カレンダー</div>
							<Calendar />
						</div>
					</div>
				</div>
			</div>
		</>
	)
};

export default MyPage;
