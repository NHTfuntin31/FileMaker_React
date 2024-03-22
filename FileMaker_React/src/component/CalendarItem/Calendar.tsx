import { Item, Menu, useContextMenu } from "react-contexify";
import { WeekHeader, WeekRow, caculatorMonth, cn, getCalendar, toDouble } from "./Effect";
import { shifts } from "../ArrObject"
import { CalendarModal } from "../Modal";
import { ScheduleReq } from "../Req/ScheduleReq";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DoctorUpdateTest } from "../../utils/validationSchema";
import { usePostSchema, usePutSchema, userInfo } from "../../api/FileMakerApi";
import { useSelector, useDispatch } from "react-redux";
import { formatTime, isTimeInRange } from "./timeCheck";
import 'react-contexify/ReactContexify.css';
import { createCopy, pasteCopy } from "../../redux/schemaCopySlice";
import { Icon } from "@iconify/react/dist/iconify.js";
import { toast } from "react-toastify";


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
	const holiday = useSelector((state: any) => state.holiday.Holiday)

	const calendarData = getCalendar(year, month, startOnMonday)
	const today = `${(new Date().getFullYear())}/${(new Date().getMonth() + 1)}/${(new Date().getDate())}`;

	const [openModal, setOpenModal] = useState(false);
	const [view, setView] = useState(false);

	//右クリック  追加・編集・削除
	const [add, setAdd] = useState("");
	//右クリックが表示・非表示

	const doctor_ID = userInfo(true);
	const doctor_Info = userInfo();

	//モダールデータ
	const [defaultData, setDefaultData] = useState({});

	const form = useForm({
		resolver: zodResolver(DoctorUpdateTest),
	});
	
	const postSchemaMutation = usePostSchema(doctor_ID);
	const putSchemaMutation = usePutSchema(doctor_ID);

	const handleItemClick = async ({ id, props }: { id?: string, event?: any, props?: any }) => {
		if(id == "add"){
			setAdd("add")
				setDefaultData({})
				setOpenModal(true)
		}else{
			const element = props?.item;

			//削除------------------------------------------------------------------------------------------
			const updatedElement = { ...element, cancel: element.cancel == false ? true : element.cancel };
			const Schedule = {
				Schedule: updatedElement
			}
			const revertData = Object.assign({}, doctor_Info, Schedule);
			//---------------------------------------------------------------------------------------------

			switch (id) {
				case "change":
					setAdd("change")
					console.log(element);
					setDefaultData(element)
					setOpenModal(true)
					break;
				case "copy":
					toast.info(`${element.tarrget_date}の${element.times}のスケジュールをコピーしました。`)
					dispatch(createCopy(element))
					break;
				case "delete":
					setAdd("delete")
					await putSchemaMutation.mutateAsync(revertData);
					setDefaultData({})
					break;
			}
		}
	}

	const detailFn = (item: any) => {
		setDefaultData(item)
		setView(true)
		setOpenModal(true)
	}

	const handleItemPaste = async () => {
		const Schedule = {
			Schedule : schedulesCopy
		}
		const revertData = Object.assign({}, doctor_Info, Schedule);
		await postSchemaMutation.mutateAsync(revertData)
		setDefaultData({})
	}

	const handleContextMenuT = (event: any, item: any) => {
		show_time({
			event,
			props: {
				item : item
			}
		})
	}

	const handleContextMenuD = (event: any) => {
		show_day({
			event
		})
	}

	function isHoliday(dateString: string) {
		return Object.prototype.hasOwnProperty.call(holiday, dateString);
	}

	const handleDayClick = (lastMonth: boolean, nextMonth: boolean, day: any) => {
		const [year, month] = lastMonth
			? caculatorMonth(calendarData.year, calendarData.month - 1)
			: nextMonth
				? caculatorMonth(calendarData.year, calendarData.month + 1)
				: [calendarData.year, calendarData.month];
		onClick(year, month, day);
		const tarrget_date = `${year}/${toDouble(month)}/${toDouble(day)}`
			dispatch(pasteCopy(tarrget_date))
	};

	const onSubmit = async (data: any) => {

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
		if(add == "delete") {
			revertData.Schedule.cancel = true;
			await putSchemaMutation.mutateAsync(revertData);
			setOpenModal(false)
			form.reset()
			setDefaultData({})
		} else {
				console.log("aa");
			//編集フォーム
			//追加フォーム
			switch (add) {
				case "add" :
					await postSchemaMutation.mutateAsync(revertData)
					setOpenModal(false)
					form.reset()
					break;
				case "change":
					await putSchemaMutation.mutateAsync(revertData)
					setOpenModal(false)
					form.reset()
					break;
			}
		}
	}

	const kirikae = (dl?: any) => {
		if(dl) {
			setAdd("delete")
		}else{
			setAdd("change")
			setView(false)
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
						kirikae={(e: any) => kirikae(e)}
						notFooter={view}
					>
						<ScheduleReq jobInfo={defaultData} form={form} view={view}/>
					</CalendarModal>
				</form>
			</div>
			<Menu id={TIME_MENU} className="z-50">
				<Item id="change" onClick={handleItemClick}>編集</Item>
				<Item id="copy" onClick={handleItemClick}>スケジュールをコピー</Item>
				<Item id="delete" onClick={handleItemClick}><p className="text-red-700">削除</p></Item>
			</Menu>
			<Menu id={DAY_MENU} className="z-50">
				<Item id="add" onClick={handleItemClick}>追加</Item>
				<Item id="paste" onClick={handleItemPaste} disabled={!schedulesCopy.edoctor_id}><p className="">貼り付け</p></Item>
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
									const dd = `${calendarData.year}/${toDouble(calendarData.month)}/${toDouble(e)}`
									const yasumi = isHoliday(dd)

									const today_schedules = schedules?.filter((s: any) => s.tarrget_date === dd && !(lastMonth || nextMonth || yasumi))
									return (
										<>
											<div
												key={`day-${_key}`}
												className={cn(`flex flex-1 flex-col py-1 border-x text-base font-medium h-auto md:h-32 cursor-pointer hover:bg-sky-200`,
													(lastMonth || nextMonth || yasumi)
														? "bg-gray-400 opacity-50"
														: (selectedDay == dd) 
															&& !(lastMonth || nextMonth)
															? " bg-sky-200"
															: ""
												)}
												onClick={() => handleDayClick(lastMonth, nextMonth, e)}
												onContextMenu={(event: any) => {
													handleDayClick(lastMonth, nextMonth, e)
													handleContextMenuD(event)
												}}
											>
												<div>
													<span
														className={today == `${calendarData.year}/${calendarData.month}/${e}` ?
															"px-2 py-1 bg-sky-500 rounded-full text-white" : ""
														}
													>
														{e}
													</span>
												</div>

												<div>
													{ yasumi && <span>{holiday[dd]}</span> }
													{
														today_schedules.map((item: any) => {
															const [start_time, end_time] = item.times.split('～').map((time: string) => time.replace("：", ":"));
															let isTimeIncluded = false;
															let color ="";

															shifts.some((shift: any) => {
																const includesTime = isTimeInRange(start_time, end_time, shift.start, shift.end)
																if(includesTime){
																	isTimeIncluded = true;
																	color = shift.test
																	return true;
																}
																return false;
															})
															return(
																<div className="flex hover:opacity-50 items-center"
																	onContextMenu={(event) => {
																		event.stopPropagation()
																		handleDayClick(lastMonth, nextMonth, e)
																		handleContextMenuT(event, item)
																	}}
																	onClick={() => {
																		detailFn(item)
																	}}
																>
																	{isTimeIncluded && (
																		<span className=""><Icon icon={color} width="15" height="15" /></span>
																	)}
																	<p className="text-sm">{item.overview}</p>
																</div>
															)
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