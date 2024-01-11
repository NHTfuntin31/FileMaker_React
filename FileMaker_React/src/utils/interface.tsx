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

export interface LoadingI {
	show: boolean;
}