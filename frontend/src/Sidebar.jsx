import React, { useContext } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import './sidebar.css';

import { MyContext } from './MyContext.jsx';

import {
    FaPlus,
    FaCommentAlt,
    FaTrash,
    FaUserCircle,
    FaRobot
} from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL;

function Sidebar() {

    const {

        chatSessions,
        setChatSessions,

        createNewChat,
        openChat,

        activeChatId,

        user,
        logout,

        sidebarOpen,
        setSidebarOpen

    } = useContext(MyContext);

   const deleteChat = async (threadId, e) => {

    e.stopPropagation();

    try {

        const token = localStorage.getItem("token");

        const res = await fetch(
            `${API_URL}/chat/threads/${threadId}`,
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    ...(token && {
                        Authorization: `Bearer ${token}`
                    })
                }
            }
        );

        const data = await res.json();

        if (!res.ok) {
            console.error(data.error || "Failed to delete chat");
            return;
        }

        setChatSessions(prev =>
            prev.filter(chat => chat.id !== threadId)
        );

       
        if (activeChatId === threadId) {
            createNewChat();
        }

    } catch (err) {
        console.error("Delete chat error:", err);
    }
};

    return (

        <>

        {/* MOBILE OVERLAY */}
        <div
            className={`sidebar-overlay ${sidebarOpen ? "sidebar-open" : ""}`}
            onClick={() => setSidebarOpen(false)}
        />

        <div className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>

            <div className="sidebar-top">

                <div
                    className="sidebar-logo"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "10px",
                        marginBottom: "10px"
                    }}
                >
                    <FaRobot size={18} style={{ color: "#10a37f" }} />
                    <span style={{ fontWeight: "800", color: "#edf2f1" }}>
                        DeepGPT
                    </span>

                    {/* CLOSE BUTTON — mobile only */}
                    <button
                        className="sidebar-close-btn"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Close sidebar"
                    >
                        &#x2715;
                    </button>

                </div>

                <button
                    onClick={() => {
                        createNewChat();
                        setSidebarOpen(false);
                    }}
                    className="new-chat-btn"
                >
                    <FaPlus />
                    <span>New chat</span>
                </button>

                <div className="chat-list">

                    {chatSessions.map((chat) => (

                        <div
                            key={chat.id}
                            onClick={() => {
                                openChat(chat);
                                setSidebarOpen(false);
                            }}
                            className={`chat-item ${
                                activeChatId === chat.id
                                    ? "active-chat"
                                    : ""
                            }`}
                        >

                            <div className="chat-left">

                                <FaCommentAlt size={13} style={{ flexShrink: 0 }} />

                                <span>
                                    {chat.title}
                                </span>

                            </div>

                            <FaTrash
                                size={12}
                                style={{
                                    cursor: "pointer",
                                    color: "#ff4d4d",
                                    flexShrink: 0,
                                    marginLeft: "8px"
                                }}
                                onClick={(e) =>
                                    deleteChat(chat.id, e)
                                }
                            />

                        </div>
                    ))}

                </div>

            </div>

            <div className="sidebar-bottom">

                <div className="user-box">

                    <div className="d-flex align-items-center gap-2" style={{ minWidth: 0, overflow: "hidden" }}>

                        <FaUserCircle size={24} style={{ flexShrink: 0 }} />

                        <div style={{ minWidth: 0, overflow: "hidden" }}>

                            <div className="user-name" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {user?.name || "Using as Guest"}
                            </div>

                            <div className="user-email" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {user?.email || "No account connected"}
                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>

        </>
    );
}

export default Sidebar;
