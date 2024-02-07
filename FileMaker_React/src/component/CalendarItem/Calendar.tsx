import { Item, Menu, useContextMenu } from "react-contexify";
import { WeekHeader, WeekRow, caculatorMonth, cn, getCalendar, toDouble } from "./Effect";
import { shifts } from "../object"


import 'react-contexify/ReactContexify.css';
import { CalendarModal } from "../Modal";
import { PostChange } from "../Req/PostChange";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DoctorUpdateTest } from "../../utils/validationSchema";
import { userInfo } from "../../api/FileMakerApi";

function isTimeInRange(checkStartTime: string, checkEndTime: string, startTime: string, endTime: string) {
	const checkStartHour = parseInt(checkStartTime.split(":")[0], 10);
	const checkEndHour = parseInt(checkEndTime.split(":")[0], 10);
	const startHour = parseInt(startTime.split(":")[0], 10);
	const endHour = parseInt(endTime.split(":")[0], 10);

	return (checkStartHour >= startHour && checkStartHour <= endHour) || (checkEndHour >= startHour && checkEndHour <= endHour);
}


export const Calendar = (props: any) => {
	const { year, month, schedules, onClick, startOnMonday, selectedDay } = props;
	const data = getCalendar(year, month, startOnMonday);
	const today = `${(new Date().getFullYear())}/${(new Date().getMonth() + 1)}/${(new Date().getDate())}`;
	const shusei: string[] = []

	const userData = userInfo()
	const doctor_ID = userData.UserInfo.UserID;

	const [openModalRegister, setOpenModalRegister] = useState(false);
	const [defaultData, setDefaultData] = useState({});
	const [content, setContent] = useState("");
	const [add, setAdd] = useState("");

	const form = useForm({
		resolver: zodResolver(DoctorUpdateTest),
	});


	const MENU_ID = "menu-id";

	const { show } = useContextMenu({
		id: MENU_ID
	});

	const handleItemClick = ({ id, props }: { id?: string, event?: any, props?: any }) => {
		setContent(props.selectedDay)
		let key: any;
		switch (id) {
			case "add":
				console.log("add", props.data, props.schema)
				setAdd("add")
				if(props.key == "gozen"){
					key = {
						start_time : "08:00",
						end_time : "12:00"
					}
				} else if (props.key == "gogo"){
					key = {
						start_time : "12:00",
						end_time : "18:00"
					}
				} else {
					key = {
						start_time : "18:00",
						end_time : "22:00"
					}
				}
				setDefaultData(key)
				setOpenModalRegister(true)
				break;
			case "change":
				console.log("change", props.data);
				setAdd("change")
				setDefaultData(props.schema)
				setOpenModalRegister(true)
				break;
			case "delete":
				console.log("delete", props.data, props.schema);
				setAdd("delete")
				setOpenModalRegister(true)
				break;
		}
	}

	function handleContextMenu(event: any, schema: any, key: string, selectedDay: string) {
		show({
			event,
			props: {
				schema: schema,
				key: key,
				selectedDay: selectedDay
			}
		})
	}

	const onSubmit = (data: any) => {
		console.log(data);

		const key = {
			id: null,
			edoctor_id: doctor_ID,
			no: null,
			job_no: null,
			times: "",
			classification: "02",
			cancel: false,
			display_char: "▽"
		}
		//編集フォーム
		const mergedObject = Object.assign({}, data, key);
		console.log(mergedObject);
		
		//追加フォーム
		switch (add) {
			case "add":

				break;
			case "change":

				break;
			case "delete":

				break;
		}
	}

	return (
		<>
			<div>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<CalendarModal
						status={openModalRegister}
						changeStatus={() => {
							form.reset()
							setOpenModalRegister(false)
						}}
						title={`${content}`}
						submit={form.handleSubmit(onSubmit)}
					>
						<PostChange jobInfo={defaultData} form={form} />
					</CalendarModal>
				</form>
			</div>
			<Menu id={MENU_ID} className="z-50">
				<Item id="add" onClick={handleItemClick}>追加</Item>
				<Item id="change" onClick={handleItemClick}>編集</Item>
				<Item id="delete" onClick={handleItemClick}><p className="text-red-700">削除</p></Item>
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
														`flex flex-1 flex-col py-1 border-x text-base font-medium h-auto md:h-28 cursor-pointer hover:bg-sky-500`,
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
														{shifts.map((shift: any, index: number) => {
															let start_time: string = ""
															let end_time: string = ""
															const hospital = schedules
																?.filter(
																	(s: any) =>
																		s.tarrget_date ===
																		`${item.year}/${toDouble(
																			item.month
																		)}/${toDouble(e)}` &&
																		!((key === 0 && +e > 15) || (key > 1 && +e < 7))
																)
																
																const checkTimes = hospital.map((s: any) => {
																	[start_time, end_time] = s.times.split('～').map((time: string) => time.replace("：", ":"));
																	const test = isTimeInRange(start_time, end_time, shift.start, shift.end)
																	s.start_time = start_time
																	s.end_time = end_time
																	test && (shusei[index] = s)
																	return test
																})
																
															if (!((key === 0 && +e > 15) || (key > 1 && +e < 7))) {
																return (
																	<span
																		className={`bg-${checkTimes.includes(true) ? shift.color : `${shift.default} text-gray-400`} font-serif rounded-lg text-xs text-black hover:opacity-50 md:text-sm`}
																		onContextMenu={(e) => handleContextMenu(e,  shusei[index], shift.key, selectedDay)}
																	>{shift.label}</span>
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