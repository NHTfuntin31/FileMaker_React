export interface RegisterFormI {
	firstname: string;
	lastname: string;
	firstname_kana: string;
	lastname_kana: string;
	email: string;
	sex: string;
	file: File;
	category: string;
	yubin: string;
}

export interface LoginFormI {
	username: string;
	password: string;
}

export interface DoctorFormI {
	id: number,
	edoctor_id: string,
	no: number,
	target_date: string,
	display_char: string,
	job_no: string,
	time_zone: string,
	times: string,
	start_time: number,
	end_time: number,
	classification:string,
	cancel: boolean,
	factory_name: string,
	address: string,
	overview: string,
	detail: string,
}
export interface DoctorFormTestI {
	start_time: any,
	end_time: any,
	classification:string,
	cancel: any,
	factory_name: string,
	address: string,
	overview: string,
	detail: string,
}

export interface LoadingI {
	show: boolean;
}

export type ScheduleType = {
	edoctor_id: string;
	id: number;
	no: number;
	tarrget_date: string;
	display_char: string;
	job_no: string;
	time_zone: string;
	times: string;
	start_time: any;
	end_time: any;
	classification: string;
	cancel: boolean;
	factory_name: string;
	address: string;
	overview: string;
	detail: string;
};

export type ScheduleCalendarProps = {
	id?: string;
	schedules: ScheduleType[];
	className?: string;
	defaultYear?: number;
	defaultMonth?: number;
	startOnMonday?: boolean;
};

interface MenuItem {
	MenuNo: number;
	Function: number[];
	DisplayName: string[];
	Link: string[];
}
export interface DropdownMenuProps {
	menu: MenuItem;
	isOpen: boolean;
	toggleDropdown: () => void;
}
