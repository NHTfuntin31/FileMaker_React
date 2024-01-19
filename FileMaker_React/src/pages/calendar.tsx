import { useEffect, useState } from "react";
import { ScheduleCalendar } from "../component/CalendarComponent"



const Calendar = () => {
	// const date = new Date();
	// const schedules = [
	// 	{ color: "#ff0049", time: "gozen" },
	// 	{ color: "#0ce7ff", time: "gogo" },
	// 	{ color: "#68df00", time: "yoru" },
	// ];
	const [jsonData, setJsonData] = useState(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch('/src/fake_json/calendar.json');
				const data = await response.json();
				setJsonData(data.Schedules);
			} catch (error) {
				console.error('Error fetching JSON data:', error);
			}
		};

		fetchData();
	}, []);
	if (!jsonData) {
		return <div>Loading...</div>;
	}
	return (
		<>
			<div className="w-full h-screen flex justify-center items-center text-black">
				{/* <div className="bg-sky-200 bg-opacity-40 border-solid rounded-3xl backdrop-blur-md"> */}
				<div className="mx-16 my-10 w-full">
					<h2 className="text-4xl font-bold">Calender</h2>
					<div className="w-full">
						<ScheduleCalendar schedules={jsonData} className="w-[100%] h-[95vh]" startOnMonday />
					</div>
				</div>
				{/* </div> */}
			</div>
		</>
	)
}

export default Calendar