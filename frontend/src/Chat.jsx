import React, { useContext } from 'react';
import './chat.css';
import { MyContext } from './MyContext';

function Chat() {

    const { prevchat } = useContext(MyContext);

    return (
        <>
            {prevchat.length === 0 ? (
                <div className='chat'>
                    <h1>Start a new chat</h1>
                </div>
            ) : (
                <>
                    <div className='chat'>
                        <h1>Chat</h1>
                    </div>

                    {prevchat.map((chat, index) => (
                        <div key={index} className={`chat-message ${chat.role}`}>
                            <p>{chat.content}</p>
                        </div>
                    ))}
                </>
            )}
        </>
    );
}

export default Chat;