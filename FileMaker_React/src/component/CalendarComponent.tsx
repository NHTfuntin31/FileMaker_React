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
import { postSchema, userInfo } from "../api/FileMakerApi";
import { Icon } from "@iconify/react/dist/iconify.js";



/************************************
	schedule component
************************************/

const ScheduleCalendar = (props: ScheduleCalendarProps) => {
	const { schedules, startOnMonday } = props;

	const doctor_ID = userInfo(true);
	const doctor_Info = userInfo();

	const t = new Date();

	const [y, setY]: any = useState(t.getFullYear());
	const [m, setM]: any = useState(t.getMonth() + 1);
	const [content, setContent] = useState("");

	const [openModalRegister, setOpenModalRegister] = useState(false);
	const [[page, direction], setPage] = React.useState([0, 0]);

	const form = useForm({
		resolver: zodResolver(DoctorUpdateTest),
	});


	//
	const paginate = (newDirection: number) => {
		setPage([page + newDirection, newDirection]);
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
	
	//
	const onClick = (y: any, m: any, d: any, t?: any) => {
		console.log(t ? `${y}-${m}-${d}-${t}` : `${y}-${m}-${d}`);
		setContent(
			t
				? `${y}/${toDouble(m)}/${toDouble(d)}/${t}`
				: `${y}/${toDouble(m)}/${toDouble(d)}`
		);
	};

	const onSubmit = (data: any) => {

		data.start_time = data.start_time + ':00';
		data.end_time = data.end_time + ':00';

		const key = {
			tarrget_date: content,
			edoctor_id: doctor_ID,
		}

		//追加フォーム
		const mergedObject = {
			Schedule: Object.assign({}, data, key)
		}
		const postData = Object.assign({}, doctor_Info, mergedObject);

		console.log(postData);
		postSchema(JSON.stringify(postData), setOpenModalRegister)

	}

	return (
		<div className={cn("flex flex-col")}>
			<div className="mb-3 flex items-center justify-center gap-3 px-1">
				<button onClick={onPrev}><Icon icon="icon-park-outline:left-c" width="25" height="25" style={{ color: "black" }} /></button>
				<h2 className="heading-2 text-3xl font-bold">
					{y}年{toDouble(m)}月
				</h2>
				<button onClick={onNext}><Icon icon="icon-park-outline:right-c" width="25" height="25" style={{ color: "black" }} /></button>
			</div>
			<div className="flex flex-col md:gap-2">
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
				<div className={!content ? "hidden" : "block"}>
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

const CalendarComponent = ({ jsonData }: { jsonData: any}) => {

	if (!jsonData) {
		return <div>Error wtf</div>;
	}
	return (
		<div className="w-full flex justify-center items-start text-black">
			<div className="mx-5 my-3 md:mx-16 md:my-10 w-full">
				<ScheduleCalendar schedules={jsonData} startOnMonday />
			</div>
		</div>
	)
}

export default CalendarComponent
