

// const LoginApi = async (data: LoginFormI, navigate: NavigateFunction, setIsLoading: (isLoading: boolean) => void) => {
// 	console.log(data);
// 	const LoginUrl = "http://osk-195:8080/api/login"

// 	try {
//         setIsLoading(true)
//         await axios
// 		.post(LoginUrl, data)
// 		.then((res) => {
// 			console.log(res.data);
// 			localStorage.setItem('isUser', JSON.stringify(res.data));
// 			navigate('/mypage')
// 		})
//     } catch (error) {
//         setIsLoading(false)
//     }
// }

const LoginApi = async(user_id: string) => {
	const data = {
		username: user_id,
		password: ""
	}
	try{
		const response = await fetch(`http://osk-195:8080/api/login`, {
			method: "POST",
			body: JSON.stringify(data)
		})

		const resData = await response.json()
		const userJSON = JSON.stringify(resData);
		localStorage.setItem("isLogin", userJSON)
	} catch (error) {
		console.log(error);
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

const postSchema = (data: any, setOpenModal? : (isOpenModal: boolean) => void) => {
	const url = `http://osk-195:8080/api/mypage/schedule`
	try {
		fetch(url,{
			method: "POST",
			body: data
		})
		setOpenModal && setOpenModal(false)
		return true
	} catch (error){
		console.log("error");
		return false
	}
}

const putSchema = (data: any, setOpenModal? : (isOpenModal: boolean) => void) => {
	const url = `http://osk-195:8080/api/mypage/schedule`
	try {
		fetch(url,{
			method: "PUT",
			body: data
		})
		setOpenModal && setOpenModal(false)
		return true
	} catch (error){
		console.log("error");
		return false
	}
}

const getCash = async (user_id: string) => {
	const url = `http://osk-195:8080/api/mypage/schedule/Cahchier?e-doctor_no=${user_id}`
	try{
		const response = await fetch(url, {
			method: "GET"
		})

		const data = await response.json();
		return data.Cashier
	} catch(error) {
		console.log(error);
	}
}

const postCash = async (data: any, setOpenModal? : (isOpenModal: boolean) => void) => {
	const url = `http://osk-195:8080/api/mypage/schedule/Cahchier`
	try{
		fetch(url, {
			method: "POST",
			body: data
		})
		setOpenModal && setOpenModal(false)
		return true
	} catch(error) {
		console.log("error");
		return false
	}
}

const putCash = async (data: any, setOpenModal? : (isOpenModal: boolean) => void) => {
	const url = `http://osk-195:8080/api/mypage/schedule/Cahchier`
	try {
		fetch(url,{
			method: "PUT",
			body: data
		})
		setOpenModal && setOpenModal(false)
		return true
	} catch (error){
		console.log("error");
		return false
	}
}


const userInfo = (id?: any) => {
	const storedData = localStorage.getItem("User");
	const userData = storedData ? JSON.parse(storedData) : "";
	return id ? userData.User["e-doctor_no"] : userData
}

export {LoginApi, userInfo, getSchema, postSchema, putSchema, getCash, postCash, putCash}