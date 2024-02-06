import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion } from "framer-motion";


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

export { CarouselArea, toDouble, caculatorMonth, getCalendar, WeekHeader, WeekRow, cn }