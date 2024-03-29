import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { mainService } from "../services/main.service";
import { HubConnection, HubConnectionBuilder, IHttpConnectionOptions, LogLevel } from '@microsoft/signalr';
const Header = () => {

    const [userData, setUserData] = useState<any>();
    const navigate = useNavigate();
    const [ connection, setConnection ] = useState<HubConnection | undefined>();
    const [ connectionId, setConnectionId ] = useState<string | undefined>();
    const [ userId, setUserId ] = useState<string>();
    const [ newGameBegin, setNewGameBegin ] = useState<any>();

    useEffect(() => {
        let strUserData = localStorage.getItem('userdata');
        let userData;
        if (strUserData) {
            userData = JSON.parse(strUserData);
            setUserData(userData);
            setUserId(userData?.user?.id);
        } 

        let accessToken = userData.token;

        const options: IHttpConnectionOptions = {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
            /*,
            skipNegotiation: true,
            transport: HttpTransportType.WebSockets*/
        };

        const newConnection = new HubConnectionBuilder()
            .withUrl("https://localhost:7214/signalrgameeventhub", options)
            .withAutomaticReconnect()
            .configureLogging(LogLevel.Information)
            .build();

        setConnection(newConnection);
    }, []);

    useEffect(() => {
        if (connection) {
            console.log({connection});
            connection.start()
                .then(result => {
                    console.log('Connected!', result);
                    connection.invoke('GetConnectionId').then((connectionId: any) => {
                        console.log({connectionId});
                        setConnectionId(connectionId);
                    });
                })
                .catch(e => console.log('Connection failed: ', e));
        }
    }, [connection])

    useEffect(() => {
        console.log('11', userId);
        if (userId && connectionId && connection) {
            mainService.updateConnectionId(userId, connectionId).then((res) => {
                console.log('updated connection id');
                connection.on('gameStart', data => {
                    console.log('response data::', JSON.parse(data));
                    setNewGameBegin(JSON.parse(data));
                });
            });
        }
    }, [connectionId, connection, userId])

    const logoutUser = () => {
        if (userData && userData?.user?.id) {
            localStorage.removeItem('userdata');
            console.log('userData::', {userData});
            mainService.updateConnectionId(userData?.user?.id, '').then((res) => {
                console.log('removed connection id');
            }).finally(() => {
                navigate('/');
            });
        }
    }

    return (
        <>
            <div className="header-wrapper">
                <ul>
                    <li>
                        <Link to="/register">Register</Link>
                    </li>
                    <li>
                        <Link to="/">Login</Link>
                    </li>
                    {userData ? (
                        <>
                            <li>
                                <Link to="/home">Home</Link>
                            </li>
                            <li>
                                <Link to="/todo">Todo List</Link>
                            </li>
                            <li>
                                <a onClick={logoutUser}>Logout</a>
                            </li>
                        </>
                    ) : null}
                    
                </ul>
                {(newGameBegin) ? (
                    <>
                        You have Received new Game Request, Do you want to Accept it?
                        <button>Accept</button>
                        <button>Reject</button>
                    </>
                ) : null}
            </div>
        </>
    );
}
export default Header;