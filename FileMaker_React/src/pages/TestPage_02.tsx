import { useState } from "react"

const Testiti = () => {

    const [profile, setProfile] = useState<boolean>(false)

    return (
        <>
            <div className="bg-sky-600 w-full h-screen flex flex-col text-white">
                <div className="bg-black flex justify-between px-5 py-4">
                    <div>
						<ul className="bg-slate-300 flex gap-5 text-center">
							<li className="bg-orange-400 p-1 border-solid rounded-lg">Menu1</li>
							<li className="bg-orange-400 p-1">menu2</li>
							<li className="bg-orange-400 p-1">menu3</li>
							<li className="bg-orange-400 p-1">menu4</li>
							<li className="bg-orange-400 p-1">menu5</li>
						</ul>
					</div>
                    <div>
                        <div className="relative inline-block text-left">
                            <div>
                                <button type="button" className="inline-flex w-full justify-center gap-x-1.5 rounded-full bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                    onClick={() => setProfile(!profile)}
                                >
                                    Options
                                    <svg className="-mr-1 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                            {
                                profile && (
                                    <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="menu-button" >
                                        <div className="py-1" role="none">
                                            <a href="#" className="text-gray-700 block px-4 py-2 text-sm" role="menuitem" id="menu-item-0">Account settings</a>
                                            <a href="#" className="text-gray-700 block px-4 py-2 text-sm" role="menuitem" id="menu-item-1">Support</a>
                                            <a href="#" className="text-gray-700 block px-4 py-2 text-sm" role="menuitem" id="menu-item-2">License</a>
                                            <form method="POST" action="#" role="none">
                                                <button type="submit" className="text-gray-700 block w-full px-4 py-2 text-left text-sm" role="menuitem" id="menu-item-3">Sign out</button>
                                            </form>
                                        </div>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Testiti