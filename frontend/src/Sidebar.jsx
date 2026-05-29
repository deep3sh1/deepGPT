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
        logout

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

        } catch (err) {
            console.error("Delete chat error:", err);
        }
    };

    return (

        <div className="sidebar">

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
                </div>

                <button
                    onClick={createNewChat}
                    className="new-chat-btn"
                >
                    <FaPlus />
                    <span>New chat</span>
                </button>

                <div className="chat-list">

                    {chatSessions.map((chat) => (

                        <div
                            key={chat.id}
                            onClick={() => openChat(chat)}
                            className={`chat-item ${
                                activeChatId === chat.id
                                    ? "active-chat"
                                    : ""
                            }`}
                        >

                            <div className="chat-left">

                                <FaCommentAlt size={13} />

                                <span>
                                    {chat.title}
                                </span>

                            </div>

                            <FaTrash
                                size={12}
                                style={{
                                    cursor: "pointer",
                                    color: "#ff4d4d"
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

                    <div className="d-flex align-items-center gap-2">

                        <FaUserCircle size={24} />

                        <div>

                            <div className="user-name">
                                {user?.name || "Using as Guest"}
                            </div>

                            <div className="user-email">
                                {user?.email || "No account connected"}
                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Sidebar;