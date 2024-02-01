import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { DoctorUpdateTest } from "../../utils/validationSchema";
import { ReactNode } from "react";

const formFields = [
	// { name: 'edoctor_id', label: 'eDoctor ID' },
	// { name: 'target_date', label: 'Target Date' },
	// { name: 'display_char', label: 'Display Char' },
	{ name: 'start_time', label: 'Start Time' },
	{ name: 'end_time', label: 'End Time' },
	{ name: 'classification', label: 'Classification' },
	{ name: 'cancel', label: 'Cancel' },
	{ name: 'factory_name', label: 'Factory Name' },
	{ name: 'address', label: 'Address' },
	{ name: 'overview', label: 'Overview' },
	{ name: 'detail', label: 'Detail' },
];


export const PostChange = (props: any) => {
	const { jobInfo } = props
	const { register, formState: { errors } } = useForm({
		resolver: zodResolver(DoctorUpdateTest),
	});
	return (
		<div>
				<div className="flex flex-wrap">
					{formFields.map((field, index) => {
						const time = (index == 0 || index == 1)
						return(
							<div key={field.name} 
								className={
									"text-black pb-2 flex flex-col md:flex-row " 
									+ (index == formFields.length -1 ? "md:flex-col " : "")
									+ (time ? "w-1/2" : "w-full justify-between")
								}
								>
									<div className={"text-white p-1 w-full " + (time ? "md:w-1/3" : "md:w-1/5") }>{field.label}:</div>


									{index == formFields.length -1 ?
										<textarea className="border rounded-lg p-1 w-full"
										placeholder={field.name}
										defaultValue={jobInfo[field.name]}
										{...register(field.name)}
										/>
										: time ? <input 
											type="time"
											className={"border rounded-lg p-1 " + (time ? "w-1/2" : "w-4/5") }
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
						)
					}
					)}
				</div>
		</div>
	)
}
