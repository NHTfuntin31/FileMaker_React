import { createSlice } from "@reduxjs/toolkit";



export const holidaySlice = createSlice({
	name: "holiday",
	initialState: {
		Holiday: {},
	},
	reducers: {
		createHoliday: (state, action) => {
			state.Holiday = action.payload
		}
	}
})

export const { createHoliday } = holidaySlice.actions
export default holidaySlice.reducer;