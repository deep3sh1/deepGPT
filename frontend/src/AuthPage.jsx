import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './AuthPage.css';
import { FaArrowLeft } from 'react-icons/fa';

function AuthPage({
    authMode,
    setAuthMode,
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    error,
    setError,
    loading,
    login,
    register,
    onClose
}) {

    const handleSubmit = (e) => {
        e.preventDefault();
        if (loading) return;
        if (authMode === "login") {
            login();
        } else {
            register();
        }
    };

    return (
        <div className="auth-page-container d-flex justify-content-center align-items-center text-white">

            <div className="auth-card">

                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="auth-back-btn"
                        aria-label="Back to main page"
                    >
                        <FaArrowLeft size={12} />
                        <span>Back</span>
                    </button>
                )}

                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="auth-close-btn"
                        aria-label="Close"
                    >
                        &#x2715;
                    </button>
                )}

                <div className="text-center mb-4">

                    <h1 className="auth-title">
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

                {error && (
                    <div
                        className="alert alert-danger py-2 px-3 text-center mb-3"
                        style={{
                            fontSize: "13px",
                            borderRadius: "10px",
                            backgroundColor: "rgba(220, 53, 69, 0.15)",
                            border: "1px solid rgba(220, 53, 69, 0.4)",
                            color: "#ff8080"
                        }}
                    >
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    {authMode === "register" && (

                        <input
                            type="text"
                            placeholder="Enter your name"
                            value={name}
                            onChange={(e) => {
                                if (setError) setError("");
                                setName(e.target.value);
                            }}
                            required
                            className="form-control auth-input mb-3 bg-dark text-white border-0"
                            style={{
                                height: "48px"
                            }}
                        />
                    )}

                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => {
                            if (setError) setError("");
                            setEmail(e.target.value);
                        }}
                        required
                        className="form-control auth-input mb-3 bg-dark text-white border-0"
                        style={{
                            height: "48px"
                        }}
                    />

                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => {
                            if (setError) setError("");
                            setPassword(e.target.value);
                        }}
                        required
                        className="form-control auth-input mb-4 bg-dark text-white border-0"
                        style={{
                            height: "48px"
                        }}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn w-100 text-white"
                        style={{
                            backgroundColor: "#10a37f",
                            height: "48px",
                            borderRadius: "10px",
                            fontWeight: "600",
                            opacity: loading ? 0.7 : 1,
                            cursor: loading ? "not-allowed" : "pointer"
                        }}
                    >
                        {loading
                            ? "Please wait..."
                            : (authMode === "login" ? "Continue" : "Create account")}
                    </button>

                </form>

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
                        onClick={() => {
                            if (setError) setError("");
                            setAuthMode(
                                authMode === "login"
                                    ? "register"
                                    : "login"
                            );
                        }}
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