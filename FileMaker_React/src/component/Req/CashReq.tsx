import { ReactNode } from "react";

const formFields = [
	{ name: 'tarrget_date',label: 'tarrget_date', type: 'date', hissu:true },
	{ name: 'payment_date', label: 'payment_date', type: 'date', hissu:true},
	{ name: 'division', hidden: true, default: "01" },
	{ name: 'id', hidden: true, default: 0  },
	{ name: 'expense_item', label: 'expense_item', default: "" },
	{ name: 'price', label: 'price', default: 0 },
	{ name: 'memo', label: '開始時間'},
];

export const CashReq = (props: any) => {
	const { jobInfo, form } = props
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
