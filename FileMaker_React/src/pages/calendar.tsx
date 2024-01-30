import { useEffect, useState } from "react";
import { ScheduleCalendar } from "../component/CalendarComponent"
import { fetchData } from "../api/FileMakerApi";



const Calendar = () => {
	const [jsonData, setJsonData] = useState(null);

	useEffect(() => {
		const fetchDataAndSetState = async () => {
			try {
				const data = await fetchData();
				setJsonData(data);
			} catch (error) {
				console.error('Error fetching JSON data:', error);
			}
		};

		fetchDataAndSetState();
	}, []);

	if (!jsonData) {
		return <div>Loading...</div>;
	}
	return (
			<div className="w-full h-[100%] flex justify-center items-start text-black">
				{/* <div className="bg-sky-200 bg-opacity-40 border-solid rounded-3xl backdrop-blur-md"> */}
				<div className="mx-5 my-3 md:mx-16 md:my-10 w-full">
					{/* <h2 className="text-4xl font-bold">Calender</h2> */}
					<div className="w-full">
						<ScheduleCalendar schedules={jsonData} className="w-[100%] h-[95vh]" startOnMonday />
					</div>
				</div>
				{/* </div> */}
			</div>
	)
}

export default Calendar