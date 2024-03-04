import { createSlice } from "@reduxjs/toolkit";
import { ScheduleBodyI } from "../utils/interface";

const initialState: ScheduleBodyI = {
	Schedule: {
		id: null,
		edoctor_id: "",
		no: null,
		tarrget_date: "",
		display_char: "",
		job_no: "",
		time_zone: "",
		times: "",
		start_time: "",
		end_time: "",
		classification: "",
		cancel: false,
		factory_name: "",
		address: "",
		overview: "",
		detail: "",
	}
}

export const schemaCopySlice = createSlice({
	name: "schemacopy",
	initialState,
	reducers: {
		createCopy: (state, action) => {
			state.Schedule = action.payload
		},
		pasteCopy: (state, action) => {
			state.Schedule.tarrget_date = action.payload
		}
	}
})

export const { createCopy,  pasteCopy} = schemaCopySlice.actions
export default schemaCopySlice.reducer