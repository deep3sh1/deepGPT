import './App.css';

import Sidebar from './Sidebar.jsx';
import ChatWindow from './Chatwindow.jsx';
import AuthPage from './AuthPage.jsx';

import { MyContext } from './MyContext.jsx';

import {
    useState,
    useEffect
} from 'react';

import { v1 as uuidv1 } from 'uuid';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function App() {

    const [prompt, setPrompt] = useState("");
    const [reply, setReply] = useState("");

    const [currentThreadId, setCurrentThreadId] =
        useState(uuidv1());

    const [prevchat, setPrevChat] = useState([]);
    const [chatSessions, setChatSessions] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [authMode, setAuthMode] = useState("login");
    const [showAuthPage, setShowAuthPage] = useState(false);
    const [authError, setAuthError] = useState("");
    const [authLoading, setAuthLoading] = useState(false);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [user, setUser] = useState(null);

    const fetchThreads = async (token) => {

        if (!token) return;

        try {

            const res = await fetch(
                `${API_URL}/chat/threads`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        ...(token && { Authorization: `Bearer ${token}` })
                    }
                }
            );

            const data = await res.json();

            if (!res.ok || !Array.isArray(data)) {

                console.error("Thread fetch failed:", data);

                localStorage.removeItem("token");
                localStorage.removeItem("user");

                setUser(null);
                setChatSessions([]);

                return;
            }

            const formattedThreads = data.map((thread) => ({
                id: thread.threadId,
                title: thread.title,
                messages: thread.messages || []
            }));

            setChatSessions(formattedThreads);

        } catch (err) {
            console.error("fetchThreads error:", err);
        }
    };

    useEffect(() => {

        const token = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");

        if (!token || !savedUser) return;

        try {

            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);

            setTimeout(() => {
                fetchThreads(token);
            }, 50);

        } catch (err) {

            console.error("User parse error:", err);

            localStorage.removeItem("token");
            localStorage.removeItem("user");
        }

    }, []);

    const register = async () => {
        setAuthError("");

        if (!name.trim() || !email.trim() || !password.trim()) {
            setAuthError("Please fill in all fields");
            return;
        }

        setAuthLoading(true);

        try {

            const res = await fetch(
                `${API_URL}/auth/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: name.trim(),
                        email: email.trim(),
                        password
                    })
                }
            );

            const data = await res.json();

            if (res.ok && data.token) {

                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));

                setUser(data.user);
                setShowAuthPage(false);
                setAuthError("");
                setName("");
                setEmail("");
                setPassword("");

                fetchThreads(data.token);
            } else {
                setAuthError(data.error || "Registration failed. Please try again.");
            }

        } catch (err) {
            console.error(err);
            setAuthError("Unable to connect to server. Please check backend connection.");
        } finally {
            setAuthLoading(false);
        }
    };

    const login = async () => {
        setAuthError("");

        if (!email.trim() || !password.trim()) {
            setAuthError("Please enter both email and password");
            return;
        }

        setAuthLoading(true);

        try {

            const res = await fetch(
                `${API_URL}/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: email.trim(),
                        password
                    })
                }
            );

            const data = await res.json();

            if (res.ok && data.token) {

                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));

                setUser(data.user);
                setShowAuthPage(false);
                setAuthError("");
                setEmail("");
                setPassword("");

                fetchThreads(data.token);
            } else {
                setAuthError(data.error || "Invalid email or password");
            }

        } catch (err) {
            console.error(err);
            setAuthError("Unable to connect to server. Please check backend connection.");
        } finally {
            setAuthLoading(false);
        }
    };

    const logout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setUser(null);
        setChatSessions([]);
        setPrevChat([]);
        setActiveChatId(null);
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
        setPrevChat(chat.messages || []);
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
        setPassword,

        sidebarOpen,
        setSidebarOpen
    };

    return (

        <MyContext.Provider value={providerValue}>

            {

                showAuthPage ? (

                    <AuthPage
                        authMode={authMode}
                        setAuthMode={(mode) => {
                            setAuthError("");
                            setAuthMode(mode);
                        }}

                        name={name}
                        setName={setName}

                        email={email}
                        setEmail={setEmail}

                        password={password}
                        setPassword={setPassword}

                        error={authError}
                        setError={setAuthError}
                        loading={authLoading}

                        login={login}
                        register={register}
                        onClose={() => {
                            setAuthError("");
                            setShowAuthPage(false);
                        }}
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