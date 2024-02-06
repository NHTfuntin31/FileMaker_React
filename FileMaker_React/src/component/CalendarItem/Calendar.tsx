import { Item, Menu, Separator, Submenu, useContextMenu } from "react-contexify";
import { WeekHeader, WeekRow, caculatorMonth, cn, getCalendar, toDouble } from "./Effect";
import { timeObj } from "../object"


import 'react-contexify/ReactContexify.css';


export const Calendar = (props: any) => {
	const { year, month, onClick, startOnMonday, selectedDay } = props;
	const data = getCalendar(year, month, startOnMonday);
	const today = `${(new Date().getFullYear())}/${(new Date().getMonth() + 1)}/${(new Date().getDate())}`;

	const MENU_ID = "menu-id";

	const { show } = useContextMenu({
		id: MENU_ID
	});

	// function handleItemClick({ event, props, triggerEvent, data }: { event?: any, props?: any, triggerEvent?: any, data?: any }) {
	// 	console.log(event, props, triggerEvent, data);
	// }

	const handleItemClick = ({ id, event, props }: { id?: string, event?: any, props?: any }) => {
		switch (id) {
			case "copy":
				console.log(event, props)
				break;
			case "cut":
				console.log(event, props);
				break;
			//etc...
		}
	}

	function handleContextMenu(event: any) {
		show({
			event,
			props: {
				key: 'value'
			}
		})
	}

	return (
		<>
			<Menu id={MENU_ID} className="z-50">
				<Item id="copy" onClick={handleItemClick}>Copy</Item>
				<Item id="cut" onClick={handleItemClick}>Cut</Item>
				<Separator />
				<Item disabled>Disabled</Item>
				<Separator />
				<Submenu label="Foobar">
					<Item id="reload" onClick={handleItemClick}>Reload</Item>
					<Item id="something" onClick={handleItemClick}>Do something else</Item>
				</Submenu>
			</Menu>
			<div className="flex gap-1 flex-col z-1">
				{data.map((item: any, index: number) => (
					<div className="flex h-[100%] w-[100%] flex-1 flex-col" key={index}>
						<WeekHeader startOnMonday={startOnMonday} />
						{item.calendar.map((week: string[], key: number) => {
							return (
								<WeekRow
									className="border-b border-l border-r border-gray-200"
									key={`${item.year}-${item.month}-${key}`}
								>
									{week.map((e, _key) => {
										return (
											<>
												<div
													key={`day-${_key}`}
													className={cn(
														`flex flex-1 flex-col py-1 border-x text-base font-medium h-20 md:h-28 cursor-pointer hover:bg-sky-500`,
														(key == 0 && +e > 15) || (key > 1 && +e < 7)
															? "bg-gray-400 opacity-50"
															: (selectedDay ==
																`${item.year}/${toDouble(
																	item.month
																)}/${toDouble(e)}`) &&
																!((key == 0 && +e > 15) || (key > 1 && +e < 7))
																? " bg-sky-500 text-white"
																: ""
													)}
													onClick={() =>
														key === 0 && +e > 15
															? onClick(
																...caculatorMonth(
																	item.year,
																	item.month - 1
																),
																e
															)
															: key > 1 && +e < 7
																? onClick(
																	...caculatorMonth(
																		item.year,
																		item.month + 1
																	),
																	e
																)
																: onClick(item.year, item.month, e)
													}
												>
													<div>
														<span

															className={today == `${item.year}/${item.month}/${e}` ?
																"px-2 py-1 bg-sky-500 rounded-full" : ""
															}
														>
															{e}
														</span>
													</div>

													<div className="mt-1 flex flex-col justify-center gap-[1px] p-1 mx-2">
														{/* {schedules
															?.filter(
																(s: any) =>
																	s.tarrget_date ===
																	`${item.year}/${toDouble(
																		item.month
																	)}/${toDouble(e)}` &&
																	!((key === 0 && +e > 15) || (key > 1 && +e < 7))
															)
															.map((s: any, key_: number) => (
																<span
																	key={`${item.year}${item.month}${e}${key_}`}
																	className=""
																	// style={{ background: s.color }}
																	onClick={() =>
																		onClick(item.year, item.month, e, s.time)
																	}
																>
																	{s.display_char}
																</span>
															))} */}
														{
															timeObj.map((s: any) => {
																if (!((key === 0 && +e > 15) || (key > 1 && +e < 7))) {
																	return (
																		<span
																			className={`bg-${s.color} rounded-lg text-sm text-black hover:opacity-50`}
																			onContextMenu={handleContextMenu}
																		>{s.label}</span>
																	)
																}
															})
														}
													</div>
												</div>
												{/* )} */}
											</>
										);
									})}
								</WeekRow>
							);
						})}
					</div>
				))}
			</div>
		</>

	);
};