import { Item, Menu, useContextMenu } from "react-contexify";
import { WeekHeader, WeekRow, caculatorMonth, cn, getCalendar, toDouble } from "./Effect";
import { shifts } from "../ArrObject"
import { CalendarModal } from "../Modal";
import { ScheduleReq } from "../Req/ScheduleReq";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DoctorUpdateTest } from "../../utils/validationSchema";
import { getSchema, postSchema, putSchema, userInfo } from "../../api/FileMakerApi";
import { ScheduleTypeI } from "../../utils/interface";
import { useSelector } from "react-redux";
import { createSchedule } from "../../redux/schemaSlice";
import { useDispatch } from "react-redux";
import { formatTime, isTimeInRange } from "./timeCheck";
import 'react-contexify/ReactContexify.css';
import { pasteCopy } from "../../redux/schemaCopySlice";


export const Calendar = (props: any) => {
	const { year, month, onClick, startOnMonday, selectedDay } = props;

	const TIME_MENU = "time-menu";
	const DAY_MENU = "day-menu";
	const { show: show_time } = useContextMenu({
		id: TIME_MENU
	});
	const { show: show_day } = useContextMenu({
		id: DAY_MENU
	})

	const dispatch = useDispatch()
	const schedules = useSelector((state: any) => state.schedule.schedules).filter((cancel: any) => cancel.cancel === false)

	const schedulesCopy = useSelector((state: any) => state.scheduleCopy.Schedule)

	const calendarData = getCalendar(year, month, startOnMonday)
	const today = `${(new Date().getFullYear())}/${(new Date().getMonth() + 1)}/${(new Date().getDate())}`;

	const [openModal, setOpenModal] = useState(false);

	//右クリック  追加・編集・削除
	const [add, setAdd] = useState("");
	//右クリックが表示・非表示
	const [selectAdd, setSelectAdd] = useState(true)
	const [selectChange, setSelectChange] = useState(true)
	const [selectDelete, setSelectDelete] = useState(true)
	const [classsifi, setClasssifi] = useState<number>();
	const [checkfetch, setcheckfetch] = useState<boolean>(false);

	const result: any[] = []
	const [jobArr, setJobArr] = useState<ScheduleTypeI[]>()

	const doctor_ID = userInfo(true);
	const doctor_Info = userInfo();

	//モダールデータ
	const [defaultData, setDefaultData] = useState({});

	const form = useForm({
		resolver: zodResolver(DoctorUpdateTest),
	});
	

	const fetchSchema = async (id: string) => {
		const data = await getSchema(id);
		dispatch(createSchedule(data));
	};

	useEffect(() => {
		setJobArr(result)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedDay, defaultData])

	useEffect(() => {
		const checkRightClick = () => {
			const element = (jobArr) && jobArr[classsifi!];
			element?.classification === "91"
				? (setSelectAdd(false), setSelectChange(true), setSelectDelete(true))
				: element?.classification == undefined
					? (setSelectAdd(true), setSelectChange(false), setSelectDelete(false))
				: (setSelectAdd(false), setSelectChange(false), setSelectDelete(false))
		}
		checkRightClick()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [jobArr, result])


	const handleItemClick = ({ id, props }: { id?: string, event?: any, props?: any }) => {
		const element = jobArr![props.index] || {};
		let key: any;
		const updatedElement = { ...element, cancel: element.cancel == false ? true : element.cancel };
		const Schedule = {
			Schedule: updatedElement
		}
		const revertData = Object.assign({}, doctor_Info, Schedule);
		console.log(id);
		switch (id) {
			case "add":
				setAdd("add")
				if (props.key == "gozen") {
					key = {
						start_time: "07:00",
						end_time: "14:00"
					}
				} else if (props.key == "gogo") {
					key = {
						start_time: "12:00",
						end_time: "18:00"
					}
				} else if (props.key == "yakin") {
					key = {
						start_time: "18:00",
						end_time: "23:59"
					}
				} else {
					key = {
						start_time: "00:00",
						end_time: "08:00"
					}
				}
				setDefaultData(key)
				setOpenModal(true)
				break;
			case "change":
				setAdd("change")
				console.log(element);
				setDefaultData(element)
				setOpenModal(true)
				break;
			case "delete":
				setAdd("delete")
				console.log(revertData);
				putSchema(JSON.stringify(revertData));
				setcheckfetch(!checkfetch)
				break;
		}
	}

	const handleItemPaste = async () => {
		const Schedule = {
			Schedule : schedulesCopy
		}
		const revertData = Object.assign({}, doctor_Info, Schedule);
		console.log(revertData);
		await postSchema(JSON.stringify(revertData))
		setcheckfetch(!checkfetch)
	}


	const handleContextMenuT = (event: any, index: number, key: string, selectedDay: string) => {
		show_time({
			event,
			props: {
				key: key,
				index: index,
				selectedDay: selectedDay
			}
		})
	}

	const handleContextMenuD = (event: any) => {
		show_day({
			event
		})
	}
	
	useEffect(() => {
		fetchSchema(doctor_ID)
		fetchSchema(doctor_ID)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [openModal, checkfetch])
	const handleDayClick = (lastMonth: boolean, nextMonth: boolean, day: any) => {
		const [year, month] = lastMonth
			? caculatorMonth(calendarData.year, calendarData.month - 1)
			: nextMonth
				? caculatorMonth(calendarData.year, calendarData.month + 1)
				: [calendarData.year, calendarData.month];
		onClick(year, month, day);
		const tarrget_date = `${year}/${toDouble(month)}/${toDouble(day)}`
			console.log(tarrget_date);
			dispatch(pasteCopy(tarrget_date))
	};

	const onSubmit = (data: any) => {

		data.start_time = formatTime(data.start_time);
		data.end_time = formatTime(data.end_time);
		data.id = Number(data.id);
		data.no = Number(data.no);
		
		const key = {
			tarrget_date: selectedDay,
			edoctor_id: doctor_ID,
		}

		const mergedObject = {
			Schedule: Object.assign({}, data, key)
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
				putSchema(JSON.stringify(revertData), setOpenModal);
				break;
			case "delete":
				
				break;
		}

		setcheckfetch(!checkfetch)
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
						<ScheduleReq jobInfo={defaultData} form={form} />
					</CalendarModal>
				</form>
			</div>
			<Menu id={TIME_MENU} className="z-50">
				<Item id="add" onClick={handleItemClick} disabled={!selectAdd}>追加</Item>
				<Item id="change" onClick={handleItemClick} disabled={!selectChange}>編集</Item>
				<Item id="delete" onClick={handleItemClick} disabled={!selectDelete}><p className="text-red-700">削除</p></Item>
			</Menu>
			<Menu id={DAY_MENU} className="z-50">
				<Item id="paste" onClick={handleItemPaste} disabled={!schedulesCopy.edoctor_id}><p className="text-red-700">ペースト</p></Item>
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

									const lastMonth = (key === 0 && +e > 15)
									const nextMonth = (key > 1 && +e < 7)

									return (
										<>
											<div
												key={`day-${_key}`}
												className={cn(`flex flex-1 flex-col py-1 border-x text-base font-medium h-auto md:h-32 cursor-pointer hover:bg-sky-200`,
													(lastMonth || nextMonth)
														? "bg-gray-400 opacity-50"
														: (selectedDay == `${calendarData.year}/${toDouble(calendarData.month)}/${toDouble(e)}`) 
															&& !(lastMonth || nextMonth)
															? " bg-sky-200"
															: ""
												)}
												onClick={() => handleDayClick(lastMonth, nextMonth, e)}
												onContextMenu={() => {handleDayClick(lastMonth, nextMonth, e)}}
											>
												<div 
													onContextMenu={(event: any) => handleContextMenuD(event)}
													>
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
														let [start_time, end_time] = ['', ''];

														const hospital = schedules
															?.filter(
																(s: any) =>
																	s.tarrget_date ===
																	`${calendarData.year}/${toDouble(
																		calendarData.month
																	)}/${toDouble(e)}` &&
																	!(lastMonth || nextMonth)
															)
														
														//選択した日の予定 [{...}, {...}]
														const selectedHospital = schedules?.filter((s: any) => s.tarrget_date === selectedDay)

														selectedHospital.map((job: any, i: number) => {
															[start_time, end_time] = job.times.split('～').map((time: string) => time.replace("：", ":"));
															const includesTime = isTimeInRange(start_time, end_time, shift.start, shift.end)
															includesTime && (result[index] = selectedHospital[i])
															return includesTime
														})

														const checkTimes = hospital.map((time: any) => {
															[start_time, end_time] = time.times.split('～').map((time: string) => time.replace("：", ":"));
															const includesTime = isTimeInRange(start_time, end_time, shift.start, shift.end)
															return includesTime
														})

														if (!(lastMonth || nextMonth)) {
															return (
																<span
																	className={`bg-${checkTimes.includes(true) ? shift.color : `${shift.default} text-gray-400`} font-serif rounded-lg text-xs text-black hover:opacity-50 md:text-sm`}
																	onContextMenu={(event) => {
																		handleContextMenuT(event, index, shift.key, selectedDay),
																		setClasssifi(index)
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