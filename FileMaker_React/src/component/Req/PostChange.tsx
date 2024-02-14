import { ReactNode } from "react";

const formFields = [
	{ name: 'id', hidden: true, default: null},
	{ name: 'display_char', hidden: true, default: "▽"},
	{ name: 'classification', hidden: true, default: "02"},
	{ name: 'no', hidden: true, default: null},
	{ name: 'cancel', hidden: true, default: false},


	{ name: 'start_time', label: 'Start Time', type: 'time' },
	{ name: 'end_time', label: 'End Time', type: 'time' },
	{ name: 'factory_name', label: 'Factory Name' },
	{ name: 'address', label: 'Address' },
	{ name: 'overview', label: 'Overview' },
	{ name: 'detail', label: 'Detail', type: 'textarea' },
];
// tarrget_date: content,
// edoctor_id: doctor_ID,
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
					<div key={index}
						className={
							"text-black pb-2 flex flex-col md:flex-row "
							+ (field.type == "textarea" ? "md:flex-col " : "")
							+ (field.type == "time" ? "w-1/2" : "w-full justify-between")
						}
					>
						<div className={"text-white p-1 w-full " + (field.type == "time" ? "md:w-1/3" : "md:w-1/5")}>{field.label}:</div>

						{field.type == "textarea" ?
							<textarea className="border rounded-lg p-1 w-full"
								placeholder={field.name}
								defaultValue={jobInfo[field.name]}
								{...register(field.name)}
							/>
							: field.type == "time" ? <input
								type="time"
								className={"border rounded-lg p-1 " + ( field.type == "time" ? "w-1/2" : "w-4/5")}
								placeholder={field.name}
								defaultValue={jobInfo[field.name]}
								{...register(field.name)}
							/>
								:
								<input
									type="text"
									className="border rounded-lg p-1 md:w-4/5 w-full"
									placeholder={field.name}
									defaultValue={jobInfo[field.name]}
									{...register(field.name)}
								/>}
						<p>{errors[field.name] && <div>{errors[field.name]?.message as ReactNode}</div>}</p>
					</div>
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
