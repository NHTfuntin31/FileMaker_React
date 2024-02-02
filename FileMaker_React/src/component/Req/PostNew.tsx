import { ReactNode } from "react";

const formFields = [
	// { name: 'id', label: 'ID' },
	// { name: 'edoctor_id', label: 'eDoctor ID' },
	// { name: 'no', label: 'No' },
	// { name: 'target_date', label: 'Target Date' },
	// { name: 'display_char', label: 'Display Char' },
	// { name: 'job_no', label: 'Job No' },
	// { name: 'time_zone', label: 'Time Zone' },
	// { name: 'times', label: 'Times' },
	{ name: 'start_time', label: 'Start Time', type: 'time'},
	{ name: 'end_time', label: 'End Time', type: 'time'},
	// { name: 'classification', label: 'Classification' },
	// { name: 'cancel', label: 'Cancel' },
	{ name: 'factory_name', label: 'Factory Name' },
	{ name: 'address', label: 'Address' },
	{ name: 'overview', label: 'Overview' },
	{ name: 'detail', label: 'Detail', type: 'textarea' },
];



export const PostNew = (props: any) => {
	const { form } = props
	const { register, formState: { errors } } = form;

	return (
		<div className="flex flex-wrap">
			{formFields.map((field, index) => {
				return (
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
								{...register(field.name)}
							/>
							: field.type == "time" ? <input
								type="time"
								className={"border rounded-lg p-1 " + (field.type == "time" ? "w-1/2" : "w-4/5")}
								placeholder={field.name}
								{...register(field.name)}
							/>
								:
								<input
									type="text"
									className="border rounded-lg p-1 md:w-4/5 w-full"
									placeholder={field.name}
									{...register(field.name)}
								/>}
						<p>{errors[field.name] && <div>{errors[field.name]?.message as ReactNode}</div>}</p>
					</div>
				)
			}
			)}
		</div>
	)
}
