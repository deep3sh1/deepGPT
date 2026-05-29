import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './AuthPage.css';

function AuthPage({
    authMode,
    setAuthMode,
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    login,
    register
}) {

    return (
        <div
            className="d-flex justify-content-center align-items-center text-white"
            style={{
                height: "100vh",
                backgroundColor: "#212121"
            }}
        >

            <div
                style={{
                    width: "420px",
                    backgroundColor: "#171717",
                    border: "1px solid #2f2f2f",
                    borderRadius: "18px",
                    padding: "40px"
                }}
            >

                <div className="text-center mb-4">

                    <h1
                        style={{
                            fontSize: "34px",
                            fontWeight: "700"
                        }}
                    >
                        DeepGPT
                    </h1>

                    <p
                        style={{
                            color: "#9e9e9e",
                            marginTop: "10px"
                        }}
                    >
                        {authMode === "login"
                            ? "Welcome back"
                            : "Create your account"}
                    </p>

                </div>

                {authMode === "register" && (

                    <input
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="form-control mb-3 bg-dark text-white border-0"
                        style={{
                            height: "48px"
                        }}
                    />
                )}

                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-control mb-3 bg-dark text-white border-0"
                    style={{
                        height: "48px"
                    }}
                />

                <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-control mb-4 bg-dark text-white border-0"
                    style={{
                        height: "48px"
                    }}
                />

                <button
                    className="btn w-100 text-white"
                    style={{
                        backgroundColor: "#10a37f",
                        height: "48px",
                        borderRadius: "10px",
                        fontWeight: "600"
                    }}
                    onClick={
                        authMode === "login"
                            ? login
                            : register
                    }
                >
                    {authMode === "login"
                        ? "Continue"
                        : "Create account"}
                </button>

                <div
                    className="text-center mt-4"
                    style={{
                        color: "#9e9e9e",
                        fontSize: "14px"
                    }}
                >

                    {authMode === "login"
                        ? "Don't have an account?"
                        : "Already have an account?"}

                    <span
                        onClick={() =>
                            setAuthMode(
                                authMode === "login"
                                    ? "register"
                                    : "login"
                            )
                        }
                        style={{
                            color: "white",
                            cursor: "pointer",
                            marginLeft: "6px"
                        }}
                    >
                        {authMode === "login"
                            ? "Sign up"
                            : "Login"}
                    </span>

                </div>

            </div>

        </div>
    );
}

export default AuthPage;