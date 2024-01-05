import axios from "axios";
import { LoginForm } from "../pages/login"
import { NavigateFunction } from 'react-router-dom';



const LoginApi = (data: LoginForm, navigate: NavigateFunction) => {
	console.log(data);
	const LoginUrl = "http://osk-195:8080/api/login"
	if(data){
		axios
		.post(LoginUrl, data)
		.then((res) => {
			console.log(res.data);
			localStorage.setItem('isUser', JSON.stringify(res.data));
			navigate('/mypage')
		})
		.catch((error) => {
			console.log(error.response);
		})
	}else{
		window.alert(
            "Error!"
        );
	}
}

export {LoginApi}