import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";

import { CalendarModal } from "./Modal";
import { useForm } from "react-hook-form";
import { DoctorUpdateTest } from "../utils/validationSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ScheduleCalendarProps } from "../utils/interface";
import { Information } from "./HospitalList";
import { PostChange } from "./Req/PostChange";

import { CarouselArea, cn, toDouble } from "./CalendarItem/Effect";
import { Calendar } from "./CalendarItem/Calendar";
import { userInfo } from "../api/FileMakerApi";
import { Icon } from "@iconify/react/dist/iconify.js";



/************************************
	schedule component
************************************/

export const ScheduleCalendar = (props: ScheduleCalendarProps) => {
	const { id, schedules, className, defaultYear, defaultMonth, startOnMonday } =
		props;

	const userData = userInfo()
	const doctor_ID = userData.UserInfo.UserID;
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
		//追加フォーム

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
		const mergedObject = Object.assign({}, data, key);
		console.log(mergedObject);

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
			<div className="calendar-header mb-3 flex w-[100%] items-center justify-center gap-3 px-1">
					<button onClick={onPrev}><Icon icon="icon-park-outline:left-c" width="25" height="25"  style={{color: "black"}} /></button>
					<h2 className="heading-2 text-3xl font-bold">
						{y}年{toDouble(m)}月
					</h2>
					<button onClick={onNext}><Icon icon="icon-park-outline:right-c" width="25" height="25"  style={{color: "black"}} /></button>
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
				<div>
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
							<PostChange jobInfo="" form={form} />
						</CalendarModal>
					</form>
				</div>
			</div>
		</div>
	);
};
