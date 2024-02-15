import { ReactNode } from "react";

const formFields = [
	{ name: 'id', hidden: true, default: null },
	{ name: 'classification', hidden: true, default: "91" },
	{ name: 'times', hidden: true, default: "" },
	{ name: 'no', hidden: true, default: null },
	{ name: 'job_no', hidden: true, default: null },
	{ name: 'cancel', hidden: true, default: false },


	{ name: 'start_time', label: 'Start Time', type: 'time' },
	{ name: 'end_time', label: 'End Time', type: 'time' },
	{ name: 'factory_name', label: 'Factory Name' },
	{ name: 'address', label: 'Address' },
	{ name: 'overview', label: 'Overview'},
	{ name: 'display_char', label: 'display_char', type: 'select' },
	{ name: 'detail', label: 'Detail', type: 'textarea' },
];
// no: null,
// job_no: null,
// times: "",
// classification: "02",
// cancel: false,
// display_char: "▽"

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
									+ (field.type == "textarea" ? "md:flex-col " : "")
									+ (field.type == "time" ? "w-1/2" : "w-full justify-between")
								}
							>
								<div className={"text-white p-1 w-full " + (field.type == "time" ? "md:w-1/3" : "md:w-1/5")}>{field.label}:</div>
								{
									field.type == "textarea" ?
										<textarea className="border rounded-lg p-1 w-full"
											placeholder={field.name}
											defaultValue={jobInfo[field.name]}
											{...register(field.name)}
										/>
										: field.type == "time" ?
											<input
												type="time"
												className={"border rounded-lg p-1 " + (field.type == "time" ? "w-1/2" : "w-4/5")}
												placeholder={field.name}
												defaultValue={jobInfo[field.name]}
												{...register(field.name)}
											/>
											: field.type == "select" ?
												<>
													<select 
														className="border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-4/5 p-1.5"
														{...register(field.name)}
														defaultValue={jobInfo[field.name] ? jobInfo[field.name] : ""}
														>
														<option value="">選択してください</option>
														<option value="▽">プライベート</option>
														<option value="◇">他業務</option>
													</select>

												</>
												: <input
													type="text"
													className="border rounded-lg p-1 md:w-4/5 w-full"
													placeholder={field.name}
													defaultValue={jobInfo[field.name]}
													{...register(field.name)}
												/>}
							</div>
							<p>{errors[field.name] && <div>{errors[field.name]?.message as ReactNode}</div>}</p>

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
