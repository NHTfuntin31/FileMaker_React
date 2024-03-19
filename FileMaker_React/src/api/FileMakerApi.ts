
import { toast } from "react-toastify"
import { apiUrl } from "./global"
import { useMutation, useQuery } from "@tanstack/react-query"
import axios from "axios"
import { useDispatch } from "react-redux"
import { createSchedule } from "../redux/schemaSlice"
import { createCahchier } from "../redux/cahchierSlice"
import { createHoliday } from "../redux/holidaySlice"

const useLogin = (user_id: string) => {
	const body_data = {
		username: user_id,
		password: ""
	}
	return useQuery({
		queryKey: ["LoginApi"],
		queryFn: async () => {
			const { data } = await axios.post(
				`${apiUrl}/api/login`,
				body_data
			);
			const userJSON = JSON.stringify(data);
			localStorage.setItem("isLogin", userJSON)

			return true
		}
	})
}

// ########################################useSchema##############################################


const useGetSchema = (user_id?: string) => {
	const dispatch = useDispatch()

	return useQuery({
		queryKey: ["getSchema"],
		queryFn: async () => {
			console.log("hello word get");
			const { data } = await axios.get(
				`${apiUrl}/api/mypage/schedule?edoctor_no=${user_id}`
			);
			dispatch(createSchedule(data.Schedules))
			return true
		}
	});
};

const usePostSchema = (user_id?: string) => {
	const dispatch = useDispatch()
	return useMutation({
		mutationFn: async (body_data?: any) => {
			await axios.post(
				`${apiUrl}/api/mypage/schedule`,
				body_data
			);
		},
		onSuccess: async () => {
			const { data } = await axios.get(
				`${apiUrl}/api/mypage/schedule?edoctor_no=${user_id}`
			);
			toast.success("スケジュールを追加しました。")
			dispatch(createSchedule(data.Schedules))
		},
		onError: (error) => {
			toast.error("スケジュールを追加できませんでした。")
			console.log(error);
		}
	});
};

const usePutSchema = (user_id?: string) => {
	const dispatch = useDispatch()
	return useMutation({
		mutationFn: async (body_data: any) => {
			const response = await axios.put(
                `${apiUrl}/api/mypage/schedule`,
                body_data
            );
            return response.data;
		},
		onSuccess: async () => {
			const { data } = await axios.get(
				`${apiUrl}/api/mypage/schedule?edoctor_no=${user_id}`
			);
			toast.success("スケジュールを変更しました。")
			dispatch(createSchedule(data.Schedules))
		},
		onError: (error) => {
			toast.error("スケジュールを変更できませんでした。")
			console.log(error);
		}
	});
};

// #####################################useCash#################################################

const useGetCash = (user_id: string) => {
	const dispatch = useDispatch()

	return useQuery({
		queryKey: ["getCash"],
		queryFn: async () => {
			const { data } = await axios.get(
				`${apiUrl}/api/mypage/schedule/Cahchier?e-doctor_no=${user_id}`
			);
			dispatch(createCahchier(data.Cashier))

			return true;
		}
	});
};

const usePostCash = (user_id?: string) => {
	const dispatch = useDispatch()

	return useMutation({
		mutationFn: async (body_data: any) => {
			await axios.post(
				`${apiUrl}/api/mypage/schedule/Cahchier`,
				body_data
			);
		},
		onSuccess: async () => {
			const { data } = await axios.get(
				`${apiUrl}/api/mypage/schedule/Cahchier?e-doctor_no=${user_id}`
			);
			toast.success("出納帳に追加しました。")
			dispatch(createCahchier(data.Cashier))
		},
		onError: (error) => {
			toast.success("出納帳に追加できませんでした。")
			console.log(error);
		}
	});
};

const usePutCash = (user_id?: string) => {
	const dispatch = useDispatch()
	return useMutation({
		mutationFn: async (body_data: any) => {
			const response = await axios.put(
				`${apiUrl}/api/mypage/schedule/Cahchier`,
				body_data
			);
			return response.data;
		},
		onSuccess: async () => {
			const { data } = await axios.get(
				`${apiUrl}/api/mypage/schedule/Cahchier?e-doctor_no=${user_id}`
			);
			toast.success("出納帳を変更しました。")
			dispatch(createCahchier(data.Cashier))
		},
		onError: (error) => {
			toast.success("出納帳を変更できませんでした。")
			console.log(error);
		}
	});
};

const useGetHoliday = () => {
	const dispatch = useDispatch()

	return useQuery({
		queryKey: ["getHoliday"],
		queryFn: async () => {
			const { data } = await axios.get(
				`${apiUrl}/api/mypage/schedule/calender`
			);
			dispatch(createHoliday(data.Holiday))
			return true
		}
	})
}

const userInfo = (id?: any) => {
	const storedData = localStorage.getItem("User");
	const idData = localStorage.getItem("DoctorID");
	const userData = storedData ? JSON.parse(storedData) : "";
	const DoctorID = idData ? idData : "";
	return id ? DoctorID : userData
}

export {
	userInfo,
	useLogin, useGetSchema, usePostSchema, usePutSchema, useGetCash, usePostCash, usePutCash, useGetHoliday
}