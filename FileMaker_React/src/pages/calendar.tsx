import { useEffect, useState } from "react";
import { ScheduleCalendar } from "../component/CalendarComponent"
import { getSchema } from "../api/FileMakerApi";



const Calendar = ({ edoctorID }: { edoctorID: string }) => {
	const [jsonData, setJsonData] = useState(null);

	useEffect(() => {
		const getSchemaAndSetState = async () => {
			try {
				const data = await getSchema(edoctorID);
				setJsonData(data);
			} catch (error) {
				console.error('Error fetching JSON data:', error);
			}
		};

		getSchemaAndSetState();
	}, []);

	if (!jsonData) {
		return <div>Loading...</div>;
	}
	return (
			<div className="w-full h-[100%] flex justify-center items-start text-black">
				<div className="mx-5 my-3 md:mx-16 md:my-10 w-full">
					<div className="w-full">
						<ScheduleCalendar schedules={jsonData} className="w-[100%] h-[95vh]" startOnMonday />
					</div>
				</div>
			</div>
	)
}

export default Calendar