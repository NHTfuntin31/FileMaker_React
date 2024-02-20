import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./counterSlice";
import schemaReducer from "./schemaSlice";



export const store = configureStore({
	reducer: {
		counter: counterReducer,
		schedule: schemaReducer
	}
})

