import { createSlice } from "@reduxjs/toolkit";
import { ScheduleStateT } from "../utils/interface";

const initialState: ScheduleStateT = {
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