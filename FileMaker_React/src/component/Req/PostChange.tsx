import { ReactNode } from "react";

const formFields = [
	{ name: 'id', hidden: true, default: null },
	{ name: 'classification', hidden: true, default: "91" },
	{ name: 'times', hidden: true, default: "" },
	{ name: 'no', hidden: true, default: null },
	{ name: 'job_no', hidden: true, default: null },
	{ name: 'cancel', hidden: true, default: false },


	{ name: 'start_time', label: '開始時間', type: 'time', hissu:true },
	{ name: 'end_time', label: '終了時間', type: 'time', hissu:true },
	{ name: 'factory_name', label: '病院名'},
	{ name: 'address', label: '住所' },
	{ name: 'overview', label: 'タイトル', hissu:true },
	{ name: 'display_char', label: 'タイプ', type: 'select' },
	{ name: 'detail', label: '詳細', type: 'textarea' },
];

export const PostChange = (props: any) => {
	const { jobInfo, form } = props
	const { register, formState: { errors } } = form;

	return (
		<div className="flex flex-wrap">
			{formFields.map((field, index) => (
				!field.hidden ?
					(
						<>
							<div key={index}
								className={
									"text-black pb-2 flex flex-col md:flex-row "
									+ (field.type == "textarea" ? "flex-col md:flex-col " : "")
									+ (field.type == "time" ? "w-1/2 gap-1" : "w-full justify-between")
								}
							>
								<div className={"text-white whitespace-nowrap p-1 " + (field.type == "time" ? "md:w-1/3" : "md:w-1/5")}>
								{field.hissu ? <span className="text-red-500">*</span> : ""}{field.label}:
									</div>
								{
									field.type == "textarea" ?
										<textarea className="border rounded-lg p-1 w-full"
											placeholder={field.name}
											defaultValue={jobInfo[field.name]}
											{...register(field.name)}
										/>
									: field.type == "time" ?
										<div className={"flex flex-col w-3/4 " + (field.type == "time" ? "md:w-2/5" : "w-4/5")}>
											<input
												type="time"
												className={"border rounded-lg p-1 w-full"}
												placeholder={field.name}
												defaultValue={jobInfo[field.name]}
												{...register(field.name)}
											/>
											<div className="text-red-600 font-bold w-full pr-2">{errors[field.name] && <p>{errors[field.name]?.message as ReactNode}</p>}</div>
										</div>

									: field.type == "select" ?
										<div className="flex flex-col  md:w-4/5 items-center">
											<select
												className="border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-1.5"
												{...register(field.name)}
												defaultValue={jobInfo[field.name] ? jobInfo[field.name] : ""}
											>
												<option value="">選択してください</option>
												<option value="▽">プライベート</option>
												<option value="◇">他業務</option>
											</select>
											<div className="text-red-600 font-bold w-full pr-2">{errors[field.name] && <p>{errors[field.name]?.message as ReactNode}</p>}</div>

										</div>
									: <div className="flex flex-col  md:w-4/5 items-center">
										<input
											type="text"
											className="border rounded-lg p-1 w-full"
											placeholder={field.name}
											defaultValue={jobInfo[field.name]}
											{...register(field.name)}
										/>
										<div className="text-red-600 font-bold w-full pr-2">{errors[field.name] && <p>{errors[field.name]?.message as ReactNode}</p>}</div>
									</div>
								}
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
