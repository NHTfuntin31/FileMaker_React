export function isTimeInRange(checkStartTime: string, checkEndTime: string, startTime: string, endTime: string) {
	if (!checkStartTime || !checkEndTime) return false
	const checkStartHour = parseInt(checkStartTime.split(":")[0], 10);
	const checkEndHour = parseInt(checkEndTime.split(":")[0], 10);
	const startHour = parseInt(startTime.split(":")[0], 10);
	const endHour = parseInt(endTime.split(":")[0], 10);

	return (checkStartHour >= startHour && checkStartHour <= endHour) || (checkEndHour >= startHour && checkEndHour <= endHour);
}

export function formatTime(time: string): string {
	const [hours, minutes] = time.split(':');
	const formattedHours = hours.padStart(2, '0');
	const formattedMinutes = minutes.padStart(2, '0');

	const formattedTime = `${formattedHours}:${formattedMinutes}:00`;

	return formattedTime;
}