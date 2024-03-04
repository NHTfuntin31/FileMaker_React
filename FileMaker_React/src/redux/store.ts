import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "./counterSlice";
import schemaReducer from "./schemaSlice";
import cahchierReducer from "./cahchierSlice";
import schemaCopyReducer from "./schemaCopySlice";



export const store = configureStore({
	reducer: {
		counter: counterReducer,
		schedule: schemaReducer,
		cahchier: cahchierReducer,
		scheduleCopy: schemaCopyReducer
	}
})

