import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { decrement, increment, tuika } from "../redux/counterSlice";
import { useState } from "react";

export const Index = () => {
	const count  = useSelector((state: any) => state.counter.value)
	const dispatch = useDispatch()
	const [test, settest] = useState("2")
    return <div>
		<h1 className="text-black">count: {count}</h1>
		<input onChange={(e) => settest(e.target.value)} value={test} />
		<button onClick={() => dispatch(increment())}>+</button>
		<button onClick={() => dispatch(decrement())}>-</button>
		<button onClick={() => dispatch(tuika(parseInt(test)))}>追加</button>
	</div>;
};
