import axios from "axios";
import { LoginFormI } from "../utils/interface"; 
import { NavigateFunction } from 'react-router-dom';



const LoginApi = async (data: LoginFormI, navigate: NavigateFunction, setIsLoading: (isLoading: boolean) => void) => {
	console.log(data);
	const LoginUrl = "http://osk-195:8080/api/login"

	try {
        setIsLoading(true)
        await axios
		.post(LoginUrl, data)
		.then((res) => {
			console.log(res.data);
			localStorage.setItem('isUser', JSON.stringify(res.data));
			navigate('/mypage')
		})
    } catch (error) {
        setIsLoading(false)
    }
}

const fetchData = async () => {
	try {
		const response = await fetch('http://osk-195:8080/api/mypage/schedule?edoctor_no=D021348');
		const data = await response.json();
		return data.Schedules
	} catch (error) {
		console.error('Error fetching JSON data:', error);
	}
};

const userInfo = () => {
	const storedData = localStorage.getItem("isUser");
	const userData = storedData ? JSON.parse(storedData) : "";
	return userData
}

export {LoginApi, fetchData, userInfo}