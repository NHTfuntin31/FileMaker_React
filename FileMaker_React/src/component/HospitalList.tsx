/************************************
	Information
************************************/

import { zodResolver } from "@hookform/resolvers/zod";
import { ReactNode, useState } from "react";
import { useForm } from "react-hook-form";
import { DoctorUpdateTest } from "../utils/validationSchema";
import { CalendarModal } from "./Modal";
import { PostChange } from "./Req/PostChange";

export const Information = (content: string, schedules: any, setOpenModalRegister?: any): ReactNode => {
	const matchingSchedules = schedules.filter(
		(item: any) => item.tarrget_date === content
	);

	const form = useForm({
		resolver: zodResolver(DoctorUpdateTest),
	});

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

					{/* スケジュールを編集モダール */}
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<CalendarModal
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
						</CalendarModal>
					</form>
				</div>
			))}
		</div>
	);
};