import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

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
	const [profile, setProfile] = useState<boolean>(false)

	const [menuStates, setMenuStates] = useState<{ [key: number]: boolean }>({});

	const storedData = localStorage.getItem("isUser");
	const userData = storedData ? JSON.parse(storedData) : "";

	useEffect(()=>{
		const storedData = localStorage.getItem("isUser");
		!storedData ? navigate("/") : null;
	},[navigate])

	const sessionUserRef = useRef(userData);

	const UserMenu = () => {
		return (
			sessionUserRef.current.Menu[0].DisplayName.map((item: string, index: number) => (
				<a key={index} href={sessionUserRef.current.Menu[0].Link[index]} className="text-gray-700 block px-4 py-2 text-sm" role="menuitem" id={`menu-item-${index}`}>
					{item}
				</a>
			))
		);
	};

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
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="2.5"
							stroke="currentColor"
							className="h-4 w-4">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M8.25 4.5l7.5 7.5-7.5 7.5" />
						</svg>
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
			<div className="bg-sky-600 w-full h-screen flex flex-col text-white">
				<div className="flex justify-between px-5 py-4">
					<div>FILEMAKER</div>
					<div>
						<div className="relative inline-block text-left">
							<div>
								<button type="button" className="inline-flex w-full justify-center gap-x-1.5 rounded-full bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
									onClick={() => setProfile(!profile)}
								>
									{userData.UserInfo.Name}
									<svg className="-mr-1 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
										<path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
									</svg>
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
				</div>
				
				<div className="flex bg-slate-800 h-svh justify-between">
					<div className="w-1/5">
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
					<div className="bg-lime-300 w-4/5">Item4</div>
				</div>
			</div>
		</>
	)
};

export default MyPage;
