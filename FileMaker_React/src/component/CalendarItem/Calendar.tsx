import { Item, Menu, useContextMenu } from "react-contexify";
import { WeekHeader, WeekRow, caculatorMonth, cn, getCalendar, toDouble } from "./Effect";
import { shifts } from "../object"

import 'react-contexify/ReactContexify.css';
import { CalendarModal } from "../Modal";
import { PostChange } from "../Req/PostChange";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DoctorUpdateTest } from "../../utils/validationSchema";
import { postSchema, putSchema, userInfo } from "../../api/FileMakerApi";
import { ScheduleType } from "../../utils/interface";

function isTimeInRange(checkStartTime: string, checkEndTime: string, startTime: string, endTime: string) {
	const checkStartHour = parseInt(checkStartTime.split(":")[0], 10);
	const checkEndHour = parseInt(checkEndTime.split(":")[0], 10);
	const startHour = parseInt(startTime.split(":")[0], 10);
	const endHour = parseInt(endTime.split(":")[0], 10);

	return (checkStartHour >= startHour && checkStartHour <= endHour) || (checkEndHour >= startHour && checkEndHour <= endHour);
}


export const Calendar = (props: any) => {
	const { year, month, schedules, onClick, startOnMonday, selectedDay } = props;

	const form = useForm({
		resolver: zodResolver(DoctorUpdateTest),
	});

	const MENU_ID = "menu-id";

	const { show } = useContextMenu({
		id: MENU_ID
	});


	const calendarData = getCalendar(year, month, startOnMonday);

	const today = `${(new Date().getFullYear())}/${(new Date().getMonth() + 1)}/${(new Date().getDate())}`;
	const result: ScheduleType[] = []
	const [test, settest] = useState<ScheduleType[]>()

	const doctor_ID = userInfo(true);
	const doctor_Info = userInfo();

	const [openModal, setOpenModal] = useState(false);
	const [select, setSelect] = useState(true)
	const [defaultData, setDefaultData] = useState({});
	const [add, setAdd] = useState("");
	
	useEffect(() => {
		settest(result)
		setSelect(select)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedDay, handleContextMenu])

	
	const handleItemClick = ({ id, props }: { id?: string, event?: any, props?: any }) => {
		const element = test![props.index] ? test![props.index] : " ";
		console.log(element);
		let key: any;
		switch (id) {
			case "add":
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
				setOpenModal(true)
				break;
			case "change":
				setAdd("change")
				setDefaultData(element)
				setOpenModal(true)
				break;
			case "delete":
				setAdd("delete")
				setOpenModal(true)
				break;
		}
	}

	function handleContextMenu(event: any, index: number ,key: string, selectedDay: string) {
		
		show({
			event,
			props: {
				key: key,
				index: index,
				selectedDay: selectedDay
			}
		})
	}

	function checkRightClick(index: number) {
		// result[index] && result[index]["classification"] !== "91";
		const element = test![index];
		console.log(element.classification);
		element.classification !== "91" ? setSelect(false) : setSelect(true)
	}

	const onSubmit = (data: any) => {

		data.start_time = data.start_time + ':00';
		data.end_time = data.end_time + ':00';

		const key = {
			tarrget_date: selectedDay,
			edoctor_id: doctor_ID,
		}
		const mergedObject = {
			Schedule : Object.assign({}, data, key)
		}
		const revertData = Object.assign({}, doctor_Info, mergedObject);
		console.log(revertData);
		//編集フォーム
		//追加フォーム
		switch (add) {
			case "add":
				postSchema(JSON.stringify(revertData), setOpenModal)
				break;
			case "change":
				putSchema(JSON.stringify(revertData), setOpenModal)
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
						status={openModal}
						changeStatus={() => {
							form.reset()
							setOpenModal(false)
						}}
						title={`${selectedDay}`}
						submit={form.handleSubmit(onSubmit)}
					>
						<PostChange jobInfo={defaultData} form={form} />
					</CalendarModal>
				</form>
			</div>
			<Menu id={MENU_ID} className="z-50">
				<Item id="add" onClick={handleItemClick} disabled={!select}>追加</Item>
				<Item id="change" onClick={handleItemClick} disabled={!select}>編集</Item>
				<Item id="delete" onClick={handleItemClick} disabled={!select}><p className="text-red-700">削除</p></Item>
			</Menu>
			<div className="flex gap-1 flex-col z-1">
					<div className="flex h-[100%] w-[100%] flex-1 flex-col">
						<WeekHeader startOnMonday={startOnMonday} />
						{calendarData.calendar.map((week: string[], key: number) => {
							return (
								<WeekRow
									className="border-b border-l border-r border-gray-200"
									key={`${calendarData.year}-${calendarData.month}-${key}`}
								>
									{week.map((e, _key) => {
										return (
											<>
												<div
													key={`day-${_key}`}
													className={cn(
														`flex flex-1 flex-col py-1 border-x text-base font-medium h-auto md:h-28 cursor-pointer hover:bg-sky-200`,
														(key == 0 && +e > 15) || (key > 1 && +e < 7)
															? "bg-gray-400 opacity-50"
															: (selectedDay ==
																`${calendarData.year}/${toDouble(
																	calendarData.month
																)}/${toDouble(e)}`) &&
																!((key == 0 && +e > 15) || (key > 1 && +e < 7))
																? " bg-sky-200"
																: ""
													)}
													onClick={() =>
														key === 0 && +e > 15
															? onClick(
																...caculatorMonth(
																	calendarData.year,
																	calendarData.month - 1
																),
																e
															)
															: key > 1 && +e < 7
																? onClick(
																	...caculatorMonth(
																		calendarData.year,
																		calendarData.month + 1
																	),
																	e
																)
																: onClick(calendarData.year, calendarData.month, e)
													}
													onContextMenu={() =>
														key === 0 && +e > 15
															? onClick(
																...caculatorMonth(
																	calendarData.year,
																	calendarData.month - 1
																),
																e
															)
															: key > 1 && +e < 7
																? onClick(
																	...caculatorMonth(
																		calendarData.year,
																		calendarData.month + 1
																	),
																	e
																)
																: onClick(calendarData.year, calendarData.month, e)}
												>
													<div>
														<span

															className={today == `${calendarData.year}/${calendarData.month}/${e}` ?
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
																		`${calendarData.year}/${toDouble(
																			calendarData.month
																		)}/${toDouble(e)}` &&
																		!((key === 0 && +e > 15) || (key > 1 && +e < 7))
																)
															
															const selectedHospital = schedules?.filter((s: any) => s.tarrget_date === selectedDay)

															const selectedHospitalList = selectedHospital.filter((s: any) => isTimeInRange(s.start_time, s.end_time, shift.start, shift.end) == true)
															selectedHospitalList.length > 0 ? (result[index] = selectedHospitalList[0]) : null

															const checkTimes = hospital.map((job: any) => {
																[start_time, end_time] = job.times.split('～').map((time: string) => time.replace("：", ":"));
																const includesTime = isTimeInRange(start_time, end_time, shift.start, shift.end)
																job.start_time = start_time
																job.end_time = end_time

																return includesTime
															})
															
															if (!((key === 0 && +e > 15) || (key > 1 && +e < 7))) {
																return (
																	<span
																		className={`bg-${checkTimes.includes(true) ? shift.color : `${shift.default} text-gray-400`} font-serif rounded-lg text-xs text-black hover:opacity-50 md:text-sm`}
																		onContextMenu={(event) => {
																			handleContextMenu(event, index,shift.key, selectedDay),
																			checkRightClick(index)
																		}}
																	>{shift.label}</span>
																)
															}
														})
														}
													</div>
												</div>
											</>
										);
									})}
								</WeekRow>
							);
						})}
					</div>
			</div>
		</>

	);
};