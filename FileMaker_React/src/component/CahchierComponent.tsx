import { Icon } from "@iconify/react/dist/iconify.js";
import { useState } from "react";
import { CalendarModal } from "./Modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DoctorUpdateTest } from "../utils/validationSchema";
import { useSelector } from "react-redux";

export const CahchierComponent = () => {
	const pagesize = 10
	const cahchier = useSelector((state: any) => state.cahchier.cahchiers)

	const pages = Math.ceil(cahchier?.length / pagesize);
	const [currentPage, setCurrentPage] = useState(1);
	const [openModalRegister, setOpenModalRegister] = useState(false);

	const form = useForm({
		resolver: zodResolver(DoctorUpdateTest),
	});
	const onSubmit = (data: any) => {
		console.log(data);
		console.log("data");
	}

	const handlePageChange = (pageNumber: number) => {
		setCurrentPage(pageNumber);
	};

	const paginatedData = cahchier.slice((currentPage - 1) * pagesize, currentPage * pagesize);

	const Paginate = () => (
		<ul className="flex w-full justify-end pr-4 mb-2">
			{pages && Array.from(Array(pages), (_, i) => i + 1).map((pageNumber) => (
				<li key={pageNumber}
					onClick={() => handlePageChange(pageNumber)}
					className={"px-2.5 py-1 border cursor-pointer hover:bg-slate-700 hover:text-white " + (currentPage == pageNumber && "bg-slate-700 text-white")}>
					{pageNumber}
				</li>
			))}
		</ul>
	)

	return (
		<>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<CalendarModal
					status={openModalRegister}
					changeStatus={() => {
						form.reset()
						setOpenModalRegister(false)
					}}
					title={`出納帳に追加`}
					submit={form.handleSubmit(onSubmit)}
				>
				</CalendarModal>
			</form>

			<div className="w-full flex flex-col justify-center items-center text-black px-5 py-3 md:px-16 md:py-10">
				<div className="w-full flex">
					<div>
						<button className="whitespace-nowrap ml-3 p-1 flex justify-normal items-center"
						onClick={() => setOpenModalRegister(true)}
						>
							<Icon icon="icons8:plus" width="15" height="15" style={{ color: "black" }} />
							出納帳に追加
						</button>
					</div>
					<Paginate />
				</div>

				<table className="w-full border border-black">
					<tr className="text-center bg-slate-400">
						<th className="w-1/4 p-2">(勤務)日付</th>
						<th className="w-2/4">場所</th>
						<th className="w-1/4">収入</th>
					</tr>
					{cahchier.length > 0 ?
						paginatedData.map((item: any, index: number) => {
							return (
								<tr key={index} className="text-center border-t border-slate-400" onClick={() => console.log(index)}>
									<td>{item.tarrget_date}</td>
									<td>{item.expense_item}</td>
									<td>{item.price}円</td>
								</tr>
							)
						})
						: null
					}
				</table>
				<div className="mt-4">
					<Paginate />
				</div>
			</div>
		</>

	)
}
