import { ScheduleCalendar } from "../component/CalendarComponent"



const Calendar = () => {
	// const date = new Date();
	const schedules = [
		{ color: "#ff0049" },
		{ color: "#0ce7ff" },
		{ color: "#68df00" },
	];
	return (
		<>
			<div className="bg-gradient-to-br from-sky-300 to-blue-500 w-full h-screen flex justify-center items-center text-black">
				{/* <div className="bg-sky-200 bg-opacity-40 border-solid rounded-3xl backdrop-blur-md"> */}
					<div className="mx-16 my-10 w-full">
						<div className="">
							<h2 className="text-4xl font-bold">Calender</h2>
						</div>
						<div className=" w-full">
							<ScheduleCalendar schedules={schedules} className="w-[90%] h-[95vh]" startOnMonday />
						</div>
					</div>
				{/* </div> */}
			</div>
		</>
	)
}

export default Calendar