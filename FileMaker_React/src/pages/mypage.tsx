import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const MyPage = () => {
	const navigate = useNavigate();
	const sessionUserRef = useRef("");

	const storedData = localStorage.getItem("isUser");

	useEffect(() => {
		if (!storedData) {
			navigate("/");
		}
	}, [navigate, storedData]);

	const userData = storedData ? JSON.parse(storedData) : "";
	sessionUserRef.current = userData.Session;

	return <>this is My page {sessionUserRef.current ? sessionUserRef.current : ""}</>;
};

export default MyPage;
