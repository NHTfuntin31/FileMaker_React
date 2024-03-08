import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { decrement, increment, tuika } from "../redux/counterSlice";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const Index = () => {
	const id_Params = new URLSearchParams(location.search);
	const navigate = useNavigate();
	const doctor_ID = id_Params.get('id');

	localStorage.setItem('DoctorID', String(doctor_ID))
    console.log(doctor_ID);

	useEffect(() => {
		if(doctor_ID != null) {
			navigate('/mypage')
		}
	},[navigate, doctor_ID])

	const count  = useSelector((state: any) => state.counter.value)
	const dispatch = useDispatch()
	const [test, settest] = useState("2")
    return <div>
		<h1 className="text-black">count: {count}</h1>
		<h1>{doctor_ID}</h1>
		<input onChange={(e) => settest(e.target.value)} value={test} />
		<button onClick={() => dispatch(increment())}>+</button>
		<button onClick={() => dispatch(decrement())}>-</button>
		<button onClick={() => dispatch(tuika(parseInt(test)))}>追加</button>
	</div>;
};
