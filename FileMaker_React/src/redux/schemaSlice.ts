import { createSlice } from "@reduxjs/toolkit";
import { ScheduleStateI } from "../utils/interface";

const initialState: ScheduleStateI = {
	schedules: [],
};

export const schemaSlice = createSlice({
	name: "schema",
	initialState,
	reducers: {
		createSchedule: (state, action) => {
			state.schedules = action.payload
		},
	}
})

export const { createSchedule } = schemaSlice.actions;
export default schemaSlice.reducer;