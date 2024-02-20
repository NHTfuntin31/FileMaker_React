import { createSlice } from "@reduxjs/toolkit";

export const couterSlice = createSlice({
	name: "counter",
	initialState: {
		value: 0,
	},
	reducers: {
		increment: (state) => {
			state.value += 1;
		},
		decrement: (state) => {
			state.value -= 1;
		},

		tuika: (state, action) => {
			state.value += action.payload
		}
	}
})

export const { increment, decrement, tuika } = couterSlice.actions
export default couterSlice.reducer;