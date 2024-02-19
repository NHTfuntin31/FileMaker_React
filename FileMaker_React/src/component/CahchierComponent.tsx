
export const CahchierComponent = (jsonData: any) => {
	return (
		<div className="w-full flex justify-center items-start text-black">
				<table className="mx-5 my-3 md:mx-16 md:my-10 w-full border border-black">
					<tr className="text-center bg-slate-400">
						<th className="w-1/4 p-2">(勤務)日付</th>
						<th className="w-2/4">場所</th>
						<th className="w-1/4">収入</th>
					</tr>
					{ jsonData?.jsonData?.length > 0?
						jsonData.jsonData!.map((item: any, index: number) => {
						console.log(item);

							return (
								<tr key={index} className="text-center border-t border-slate-400">
									<td>{item.tarrget_date}</td>
									<td>{item.expense_item}</td>
									<td>{item.price}円</td>
								</tr>
							)
						})
						: null
					}
				</table>
		</div>
	)
}
