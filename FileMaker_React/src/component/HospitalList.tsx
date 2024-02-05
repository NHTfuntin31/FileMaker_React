/************************************
	Information
************************************/

import { zodResolver } from "@hookform/resolvers/zod";
import { ReactNode, useState } from "react";
import { useForm } from "react-hook-form";
import { DoctorUpdateTest } from "../utils/validationSchema";
import { CalendarModal } from "./Modal";
import { PostChange } from "./Req/PostChange";


// "Code": "{\"01\": \"当社定期\", \"02\": \"当社Spot\", \"03\": \"当社検診\", \"10\": \"他社紹介\", \"11\": \"定期\", \"12\": \"Spot\", \"13\": \"検診\", \"14\": \"常勤\", \"91\": \"プライベート\"}",

const Color = [
	{ classification: '01', color: 'green-700' },
	{ classification: '02', color: 'orange-700' },
	{ classification: '03', color: 'purple-700' },
	{ classification: '91', color: 'pink-700' },
];

export const Information = (content: string, schedules: any): ReactNode => {
	const matchingSchedules = schedules.filter(
		(item: any) => item.tarrget_date === content
	);
	
	const form = useForm({
		resolver: zodResolver(DoctorUpdateTest),
	});

	const [openModal, setOpenModal] = useState(false);

	const onSubmit = (data: any) => {
		console.log(data);

		//編集フォーム
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
										<td className="px-6 py-4">{content}</td>
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
							<div className="flex justify-center items-center">
								<button 
								className={`w-1/2 md:w-1/3 rounded-lg bg-${color} text-white mt-2 self-center p-2 hover:opacity-50 transition duration-500 ease-in-out`}
								onClick={() =>setOpenModal(true)}
								>スケジュールを編集</button>
								</div>
						</div>
						{/* スケジュールを編集モダール */}
						<form onSubmit={form.handleSubmit(onSubmit)}>
							<CalendarModal
								status={openModal}
								changeStatus={() => {
									form.reset()
									setOpenModal(false)
								}}
								title={`${content} ⁂ ${item.overview}`}
								hopital={item.factory_name}
								submit={form.handleSubmit(onSubmit)}
							>
								<PostChange jobInfo={item} form={form} />
							</CalendarModal>
						</form>
					</div>
				)
			})}
		</div>
	);
};