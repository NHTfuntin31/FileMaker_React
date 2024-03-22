import { ReactNode } from "react";

const formFields = [
	{ name: 'tarrget_date',label: '勤務日', type: 'date', hissu:true },
	{ name: 'payment_date', label: '支払日', type: 'date'},
	{ name: 'division', hidden: true, default: "01" },
	{ name: 'id', hidden: true, default: 0  },
	{ name: 'expense_item', label: '場所', default: "" },
	{ name: 'price', label: '収入', default: 0 },
	{ name: 'memo', label: 'メモ'},
];

export const CashReq = (props: any) => {
	const { jobInfo, form , view} = props
	const { register, formState: { errors } } = form;
	console.log(jobInfo);
	return (
		<div className="">
		{formFields.map((field, index) => (
			!field.hidden ?
				(
					<>
						<div key={index}
							className={"text-black pb-2 flex flex-col md:flex-row "}
						>
							<div className={"text-white whitespace-nowrap p-1 md:w-1/5"}>
								{field.hissu ? <span className="text-red-500">*</span> : ""}{field.label}:
							</div>
							<div className="flex flex-col  md:w-4/5 items-center">
								<input type={field.type ? field.type : "text"}
									placeholder={field.name}
									className="border rounded-lg p-1 w-full"
									defaultValue={jobInfo[field.name]}
									readOnly={view}
									{...register(field.name)}
								/>
								<div className="text-red-600 font-bold w-full pr-2">{errors[field.name] && <p>{errors[field.name]?.message as ReactNode}</p>}</div>
							</div>
						</div>
					</>

				) : (
					<input type="text" className="hidden"
						defaultValue={jobInfo[field.name] ? jobInfo[field.name] : field.default}
						{...register(field.name)}
					/>
				)
		)
		)}
	</div>
	)
}
