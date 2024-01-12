import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs: any) => twMerge(clsx(inputs));

/************************************
	type
************************************/

type ScheduleType = {
	color: string;
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
			onDragEnd={(_e: any, { offset, velocity }) => {
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
	const lastDate_demo = last_demo.getDate();
	// console.log(lastDate_demo);


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

	for (let i = 1; i <= lastDate; i += 1) {
		weekArray[firstWeek] = String(i);
		console.log(firstWeek);
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
	const result = { year: yy, month: mm, calendar };

	return result;
};

const ScheduleItem = ({ color }: { color?: string }) => {
	return (
		<span
			className="h-[6px] w-[6px] rounded-full"
			style={{ background: color }}
		/>
	);
};

const WeekHeader = ({ startOnMonday }: { startOnMonday: any }) => {
	return (
		<div className="week-header z-[999] grid w-[100%] grid-cols-7 border-b border-gray-200 text-center text-sm font-bold shadow-sm">
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
				className,
			)}
		>
			{children}
		</div>
	);
};

const Calendar = (props: any) => {
	const { year, month, schedules, onClick, startOnMonday } = props;
	const data_m = getCalendar(year, month - 1, startOnMonday);
	const data = getCalendar(year, month, startOnMonday);
	const data_p = getCalendar(year, month + 1, startOnMonday);
	
	const dataArr = [data_m, data, data_p]

	return (
		<div className="flex gap-20">
			{dataArr.map((item: any, index: number) => (
				<div className="flex h-[100%] w-[100%] flex-1 flex-col" key={index}>
					<WeekHeader startOnMonday={startOnMonday} />
					{item.calendar.map((week: string[], key: number) => {
					return (
						<WeekRow
							className={cn(
								key === data?.calendar.length - 1 ? "border-b-0" : "",
							)}
							key={key}
						>
							{week.map((e, _key) => {
								return (
									<div
										key={`day-${_key}`}
										className={cn(
											`flex flex-1 flex-col border-r border-gray-100 py-2 text-sm`,
											e === ""
												? "bg-orange-400 opacity-15"
												: "",
										)}
										onClick={() => onClick(e)}
									>
										{ 
											(key == 0 && e == "") ? (<span>wtf</span>)
											:(key > 1 && e == "") ? (<span>dcm</span>)
											: (<span>{e}</span>)
										}
										<div className="mt-1 flex justify-center gap-[2px]">
											{schedules?.map((s: any, key: number) => {
												if (
													e !== ""
												) {
													return (
														<ScheduleItem
															key={`${s.year}${s.month}${s.day}${key}`}
															color={s.color}
														/>
													);
												}
											})}
										</div>
									</div>
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

	const [[page, direction], setPage] = React.useState([0, 0]);

	const paginate = (newDirection: number) => {
		setPage([page + newDirection, newDirection]);
	};

	const onClick = (d: any) => {
		console.log(`${y}-${m}-${d}`);
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
			<div className="calendar-header mb-3 flex w-[100%] items-center justify-between px-1">
				<h2 className="heading-2 text-xl font-bold">
					{(m - 1) == 0 ? y - 1 : y}年{(m - 1) == 0 ? 12 : toDouble(m - 1)}月
				</h2>
				<h2 className="heading-2 text-xl font-bold">
					{y}年{toDouble(m)}月
				</h2>
				<h2 className="heading-2 text-xl font-bold">
					{(m + 1) == 13 ? y + 1 : y}年{(m + 1) == 13 ? 1 : toDouble(m + 1)}月
				</h2>
				<div className="buttons mt-1 flex items-center gap-5 text-sm font-black">
					<button onClick={onPrev}>先月</button>
					<button onClick={onNext}>来月</button>
				</div>
			</div>
			<div className="flex gap-2">
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
								/>
							</CarouselArea>
						</AnimatePresence>
					</div>
				</div>
			</div>
		</div>
	);
};
