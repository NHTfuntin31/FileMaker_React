import { Icon } from "@iconify/react/dist/iconify.js";
import { useEffect, useState } from "react";
import { CalendarModal } from "./Modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CashUpdateTest } from "../utils/validationSchema";
import { useSelector } from "react-redux";
import { CashReq } from "./Req/CashReq";
import { usePostCash, usePutCash, userInfo } from "../api/FileMakerApi";
import MonthPicker from "./MonthPicker";
import { CahchierI } from "../utils/interface";


export const CahchierComponent = () => {
	const doctor_ID: string = userInfo(true);
	const doctor_Info = userInfo();

	const postCashMutation = usePostCash(doctor_ID)
	const putCashMutation = usePutCash(doctor_ID)
	const currentDate = new Date();

	const cahchier = useSelector((state: any) => state.cahchier.cahchiers)

	const [openModalRegister, setOpenModalRegister] = useState(false);
	const [method, setMethod] = useState("post");
	const [defaultValueCash, setDefaultValueCash] = useState<any>()

	const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
	const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
	const [filteredData, setFilteredData] = useState<CahchierI[]>([]);

	const filterData = () => {
		const filteredDatat = cahchier.filter((i: any) => {
			const d = i.tarrget_date.split('/');
			const itemDate = new Date(d[0], d[1] - 1, d[2]);
			return itemDate.getMonth() === selectedMonth - 1 && itemDate.getFullYear() === selectedYear;
		})
		setFilteredData(filteredDatat);
	};
	const form = useForm({
		resolver: zodResolver(CashUpdateTest),
	});

	const onSubmit = async (data: any) => {
		data.price = data.price ? parseInt(data.price) : 0
		data.id = data.price && parseInt(data.id)
		const Cashier = {
			Cashier: data
		}
		const revertData = Object.assign({}, doctor_Info, Cashier);

		if (method == "post") {
			await postCashMutation.mutateAsync(revertData)
			setOpenModalRegister(false)
			form.reset()
			setDefaultValueCash("")
		} else if (method == "put") {
			await putCashMutation.mutateAsync(revertData)
			setOpenModalRegister(false)
			form.reset()
			setDefaultValueCash("")
		}
	}

	const editCash = (id: number, tarrget_date: string, payment_date: string, division: string, expense_item: string, price: string, memo: string) => {
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

		setDefaultValueCash(Cashier)
		setOpenModalRegister(true)
	}

	const selectedMonthFn = (e: any) => {
		const t = e.split('/')
		setSelectedYear(parseInt(t[0]))
		setSelectedMonth(parseInt(t[1]))
	}

	useEffect(() => {
		filterData()
	},[selectedYear, selectedMonth, cahchier])

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
					<CashReq form={form} jobInfo={defaultValueCash} />
				</CalendarModal>
			</form>
			
			<div className="w-full flex flex-col justify-center items-center text-black px-5 py-3 md:px-16 md:py-10">
				<div className="w-full flex items-center justify-center">
					<MonthPicker
					selected={`${selectedYear}/${selectedMonth}`}
					onChange={(e) => selectedMonthFn(e)}
					popperPlacement="bottom"
					customInput={
						<div className="flex gap-2 items-center hover:cursor-pointer border py-1 px-10 rounded-lg">
							<p>{`${selectedYear}年${selectedMonth}月`}</p>
							<Icon icon="solar:calendar-outline" width="20" height="20"/>
						</div>
					}
				/>
				</div>
				<div className="w-full flex">
					<div>
						<button className="whitespace-nowrap ml-3 p-1 flex justify-normal items-center hover:font-bold transition duration-200 ease-in-out"
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
				</div>
				{ filteredData.length > 0 ?
					<table className="w-full border border-black">
					<tr className="text-center bg-slate-400">
						<th className="w-1/4 p-2">(勤務)日付</th>
						<th className="w-2/4">場所</th>
						<th className="w-1/4">支払日</th>
						<th className="w-1/4">収入</th>
						<th className="w-1/4"></th>
					</tr>
						{
							filteredData.map((item: any, index: number) => {
								return (
									<tr key={index} className="text-center border-t border-slate-400">
										<td className="whitespace-nowrap">{item.tarrget_date}</td>
										<td className="">{item.expense_item}</td>
										<td className="whitespace-nowrap">{item.payment_date}</td>
										<td className="whitespace-nowrap">{item.price}円</td>
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
										><Icon icon="uil:edit" width="20" height="20" style={{ color: "black" }} /></td>
									</tr>
								)
							})
						}

				</table>
				: 
				<>
					<h2 className="my-10 font-bold">当月のデータが存在しません。</h2>
				</>
				}
				
				<p className="self-end mt-2">合計金額: {filteredData.reduce((accumulator, currentItem) => accumulator + currentItem.price, 0).toLocaleString()}円</p>
			</div>
		</>

	)
}
