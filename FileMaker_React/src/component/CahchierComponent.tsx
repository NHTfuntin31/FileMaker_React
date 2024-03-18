import { Icon } from "@iconify/react/dist/iconify.js";
import { useEffect, useState } from "react";
import { CalendarModal } from "./Modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CashUpdateTest } from "../utils/validationSchema";
import { useSelector } from "react-redux";
import { CashReq } from "./Req/CashReq";
import { getCash, postCash, putCash, userInfo } from "../api/FileMakerApi";
import { useDispatch } from "react-redux";
import { createCahchier } from "../redux/cahchierSlice";

export const CahchierComponent = () => {
	const pagesize = 10
	const doctor_ID: string = userInfo(true);
	const doctor_Info = userInfo();

	const cahchier = useSelector((state: any) => state.cahchier.cahchiers)
	const dispatch = useDispatch()

	const fetchCash = async (id: string) => {
		const data = await getCash(id);
		dispatch(createCahchier(data));
	};

	const pages = Math.ceil(cahchier?.length / pagesize);
	const [currentPage, setCurrentPage] = useState(1);
	const [openModalRegister, setOpenModalRegister] = useState(false);
	const [method, setMethod] = useState("post");
	const [defaultValueCash, setDefaultValueCash] = useState<any>()

	const form = useForm({
		resolver: zodResolver(CashUpdateTest),
	});

	const onSubmit = async (data: any) => {
		console.log(data);
		data.price = data.price ? parseInt(data.price) : 0
		data.id = data.price && parseInt(data.id)
		const Cashier = {
			Cashier : data
		}
		const revertData = Object.assign({}, doctor_Info, Cashier);

		if (method == "post") {
			const post = await postCash(JSON.stringify(revertData), setOpenModalRegister)
			console.log("post", post);
			fetchCash(doctor_ID)
			form.reset()
			setDefaultValueCash("")
		} else if (method == "put") {
			const put = await putCash(JSON.stringify(revertData), setOpenModalRegister)
			console.log("put", put);
			fetchCash(doctor_ID)
			form.reset()
			setDefaultValueCash("")
		}
	}

	useEffect(() => {
		fetchCash(doctor_ID)
		fetchCash(doctor_ID)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [openModalRegister])

	const handlePageChange = (pageNumber: number) => {
		setCurrentPage(pageNumber);
	};

	const paginatedData = cahchier.slice((currentPage - 1) * pagesize, currentPage * pagesize);

	const editCash = (id: number,tarrget_date: string, payment_date:string, division:string, expense_item:string, price:string, memo: string) => {
		setMethod("put")

		tarrget_date = tarrget_date && tarrget_date.split('/').join('-')
		payment_date = payment_date && payment_date.split('/').join('-')

		const Cashier = {
			tarrget_date: tarrget_date,
			payment_date: payment_date,
			division: division,
			expense_item: expense_item,
			price: price,
			memo: memo,
			id: id,
		}

		console.log(Cashier);
		setDefaultValueCash(Cashier)
		setOpenModalRegister(true)
	}

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
					<CashReq form={form} jobInfo={defaultValueCash}/>
				</CalendarModal>
			</form>

			<div className="w-full flex flex-col justify-center items-center text-black px-5 py-3 md:px-16 md:py-10">
				<div className="w-full flex">
					<div>
						<button className="whitespace-nowrap ml-3 p-1 flex justify-normal items-center"
						onClick={() => {
							setDefaultValueCash("")
							setMethod("post")
							setOpenModalRegister(true)
						}}
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
						<th className="w-1/4"></th>
					</tr>
					{cahchier.length > 0 ?
						paginatedData.map((item: any, index: number) => {
							return (
								<tr key={index} className="text-center border-t border-slate-400">
									<td>{item.tarrget_date}</td>
									<td>{item.expense_item}</td>
									<td>{item.price}円</td>
									<td className="cursor-pointer"
										onClick={() => 
											editCash(
												item.id,
												item.tarrget_date, 
												item.payment_date,
												item.division,
												item.expense_item,
												item.price,
												item.memo
											)}
									><Icon icon="uil:edit" width="20" height="20"  style={{color: "black"}} /></td>
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
