import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { CalendarModal } from "./Modal";
import { useForm } from "react-hook-form";
import { DoctorUpdateTest } from "../utils/validationSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ScheduleCalendarProps } from "../utils/interface";
import { Information } from "./HospitalList";
import { PostChange } from "./Req/PostChange";

const cn = (...inputs: any) => twMerge(clsx(inputs));

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
			x: direction > 0 ? 1000 : direction === 0 ? 0 : -1000,
			opacity: 0,
		};
	},
	center: {
		zIndex: 1,
		x: 0,
		opacity: 1,
	},
	exit: (direction: number) => {
		return {
			zIndex: 0,
			x: direction < 0 ? 1000 : -1000,
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
				x: { type: "spring", stiffness: 300, damping: 30 },
				opacity: { duration: 0.2 },
			}}
			drag="x"
			dragConstraints={{ left: 0, right: 0 }}
			dragElastic={1}
			onDragEnd={(_e, { offset, velocity }) => {
				const swipe = swipePower(offset.x, velocity.x);
				if (swipe < -swipeConfidenceThreshold) {
					onNext();
				} else if (swipe > swipeConfidenceThreshold) {
					onPrev();
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

	const calendar = getData(yy, mm, startOnMonday);
	const result = [
		{ year: yy, month: mm, calendar: calendar },
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
	const today = `${(new Date().getFullYear())}/${(new Date().getMonth() + 1)}/${(new Date().getDate())}`;

	return (
		<div className="flex gap-1 flex-col">
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
														
														className={ today == `${item.year}/${item.month}/${e}` ?
															"px-2 py-1 bg-sky-500 rounded-full" : ""
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

	const [openModalRegister, setOpenModalRegister] = useState(false);
	const [[page, direction], setPage] = React.useState([0, 0]);

	const form = useForm({
		resolver: zodResolver(DoctorUpdateTest),
	});

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
	};
	const onSubmit = (data: any) => {
		console.log(data);
		//追加フォーム
	}

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
			<div className="calendar-header mb-3 flex w-[100%] items-center justify-between px-1">
				<h2 className="heading-2 text-xl font-bold">
					{y}年{toDouble(m)}月
				</h2>
				<div className="buttons mt-1 flex items-center gap-5 text-sm font-black">
					<button onClick={onPrev}>先月</button>
					<button onClick={onNext}>来月</button>
				</div>
			</div>
			<div className="flex flex-col md:gap-2">
				<div className="flex gap-2 w-full">
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
					className=""
				>
					<div className="pl-2 text-blue-500 font-bold bg-blue-100 border-l-4 border-blue-500 mt-14 mb-5">案件詳細</div>
					{Information(content, schedules)}
					<div className="flex justify-center py-2">
						<button
							className="w-2/3 border rounded-lg p-2 bg-sky-400 hover:bg-sky-700 hover:text-white hover:font-bold transition duration-500 ease-in-out"
							onClick={() => setOpenModalRegister(true)}
						>
							スケジュールを追加
						</button>
					</div>

				</div>

				{/* スケジュールを追加モダール */}
				<div>
				<form onSubmit={form.handleSubmit(onSubmit)}>
							<CalendarModal
								status={openModalRegister}
								changeStatus={() => {
									form.reset()
									setOpenModalRegister(false)
								}}
								title={`${content} ⁂ スケジュールを追加`}
								submit={form.handleSubmit(onSubmit)}
							>
								<PostChange jobInfo="" form={form}/>
							</CalendarModal>
						</form>
				</div>
			</div>
		</div>
	);
};
