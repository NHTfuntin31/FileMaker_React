import { ReactNode, useEffect, useState } from "react";
import { classificationArrObj, shifts } from "../ArrObject";

const formFields = [
	{ name: 'id', hidden: true, default: null },
	// { name: 'classification', hidden: true, default: "91" },
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

interface SeTime {
    start_time: string;
    end_time: string;
    [key: string]: string; // Chữ ký index cho phép truy cập thông qua các khóa kiểu string
}

export const ScheduleReq = (props: any) => {
	const { jobInfo, form, view } = props
	const { register, setValue , formState: { errors } } = form;

	const [classi, setClassi] = useState("91")

	console.log(jobInfo);

	const [start_t, setStart_t] = useState("")
	const [end_t, setEnd_t] = useState("")
	const [selectedTime, setSelectedTime] = useState<number>();

	const se_time: SeTime = {
		start_time : start_t,
		end_time : end_t
	}

	const setTimeFn = (start: string, end: string) => {
		setStart_t(start)
		setEnd_t(end)
	}

	useEffect(() => {
		setValue("classification", classi);
	}, [classi, setValue]);

	const DefaultTime = () => (
		shifts.map((item: any, index: number) => (
			<div className="flex items-center mb-4" key={index}
				onClick={() => {
					setSelectedTime(index)
					setTimeFn(item.start, item.end)
				}}
			>
				<input type="radio" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" 
				checked={selectedTime == index}
				/>
				<label className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">{item.label}</label>
			</div>
		))
	)
	
		

	return (
		<div className="flex flex-wrap">
			{
				(jobInfo.start_time == "" || jobInfo.start_time == null) &&
					<div className="flex gap-10 justify-center w-full">
					<DefaultTime />
				</div>
			}

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
									{field.hissu ? <span className="text-red-500">*</span> : ""}
									{field.label}:
								</div>
								{
									field.type == "textarea" ?
										<textarea className="border rounded-lg p-1 w-full"
											placeholder={field.name}
											defaultValue={jobInfo[field.name]}
											{...register(field.name)}
											readOnly={view}
										/>
									: field.type == "time" ?
										<div className={"flex flex-col w-3/4 " + (field.type == "time" ? "md:w-2/5" : "w-4/5")}>
											<input
												type="time"
												className={"border rounded-lg p-1 w-full"}
												placeholder={field.name}
												defaultValue={jobInfo[field.name] ? jobInfo[field.name] : se_time[field.name]}
												{...register(field.name)}
												readOnly={view}
											/>
											<div className="text-red-600 font-bold w-full pr-2">{errors[field.name] && <p>{errors[field.name]?.message as ReactNode}</p>}</div>
										</div>

									: field.type == "select" ?
										<div className="flex flex-col  md:w-4/5 items-center">
											<select
												className="border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-1.5"
												{...register(field.name)}
												defaultValue={jobInfo[field.name] ? jobInfo[field.name] : ""
											}
												onChange={(e: any) => setClassi(e.target.selectedOptions[0].getAttribute("data-key"))}
											>
												<option value="">選択してください</option>
												{
													classificationArrObj.map((item: any) => (
														<option 
															value={item.key}
															data-key={item.number}
														>{item.label}</option>
													))
												}
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
											readOnly={view}
										/>
										<div className="text-red-600 font-bold w-full pr-2">{errors[field.name] && <p>{errors[field.name]?.message as ReactNode}</p>}</div>
									</div>
								}
							</div>
						</>
					) : (
						<>
							<input type="text" className="hidden"
							defaultValue={jobInfo[field.name] ? jobInfo[field.name] : field.default}
							{...register(field.name)}
							/>
							<input type="text" className="hidden"
							defaultValue={jobInfo.classification}
							value={classi}
							{...register("classification")}
							/>
						</>

					)
			)
			)}
		</div>
	)
}
