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

const getSchema = async (user_id: string) => {
	try {
		const response = await fetch(`http://osk-195:8080/api/mypage/schedule?edoctor_no=${user_id}`);
		const data = await response.json();

		const user = {
			"User": data.User
		}
		const userJSON = JSON.stringify(user);
		localStorage.setItem("User", userJSON)
		
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

export {LoginApi, getSchema, userInfo}