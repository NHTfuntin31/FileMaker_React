import { createSlice } from "@reduxjs/toolkit";
import { CahchierStateI } from "../utils/interface";

const initialState: CahchierStateI = {
	cahchiers: [],
};

export const cahchierSlice = createSlice({
	name: "cahchier",
	initialState,
	reducers: {
		createCahchier: (state, action) => {
			state.cahchiers = action.payload
		}
	}
})

export const { createCahchier } = cahchierSlice.actions
export default cahchierSlice.reducer;