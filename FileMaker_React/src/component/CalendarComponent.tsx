import React, { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { DetailsModal, RegisterModal, RequestModal } from "./Modal";
import { PostChange } from "./Req/PostChange";
import { useForm } from "react-hook-form";
import { DoctorUpdateTest } from "../utils/validationSchema";
import { zodResolver } from "@hookform/resolvers/zod";
// import { FormProvider, useForm } from "react-hook-form";

const cn = (...inputs: any) => twMerge(clsx(inputs));

/************************************
	type
************************************/

type ScheduleType = {
	edoctor_id: string;
	id: number;
	no: number;
	tarrget_date: string;
	display_char: string;
	job_no: string;
	time_zone: string;
	times: string;
	start_time: any;
	end_time: any;
	classification: string;
	cancel: boolean;
	factory_name: string;
	address: string;
	overview: string;
	detail: string;
};

type ScheduleCalendarProps = {
	id?: string;
	schedules: ScheduleType[];
	className?: string;
	defaultYear?: number;
	defaultMonth?: number;
	startOnMonday?: boolean;
};

/************************************
	animation
************************************/

//操作スピードを計算
const swipePower = (offset: number, velocity: number) => {
	return Math.abs(offset) * velocity;
};

const variants = {
	enter: (direction: number) => {
		return {
			y: direction > 0 ? 100 : direction === 0 ? 0 : -100,
			opacity: 0,
		};
	},
	center: {
		zIndex: 1,
		y: 0,
		opacity: 1,
	},
	exit: (direction: number) => {
		return {
			zIndex: 0,
			y: direction < 0 ? 100 : -100,
			opacity: 0,
		};
	},
};

const swipeConfidenceThreshold = 100;

const CarouselArea = ({ page, direction, children, onPrev, onNext }: any) => {
	return (
		<motion.div
			className="slider-item h-[100%] w-[100%]"
			key={page}
			custom={direction}
			variants={variants}
			initial="enter"
			animate="center"
			exit="exit"
			transition={{
				y: { type: "spring", stiffness: 300, damping: 15 },
				opacity: { duration: 0.5 },
			}}
			drag="y"
			dragConstraints={{ left: 0, right: 0 }}
			dragElastic={1}
			onDragEnd={(_e: any, { offset, velocity }) => {
				const swipe = swipePower(offset.y, velocity.y);
				if (swipe < -swipeConfidenceThreshold) {
					onNext();
				} else if (swipe > swipeConfidenceThreshold) {
					onPrev();
				}
			}}
			onWheel={(e: any) => {
				const delta = e.deltaY;
				if (Math.abs(delta) > 1) {
					if (delta > 0) {
						onNext();
					} else if (delta < 0) {
						onPrev();
					}
				}
			}}
		>
			{children}
		</motion.div>
	);
};

/************************************
	calendar
************************************/

//3 -> 03, 13 -> 13
const toDouble: any = (number: number) => {
	return `0${String(number)}`.slice(-2);
};
const caculatorMonth: any = (year: number, month: number) => {
	let yy = year;
	let mm = month;
	if (month === 13) {
		yy += 1;
		mm = 1;
	} else if (month === 0) {
		yy -= 1;
		mm = 12;
	}

	return [yy, mm];
};

const init = () => {
	return ["", "", "", "", "", "", ""];
};

const getData = (yy: number, mm: number, startOnMonday: boolean) => {
	//Mon Jan 01 2024 00:00:00 GMT+0900 (日本標準時)
	const first = new Date(yy, mm - 1, 1);
	//Wed Jan 31 2024 00:00:00 GMT+0900 (日本標準時)
	const last = new Date(yy, mm, 0);

	const last_demo = new Date(yy, mm - 1, 0);

	//何曜日かを確認
	//1 2 3 4 5 6 0
	let firstWeek = first.getDay();

	//30 31 29
	const lastDate = last.getDate();
	const lastDate_m = last_demo.getDate();

	const result = []; //週
	let weekArray = init(); //週の7日間

	//何曜日かを変更
	//0 1 2 3 4 5 6
	if (startOnMonday) {
		if (firstWeek == 0) {
			firstWeek = 6;
		} else {
			firstWeek = firstWeek - 1;
		}
	}
	const firstWeek_pro = firstWeek;
	for (let i = 1; i <= 7; i += 1) {
		if (firstWeek_pro - i >= 0) {
			weekArray[firstWeek_pro - i] = String(lastDate_m - i + 1);
		}
	}

	for (let i = 1; i <= lastDate; i += 1) {
		weekArray[firstWeek] = String(i);

		if (i === lastDate) {
			for (let y = 1; y <= 7; y += 1) {
				if (weekArray[firstWeek + y] == "") {
					weekArray[firstWeek + y] = String(y);
				}
			}
		}

		if (firstWeek === 6 || i === lastDate) {
			result.push(weekArray);

			weekArray = init();
			firstWeek = -1;
		}

		firstWeek += 1;
	}
	return result;
};

const getCalendar = (year: number, month: number, startOnMonday: boolean) => {
	let yy = year;
	let mm = month;
	if (month === 13) {
		yy += 1;
		mm = 1;
	} else if (month === 0) {
		yy -= 1;
		mm = 12;
	}

	// const yy_m = (mm - 1) == 0 ? yy - 1 : yy
	const yy_p = mm + 1 == 13 ? yy + 1 : yy;
	// const mm_m = (mm - 1) == 0 ? 12 : mm - 1
	const mm_p = mm + 1 == 13 ? 1 : mm + 1;

	// const calendar_m = getData(yy_m, mm_m, startOnMonday);
	const calendar = getData(yy, mm, startOnMonday);
	const calendar_p = getData(yy_p, mm_p, startOnMonday);
	const result = [
		// { year: yy_m, month: mm_m, calendar: calendar_m },
		{ year: yy, month: mm, calendar: calendar },
		{ year: yy_p, month: mm_p, calendar: calendar_p },
	];

	return result;
};

const WeekHeader = ({ startOnMonday }: { startOnMonday: any }) => {
	return (
		<div className="week-header z-[999] grid w-[100%] grid-cols-7 border border-gray-200 text-center text-sm font-bold shadow-sm">
			{startOnMonday ? null : (
				<span className="py-3 text-xs text-red-400">日</span>
			)}
			<span className="py-3 text-xs">月</span>
			<span className="py-3 text-xs">火</span>
			<span className="py-3 text-xs">水</span>
			<span className="py-3 text-xs">木</span>
			<span className="py-3 text-xs">金</span>
			<span className="py-3 text-xs text-blue-400">土</span>
			{startOnMonday ? (
				<span className="py-3 text-xs text-red-400">日</span>
			) : null}
		</div>
	);
};

const WeekRow = ({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) => {
	return (
		<div
			className={cn(
				"flex w-[100%] flex-1 border-b border-gray-100 text-center",
				className
			)}
		>
			{children}
		</div>
	);
};

const Calendar = (props: any) => {
	const { year, month, schedules, onClick, startOnMonday, selectedDay } = props;
	const data = getCalendar(year, month, startOnMonday);
	return (
		<div className="flex gap-1 flex-col">
			{data.map((item: any, index: number) => (
				<div className="flex h-[100%] w-[100%] flex-1 flex-col" key={index}>
					<h2 className="heading-2 text-xl font-bold mt-3 ml-2">
						{item.year}年{toDouble(item.month)}月
					</h2>
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
											{/* {((index == 0 && key < 2) || (index == 2 && key > 2))
												? ""
												: 
												( */}
											<div
												key={`day-${_key}`}
												className={cn(
													`flex flex-1 flex-col py-1 text-base font-medium`,
													(key == 0 && +e > 15) || (key > 1 && +e < 7)
														? "bg-gray-400 opacity-50"
														: ""
												)}
											>
												<div>
													<span
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
														className={
															"cursor-pointer hover:bg-sky-500 hover:text-white py-1 px-2 rounded-full transition duration-200 ease-in-out" +
															(selectedDay ==
																`${item.year}/${toDouble(
																	item.month
																)}/${toDouble(e)}` &&
																!((key == 0 && +e > 15) || (key > 1 && +e < 7))
																? " bg-sky-500 text-white"
																: "")
														}
													>
														{e}
													</span>
												</div>

												<div className="mt-1 flex justify-center gap-[2px]">
													{schedules
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
														))}
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
	);
};

/************************************
	Information
************************************/

const Information = (content: string, schedules: any, setOpenModalRegister?: any): ReactNode => {
	const matchingSchedules = schedules.filter(
		(item: any) => item.tarrget_date === content
	);

	const form = useForm({
		resolver: zodResolver(DoctorUpdateTest),
	});
	// const methods = useForm();

	const [openModal, setOpenModal] = useState(false);

	const onSubmit = (data: any) => {
		console.log(data);
	}
	return (
		<div className="">
			<h4 className="hidden text-2xl text-center md:block">{content}</h4>
			<button 
				className="border rounded-lg p-2 bg-sky-100 text-black hover:font-bold transition duration-500 ease-in-out mb-3 md:hidden"
				onClick={() => setOpenModalRegister(true)}
				>
				スケジュールを追加
			</button>
			{matchingSchedules.map((item: any) => (
				<div key={item.id} className="whitespace-pre-line mb-4">
					{/* <h4 className="text-2xl text-center">{content}</h4> */}
					<div
						className="bg-white border rounded-md p-2 hover:bg-slate-600 hover:text-white cursor-pointer transition duration-500 ease-in-out"
						onClick={() => setOpenModal(true)}
					>
						{item.overview} <br />
						{item.factory_name} <br />
						{item.times} <br />
					</div>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<RequestModal
							status={openModal}
							changeStatus={()=>{
								form.reset()
								setOpenModal(false)
							}}
							title={`${content} ⁂ ${item.overview}`}
							hopital={item.factory_name}
							submit={form.handleSubmit(onSubmit)}
						>
							<PostChange jobInfo={item} form={form} />
						</RequestModal>
					</form>
				</div>
			))}
		</div>
	);
};

/************************************
	schedule component
************************************/

export const ScheduleCalendar = (props: ScheduleCalendarProps) => {
	const { id, schedules, className, defaultYear, defaultMonth, startOnMonday } =
		props;
	let t: any = null;
	if (defaultYear && defaultMonth) {
		t = new Date(`${defaultYear}-${defaultMonth}-1`);
	} else {
		t = new Date();
	}
	const [y, setY]: any = useState(t.getFullYear());
	const [m, setM]: any = useState(t.getMonth() + 1);
	const [content, setContent] = useState("");

	const [openModalInfo, setOpenModalInfo] = useState(false);
	const [openModalRegister, setOpenModalRegister] = useState(false);
	const [[page, direction], setPage] = React.useState([0, 0]);

	const paginate = (newDirection: number) => {
		setPage([page + newDirection, newDirection]);
	};

	const onClick = (y: any, m: any, d: any, t?: any) => {
		console.log(t ? `${y}-${m}-${d}-${t}` : `${y}-${m}-${d}`);
		setContent(
			t
				? `${y}/${toDouble(m)}/${toDouble(d)}/${t}`
				: `${y}/${toDouble(m)}/${toDouble(d)}`
		);
		setOpenModalInfo(true);
	};

	const onNext = () => {
		paginate(1);
		if (m < 12) {
			setM(m + 1);
		} else {
			setY(y + 1);
			setM(1);
		}
	};

	const onPrev = () => {
		paginate(-1);
		if (m > 1) {
			setM(m - 1);
		} else {
			setY(y - 1);
			setM(12);
		}
	};

	return (
		<div id={id} className={cn("flex w-[100%] flex-col", className)}>
			{/* <div className="calendar-header mb-3 flex w-[100%] items-center justify-between px-1">
				<div className="buttons mt-1 flex items-center gap-5 text-sm font-black">
					<button onClick={onPrev}>先月</button>
					<button onClick={onNext}>来月</button>
				</div>
			</div> */}
			<div className="flex md:gap-2">
				<div className="flex gap-2 w-full md:w-1/2">
					<div className="h-[100%] w-[100%] flex-1 select-none">
						<div
							id={id}
							className="flex h-[100%] w-[100%] select-none flex-col overflow-hidden rounded-md shadow-md"
						>
							<AnimatePresence>
								<CarouselArea
									page={page}
									direction={direction}
									onNext={onNext}
									onPrev={onPrev}
								>
									<Calendar
										year={y}
										month={m}
										onClick={onClick}
										schedules={schedules}
										startOnMonday={startOnMonday}
										selectedDay={content}
									/>
								</CarouselArea>
							</AnimatePresence>
						</div>
					</div>
				</div>
				<div
					className={content ? "hidden md:block md:w-1/2 md:ml-10" : "hidden"}
				>
					{Information(content, schedules)}
					<button
						className="border rounded-lg p-2 hover:bg-sky-300 hover:text-white hover:font-bold transition duration-500 ease-in-out"
						onClick={() => setOpenModalRegister(true)}
					>
						スケジュールを追加
					</button>
				</div>
				<div>
					<RegisterModal
						status={openModalRegister}
						changeStatus={setOpenModalRegister}
						title={content}
					>
						<p className="text-white">情報を入力</p>
					</RegisterModal>
				</div>
				<div>
					<DetailsModal
						status={openModalInfo}
						changeStatus={setOpenModalInfo}
						title={content}
					>
						{Information(content, schedules, setOpenModalRegister)}
					</DetailsModal>
				</div>
			</div>
		</div>
	);
};
