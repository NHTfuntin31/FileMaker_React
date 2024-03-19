/************************************
	Information
************************************/

import { zodResolver } from "@hookform/resolvers/zod";
import { ReactNode, useState } from "react";
import { useForm } from "react-hook-form";
import { DoctorUpdateTest } from "../utils/validationSchema";
import { CalendarModal } from "./Modal";
import { ScheduleReq } from "./Req/ScheduleReq";
import { usePutSchema, userInfo } from "../api/FileMakerApi";
import { useSelector } from "react-redux";
// import { createSchedule } from "../redux/schemaSlice";
import { useDispatch } from "react-redux";
import { formatTime } from "./CalendarItem/timeCheck";
import { createCopy } from "../redux/schemaCopySlice";
import { toast } from "react-toastify";


// "Code": "{\"01\": \"当社定期\", \"02\": \"当社Spot\", \"03\": \"当社検診\", \"10\": \"他社紹介\", \"11\": \"定期\", \"12\": \"Spot\", \"13\": \"検診\", \"14\": \"常勤\", \"91\": \"プライベート\"}",

const Color = [
	{ classification: '01', color: 'green-700' },
	{ classification: '02', color: 'orange-700' },
	{ classification: '03', color: 'purple-700' },
	{ classification: '91', color: 'pink-700' },
];

export const Information = (content: string): ReactNode => {
	const schedules = useSelector((state: any) => state.schedule.schedules)

	const matchingSchedules = schedules.filter(
		(item: any) => item.tarrget_date === content && item.cancel != true
	);


	const doctor_ID = userInfo(true);
	const doctor_Info = userInfo();
	const putSchemaMutation = usePutSchema(doctor_ID)
	const dispatch = useDispatch()
	const form = useForm({
		resolver: zodResolver(DoctorUpdateTest),
	});

	const [openModal, setOpenModal] = useState(false);

	const onSubmit = async (data: any) => {
		data.start_time = formatTime(data.start_time);
		data.end_time = formatTime(data.end_time);
		data.no = parseInt(data.no)
		data.id = parseInt(data.id)

		const key = {
			tarrget_date: content,
			edoctor_id: doctor_ID,
		}
		//編集フォーム
		const mergedObject = {
			Schedule : Object.assign({}, data, key)
		}
		const revertData = Object.assign({}, doctor_Info, mergedObject);

		await putSchemaMutation.mutateAsync(revertData)
		setOpenModal(false)
	}

	const onCopy = (data: any) => {
		dispatch(createCopy(data))
	}
	return (
		<div>
			{matchingSchedules.map((item: any) => {
				const color = Color.find(
					(a: any) => a.classification == item.classification
				)?.color

				return (
					<div key={item.id} className="whitespace-pre-line mb-4">
						<div className={`bg-${color} py-2 min-w-32 w-1/5 rounded-t-lg text-center text-white`}>{item.overview}</div>
						<div className={`border border-${color} p-5`}>
							<div className="mb-5">
								<div className={`pl-2 text-${color} font-bold border-l-4 border-${color} mb-2`}>基本情報</div>
								<table className="min-w-full text-left text-sm font-light border">
									<tr
										className="border border-gray-600">
										<td className="whitespace-nowrap px-6 py-4 font-medium border-r border-gray-600 bg-slate-100">出勤日時</td>
										<td className="px-6 py-4">{content} ({item.times})</td>
									</tr>
									<tr
										className="border border-gray-600">
										<td className="whitespace-nowrap px-6 py-4 font-medium border-r border-gray-600 bg-slate-100">
											医療機関名</td>
										<td className="px-6 py-4">{item.factory_name}</td>
									</tr>
									<tr
										className="border border-gray-600">
										<td className="whitespace-nowrap px-6 py-4 font-medium border-r border-gray-600 bg-slate-100">住所</td>
										<td className="px-6 py-4">{item.address}</td>
									</tr>
								</table>
							</div>

							<div>
								<div className={`pl-2 text-${color} font-bold border-l-4 border-${color} mb-2`}>その他の情報</div>
								<table className="min-w-full text-left text-sm font-light border">
									<tr
										className="border border-gray-600">
										<td className="whitespace-nowrap px-6 py-4 font-medium border-r border-gray-600 bg-slate-100">補足事項</td>
										<td className="px-6 py-4">{item.detail}</td>
									</tr>
								</table>
							</div>
							<div className={"flex flex-col md:flex-row gap-2 justify-center items-center"}>
								<button 
								className={`w-1/2 md:w-1/4 rounded-lg bg-${color} whitespace-nowrap text-white mt-2 self-center p-2 hover:opacity-50 transition duration-500 ease-in-out`}
								onClick={() =>setOpenModal(true)}
								>スケジュールを編集</button>
								<button 
								className={`w-1/2 md:w-1/4 rounded-lg bg-${color} whitespace-nowrap text-white mt-2 self-center p-2 hover:opacity-50 transition duration-500 ease-in-out`}
								onClick={() => {
									toast.info(`${content}の${item.times}のスケジュールをコピーしました。`)
									onCopy(item)
								}}
								>スケジュールをコピー</button>
							</div>
						</div>
						{/* スケジュールを編集モーダル */}
						<form onSubmit={form.handleSubmit(onSubmit)}>
							<CalendarModal
								status={openModal}
								changeStatus={() => {
									// form.reset()
									setOpenModal(false)
								}}
								title={`${content} ⁂ ${item.overview}`}
								hopital={item.factory_name}
								submit={form.handleSubmit(onSubmit)}
							>
								<ScheduleReq jobInfo={item} form={form} />
							</CalendarModal>
						</form>
					</div>
				)
			})}
		</div>
	);
};