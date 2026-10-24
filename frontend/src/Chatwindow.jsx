import React, {
    useRef,
    useState,
    useEffect,
    useContext
} from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import './chatwindow.css';

import { DNA } from 'react-loader-spinner';
import { MyContext } from './MyContext.jsx';

import {
    FaPaperPlane,
    FaRobot,
    FaUserCircle,
    FaSignOutAlt
} from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function ChatWindow() {

    const {

        prompt,
        setPrompt,

        currentThreadId,

        prevchat,
        setPrevChat,

        chatSessions,
        setChatSessions,

        user,

        logout,

        setShowAuthPage,
        setAuthMode,

        setSidebarOpen

    } = useContext(MyContext);

    const textareaRef = useRef(null);
    const bottomRef = useRef(null);

    const [loading, setLoading] = useState(false);

    // MODEL STATE
    const [selectedModel, setSelectedModel] =
        useState("gpt");

    useEffect(() => {

        bottomRef.current?.scrollIntoView({
            behavior: "smooth"
        });

    }, [prevchat, loading]);


    const formatMessage = (text) => {

        const parts =
            text.split(/```([\s\S]*?)```/g);

        return parts.map((part, index) => {

            if (index % 2 === 1) {

                return (

                    <div
                        key={index}
                        style={{
                            backgroundColor: "#171717",
                            borderRadius: "10px",
                            marginTop: "10px",
                            overflow: "hidden",
                            width: "100%"
                        }}
                    >

                        <div
                            style={{
                                padding: "12px 14px",
                                borderBottom: "1px solid #2f2f2f",
                                fontSize: "13px",
                                color: "#b4b4b4"
                            }}
                        >
                            Code
                        </div>

                        <pre
                            style={{
                                margin: 0,
                                padding: "14px",
                                overflowX: "auto",
                                overflowY: "hidden",
                                whiteSpace: "pre",
                                fontSize: "14px"
                            }}
                        >
                            <code>{part}</code>
                        </pre>

                    </div>
                );
            }

            return (

                <span
                    key={index}
                    style={{
                        whiteSpace: "pre-wrap",
                        lineHeight: "1.7"
                    }}
                >
                    {part}
                </span>
            );
        });
    };


    const typeEffect = async (
        text,
        model
    ) => {

        // FIXED UNDEFINED ERROR
        if (!text) {
            text = "Error generating reply";
        }

        let currentText = "";

        setPrevChat(prev => [

            ...prev,

            {
                role: "assistant",
                model: model,
                content: ""
            }
        ]);

        for (let i = 0; i < text.length; i++) {

            currentText += text[i];

            await new Promise(resolve =>
                setTimeout(resolve, 8)
            );

            setPrevChat(prev => {

                const updated = [...prev];

                updated[updated.length - 1] = {

                    role: "assistant",
                    model: model,
                    content: currentText
                };

                return updated;
            });
        }
    };


    const getreply = async () => {

        if (!prompt.trim()) return;

        const userMessage = prompt;

        setPrevChat(prev => [

            ...prev,

            {
                role: "user",
                content: userMessage
            }
        ]);

        setPrompt("");

        setLoading(true);

        try {

            const token =
                localStorage.getItem("token");

            const res = await fetch(
                `${API_URL}/chat/chats`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        ...(token && {
                            Authorization:
                                `Bearer ${token}`
                        })
                    },

                    body: JSON.stringify({

                        message: userMessage,

                        threadId: currentThreadId,

                        model: selectedModel
                    })
                }
            );

            const data = await res.json();

            // FIXED CRASH
            if (data.reply) {

                await typeEffect(
                    data.reply,
                    selectedModel
                );

            } else {

                console.error(data.error);

                await typeEffect(
                    "Error generating reply",
                    selectedModel
                );
            }

            const existingChat =
                chatSessions.find(
                    c => c.id === currentThreadId
                );

            if (!existingChat) {

                setChatSessions(prev => [

                    {
                        id: currentThreadId,

                        title:
                            userMessage.length > 35
                                ? userMessage.substring(0, 35) + "..."
                                : userMessage,

                        messages: [

                            {
                                role: "user",
                                content: userMessage
                            },

                            {
                                role: "assistant",
                                model: selectedModel,
                                content:
                                    data.reply ||
                                    "Error generating reply"
                            }
                        ]
                    },

                    ...prev
                ]);
            }

        } catch (err) {

            console.error(err);

            await typeEffect(
                "Server error occurred",
                selectedModel
            );
        }

        setLoading(false);

        if (textareaRef.current) {

            textareaRef.current.style.height =
                "24px";
        }
    };


    return (

        <div
            className="chat-window-container d-flex flex-column text-white"
            style={{
                flex: 1,
                overflow: "hidden"
            }}
        >

            {/* HEADER */}
            <div className="chat-header d-flex align-items-center justify-content-between flex-shrink-0">

                <div className="d-flex align-items-center gap-2 header-left" style={{ minWidth: 0, flexShrink: 1 }}>

                    {/* HAMBURGER — mobile only */}
                    <button
                        className="hamburger-btn"
                        onClick={() => setSidebarOpen(prev => !prev)}
                        aria-label="Open sidebar"
                    >
                        &#9776;
                    </button>

                    <FaRobot
                        size={18}
                        style={{
                            color: "#10a37f",
                            flexShrink: 0
                        }}
                    />

                    <span
                        className="fw-semibold chat-title"
                        style={{
                            fontSize: "15px",
                            whiteSpace: "nowrap"
                        }}
                    >
                        DeepGPT
                    </span>

                    {/* MODEL SELECTOR */}
                    <select
                        className="model-select-mobile"
                        value={selectedModel}
                        onChange={(e) =>
                            setSelectedModel(
                                e.target.value
                            )
                        }
                    >

                        <option value="gpt">
                            GPT
                        </option>

                        <option value="gemini">
                            Gemini
                        </option>

                        <option value="claude">
                            Claude
                        </option>

                        <option value="grok">
                            Grok
                        </option>

                        <option value="deepseek">
                            DeepSeek
                        </option>

                        <option value="llama">
                            Llama
                        </option>

                        <option value="qwen">
                            Qwen
                        </option>

                    </select>

                </div>

                {user ? (

                    <div className="d-flex align-items-center gap-2 gap-sm-3 header-right" style={{ flexShrink: 0 }}>

                        <div className="d-flex align-items-center gap-2" style={{ minWidth: 0 }}>

                            <FaUserCircle size={22} style={{ flexShrink: 0 }} />

                            <span
                                className="header-user-name"
                                style={{
                                    fontSize: "14px"
                                }}
                            >
                                {user?.name}
                            </span>

                        </div>

                        <button
                            onClick={logout}
                            className="btn btn-sm text-white"
                            style={{
                                backgroundColor: "#2f2f2f",
                                border: "1px solid #3a3a3a",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}
                            title="Logout"
                            aria-label="Logout"
                        >

                            <FaSignOutAlt />

                        </button>

                    </div>

                ) : (

                    <div className="d-flex gap-2 header-right" style={{ flexShrink: 0 }}>

                        <button
                            className="btn btn-sm text-white auth-header-btn"
                            style={{
                                backgroundColor: "#2f2f2f",
                                border: "1px solid #3a3a3a",
                                whiteSpace: "nowrap"
                            }}
                            onClick={() => {

                                setAuthMode("login");

                                setShowAuthPage(true);
                            }}
                        >
                            Login
                        </button>

                        <button
                            className="btn btn-sm text-white auth-header-btn"
                            style={{
                                backgroundColor: "#10a37f",
                                border: "none",
                                whiteSpace: "nowrap"
                            }}
                            onClick={() => {

                                setAuthMode("register");

                                setShowAuthPage(true);
                            }}
                        >
                            Register
                        </button>

                    </div>
                )}

            </div>

            {/* CHAT AREA */}
            <div
                className="flex-grow-1 overflow-auto px-2 px-sm-3 py-3 d-flex justify-content-center"
                style={{
                    minHeight: 0,
                    paddingBottom: "24px",
                    WebkitOverflowScrolling: "touch"
                }}
            >

                <div
                    style={{
                        width: "100%",
                        maxWidth: "800px"
                    }}
                >

                    {prevchat.length === 0 ? (

                        <div className="d-flex flex-column justify-content-center align-items-center h-100 text-center px-3">

                            <h1
                                style={{
                                    fontSize: "clamp(24px, 6vw, 40px)",
                                    fontWeight: "700"
                                }}
                            >
                                How can I help you?
                            </h1>

                        </div>

                    ) : (

                        <>

                            {prevchat.map((msg, i) => (

                                <div
                                    key={i}
                                    className={`d-flex mb-3 ${
                                        msg.role === "user"
                                            ? "justify-content-end"
                                            : "justify-content-start"
                                    }`}
                                >

                                    <div
                                        style={{
                                            background:
                                                msg.role === "user"
                                                    ? "#10a37f"
                                                    : "#2f2f2f",

                                            padding:
                                                msg.role === "user"
                                                    ? "10px 14px"
                                                    : "14px",

                                            borderRadius: "12px",

                                            maxWidth:
                                                msg.role === "user"
                                                    ? "min(85%, 650px)"
                                                    : "100%",

                                            width:
                                                msg.role === "assistant"
                                                    ? "100%"
                                                    : "auto",

                                            wordBreak:
                                                "break-word",

                                            overflow: "hidden"
                                        }}
                                    >

                                        {msg.role === "assistant" && msg.model && (

                                            <div
                                                style={{
                                                    fontSize: "11px",
                                                    color: "#10a37f",
                                                    marginBottom: "6px",
                                                    fontWeight: "600"
                                                }}
                                            >
                                                {msg.model.toUpperCase()}
                                            </div>
                                        )}

                                        {formatMessage(msg.content)}

                                    </div>

                                </div>
                            ))}

                            {loading && (

                                <div className="d-flex justify-content-start">

                                    <DNA
                                        height={60}
                                        width={60}
                                    />

                                </div>
                            )}

                            <div
                                ref={bottomRef}
                                style={{
                                    height: "20px"
                                }}
                            />

                        </>
                    )}

                </div>

            </div>

            {/* INPUT */}
            <div className="chat-input-wrapper px-2 px-sm-3 pb-3 pb-sm-4 flex-shrink-0">

                <div
                    className="mx-auto rounded-4 d-flex align-items-end px-3 py-2"
                    style={{
                        maxWidth: "800px",
                        backgroundColor: "#2f2f2f",
                        border: "1px solid #3a3a3a",
                        gap: "8px"
                    }}
                >

                    <textarea
                        ref={textareaRef}
                        rows="1"
                        value={prompt}
                        placeholder="Message DeepGPT"
                        onChange={(e) => {
                            setPrompt(e.target.value);
                            e.target.style.height = "24px";
                            e.target.style.height = Math.min(e.target.scrollHeight, 180) + "px";
                        }}
                        onKeyDown={(e) => {

                            if (
                                e.key === "Enter" &&
                                !e.shiftKey
                            ) {

                                e.preventDefault();

                                getreply();
                            }
                        }}
                        className="form-control bg-transparent border-0 text-white shadow-none"
                        style={{
                            resize: "none",
                            fontSize: "16px",
                            minHeight: "24px",
                            maxHeight: "180px",
                            overflowY: "auto",
                            lineHeight: "1.5"
                        }}
                    />

                    <button
                        onClick={getreply}
                        className="btn rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{
                            width: "38px",
                            height: "38px",
                            backgroundColor: "#10a37f",
                            color: "white"
                        }}
                        aria-label="Send message"
                    >

                        <FaPaperPlane size={13} />

                    </button>

                </div>

                {/* FOOTER LINE */}
                <div
                    className="text-center mt-2 px-2"
                    style={{
                        fontSize: "12px",
                        color: "#8e8e8e"
                    }}
                >
                    DeepGPT can make mistakes. Check important info.
                </div>

            </div>

        </div>
    );
}

export default ChatWindow;