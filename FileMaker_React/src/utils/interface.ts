
//保留中
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

//保留中
export interface LoginFormI {
	username: string;
	password: string;
}


//保留中
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

//保留中
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

//Loadding
export interface LoadingI {
	show: boolean;
}

//スケジュール  ＋  カレンダー
export interface ScheduleTypeI {
	id: number | null;
	edoctor_id: string;
	no: number | null;
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
}

export interface ScheduleBodyI {
	Schedule: {
		id: number | null;
		edoctor_id: string;
		no: number | null;
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
	}
	
}

//schema Slice用
export interface ScheduleStateI {
	schedules: ScheduleTypeI[]
}

//cahchier 
export interface CahchierI {
	id: number;
	no: number;
	tarrget_date: string;
	division: string;
	job_no?: string;
	expense_item: string;
	price: number;
	memo: string;
	payment_date: string;
	edoctor_id: string;
}

//cahchier Slice用
export interface CahchierStateI {
	cahchiers: CahchierI[]
}


//親からもらうprops（カレンダー）
export interface ScheduleCalendarPropsI {
	id?: string;
	schedules?: ScheduleTypeI[];
	className?: string;
	defaultYear?: number;
	defaultMonth?: number;
	startOnMonday?: boolean;
}

//メニューアイテム
interface MenuItem {
	MenuNo: number;
	Function: number[];
	DisplayName: string[];
	Link: string[];
}
//保留中
export interface DropdownMenuProps {
	menu: MenuItem;
	isOpen: boolean;
	toggleDropdown: () => void;
}
