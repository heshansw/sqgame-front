import { useNavigate } from 'react-router-dom';
import Header from '../../pages/Header';
import { mainService } from "../../services/main.service";

const Login = () => {

    const navigate = useNavigate();

    const handleLogin = (e: any) => {
        e.preventDefault();
        
        let userEmail = e.target[0].value;
        let userPassword = e.target[1].value;
        let now = new Date();

        mainService.loginUser(userEmail, userPassword).then((response: any) => {
            console.log({ response });
            now = new Date();
            response = { ...response, setTime: now.getTime()};
            localStorage.setItem('userdata', JSON.stringify(response?.data));
            navigate('/home');
        }).catch((error: any) => {
            console.log({error});
        });
    }

    return (
        <>
            <Header/>
            <div className="login-wrapper">
                <div className="login-wrapper-inner">
                    <form onSubmit={handleLogin}>
                        <input type="email" required placeholder="Please Enter Email Address"/>
                        <input type="password" required placeholder="Please Enter Password"/>
                        <input type="submit" value="Login"/>
                    </form>
                </div>
            </div>
        </>
    );
}
export default Login;