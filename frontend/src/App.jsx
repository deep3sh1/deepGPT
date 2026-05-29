import './App.css';

import Sidebar from './sidebar';
import ChatWindow from './chatwindow';
import AuthPage from './AuthPage';

import { MyContext } from './MyContext';

import {
    useState,
    useEffect
} from 'react';

import { v1 as uuidv1 } from 'uuid';

const API_URL = import.meta.env.VITE_API_URL;

function App() {

    const [prompt, setPrompt] = useState("");

    const [reply, setReply] = useState("");

    const [currentThreadId, setCurrentThreadId] =
        useState(uuidv1());

    const [prevchat, setPrevChat] = useState([]);

    const [chatSessions, setChatSessions] =
        useState([]);

    const [activeChatId, setActiveChatId] =
        useState(null);

    const [authMode, setAuthMode] =
        useState("login");

    const [showAuthPage, setShowAuthPage] =
        useState(false);

    const [name, setName] = useState("");

    const [email, setEmail] = useState("");

    const [password, setPassword] =
        useState("");

    const [user, setUser] = useState(null);


    // AUTO LOGIN
    useEffect(() => {

        const token =
            localStorage.getItem("token");

        const savedUser =
            localStorage.getItem("user");

        if (token && savedUser) {

            setUser(JSON.parse(savedUser));

            fetchThreads(token);
        }

    }, []);


    // FETCH THREADS
    const fetchThreads = async (token) => {

        try {

            const res = await fetch(
                `${API_URL}/chat/threads`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await res.json();

            if (!res.ok) {

                localStorage.removeItem("token");

                localStorage.removeItem("user");

                setUser(null);

                return;
            }

            if (!Array.isArray(data)) {
                return;
            }

            const formattedThreads =
                data.map((thread) => ({

                    id: thread.threadId,

                    title: thread.title,

                    messages: thread.messages
                }));

            setChatSessions(formattedThreads);

        } catch (err) {

            console.error(err);
        }
    };


    // REGISTER
    const register = async () => {

        try {

            const res = await fetch(
                `${API_URL}/auth/register`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        name,
                        email,
                        password
                    })
                }
            );

            const data = await res.json();

            if (data.token) {

                localStorage.setItem(
                    "token",
                    data.token
                );

                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );

                setUser(data.user);

                setShowAuthPage(false);

                fetchThreads(data.token);
            }

        } catch (err) {

            console.error(err);
        }
    };


    // LOGIN
    const login = async () => {

        try {

            const res = await fetch(
                `${API_URL}/auth/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        email,
                        password
                    })
                }
            );

            const data = await res.json();

            if (data.token) {

                localStorage.setItem(
                    "token",
                    data.token
                );

                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );

                setUser(data.user);

                setShowAuthPage(false);

                fetchThreads(data.token);
            }

        } catch (err) {

            console.error(err);
        }
    };


    // LOGOUT
    const logout = () => {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        setUser(null);

        setChatSessions([]);

        setPrevChat([]);
    };


    const createNewChat = () => {

        const newId = uuidv1();

        setCurrentThreadId(newId);

        setPrevChat([]);

        setPrompt("");

        setReply("");

        setActiveChatId(newId);
    };


    const openChat = (chat) => {

        setCurrentThreadId(chat.id);

        setPrevChat(chat.messages);

        setActiveChatId(chat.id);
    };


    const providerValue = {

        prompt,
        setPrompt,

        reply,
        setReply,

        currentThreadId,
        setCurrentThreadId,

        prevchat,
        setPrevChat,

        chatSessions,
        setChatSessions,

        activeChatId,
        setActiveChatId,

        createNewChat,
        openChat,

        user,
        setUser,

        logout,

        authMode,
        setAuthMode,

        login,
        register,

        showAuthPage,
        setShowAuthPage,

        name,
        setName,

        email,
        setEmail,

        password,
        setPassword
    };


    return (

        <MyContext.Provider value={providerValue}>

            {

                showAuthPage ? (

                    <AuthPage

                        authMode={authMode}

                        setAuthMode={setAuthMode}

                        name={name}

                        setName={setName}

                        email={email}

                        setEmail={setEmail}

                        password={password}

                        setPassword={setPassword}

                        login={login}

                        register={register}
                    />

                ) : (

                    <div className="app">

                        <Sidebar />

                        <ChatWindow />

                    </div>
                )
            }

        </MyContext.Provider>
    );
}

export default App;