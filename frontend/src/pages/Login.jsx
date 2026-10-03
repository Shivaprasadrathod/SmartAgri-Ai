import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
    const navigate = useNavigate();

    // Login states
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Registration states
    const [name, setName] = useState("");
    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");

    // Modal state
    const [showRegister, setShowRegister] = useState(false);

    // UI states
    const [showPassword, setShowPassword] = useState(false);
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // =========================
    // LOGIN
    // =========================

    const handleLogin = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const response = await fetch(
                "http://127.0.0.1:8000/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: email,
                        password: password,
                    }),
                }
            );

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user || null)
                );

                navigate("/dashboard");
            } else {
                setError(data.message || "Login failed.");
            }
        } catch (error) {
            console.error(error);
            setError(
                "Unable to connect to the server. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // REGISTRATION
    // =========================

    const handleRegister = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const response = await fetch(
                "http://127.0.0.1:8000/auth/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: name,
                        email: registerEmail,
                        password: registerPassword,
                    }),
                }
            );

            const data = await response.json();

            if (response.ok) {
                setSuccess("Account created successfully!");

                const createdEmail = registerEmail;

                setName("");
                setRegisterEmail("");
                setRegisterPassword("");

                setTimeout(() => {
                    setShowRegister(false);
                    setSuccess("");
                    setEmail(createdEmail);
                    setError("");
                }, 1200);
            } else {
                setError(
                    data.message || "Registration failed."
                );
            }
        } catch (error) {
            console.error(error);
            setError(
                "Unable to connect to the server. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // OPEN REGISTER MODAL
    // =========================

    const openRegister = () => {
        setError("");
        setSuccess("");
        setShowRegister(true);
    };

    // =========================
    // CLOSE REGISTER MODAL
    // =========================

    const closeRegister = () => {
        setShowRegister(false);
        setError("");
        setSuccess("");
        setName("");
        setRegisterEmail("");
        setRegisterPassword("");
    };

    return (
        <div className="auth-page">

            {/* =========================
                LEFT HERO SECTION
            ========================= */}

            <div className="auth-hero">

                <div className="auth-hero-overlay"></div>

                <div className="auth-hero-content">

                    <div className="auth-brand">
                        <div className="auth-brand-icon">
                            🌱
                        </div>

                        <span>SmartAgri-Ai</span>
                    </div>

                    <div className="auth-hero-text">

                        <p className="auth-small-title">
                            SMART FARMING • SMART FUTURE
                        </p>

                        <h1>
                            Grow smarter.
                            <br />
                            Farm better.
                        </h1>

                        <p>
                            Your intelligent farming companion
                            for smarter decisions, better
                            productivity and a healthier farm.
                        </p>

                    </div>

                    <div className="auth-features">

                        <div className="auth-feature">
                            <span>🌾</span>
                            <p>Smart Farming</p>
                        </div>

                        <div className="auth-feature">
                            <span>🤖</span>
                            <p>AI Assistance</p>
                        </div>

                        <div className="auth-feature">
                            <span>📊</span>
                            <p>Farm Insights</p>
                        </div>

                    </div>

                </div>
            </div>

            {/* =========================
                RIGHT LOGIN SECTION
            ========================= */}

            <div className="auth-section">

                <div className="auth-card">

                    {/* Mobile brand */}

                    <div className="mobile-brand">

                        <div className="auth-brand-icon">
                            🌱
                        </div>

                        <span>SmartAgri-Ai</span>

                    </div>

                    {/* =========================
                        LOGIN FORM
                    ========================= */}

                    <div className="auth-heading">

                        <p className="auth-welcome">
                            WELCOME BACK
                        </p>

                        <h2>Farmer Login</h2>

                        <p>
                            Sign in to continue to your
                            SmartAgri-Ai dashboard.
                        </p>

                    </div>

                    <form onSubmit={handleLogin}>

                        {/* Email */}

                        <div className="form-group">

                            <label htmlFor="login-email">
                                Email Address
                            </label>

                            <div className="input-wrapper">

                                <span className="input-icon">
                                    ✉
                                </span>

                                <input
                                    id="login-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                    placeholder="Enter your email"
                                    required
                                />

                            </div>

                        </div>

                        {/* Password */}

                        <div className="form-group">

                            <label htmlFor="login-password">
                                Password
                            </label>

                            <div className="input-wrapper">

                                <span className="input-icon">
                                    🔒
                                </span>

                                <input
                                    id="login-password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder="Enter your password"
                                    required
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                >
                                    {showPassword
                                        ? "Hide"
                                        : "Show"}
                                </button>

                            </div>

                        </div>

                        {/* Error */}

                        {error && !showRegister && (
                            <div className="auth-error">
                                {error}
                            </div>
                        )}

                        {/* Login button */}

                        <button
                            type="submit"
                            className="auth-button"
                            disabled={loading}
                        >
                            {loading
                                ? "Signing in..."
                                : "Sign In"}

                            {!loading && (
                                <span>→</span>
                            )}
                        </button>

                    </form>

                    {/* Create account */}

                    <div className="switch-auth">

                        <span>
                            Don't have an account?
                        </span>

                        <button
                            type="button"
                            onClick={openRegister}
                        >
                            Create an account
                        </button>

                    </div>

                    {/* Footer */}

                    <div className="auth-footer">

                        <span>🔐 Secure</span>

                        <span>•</span>

                        <span>SmartAgri-Ai</span>

                    </div>

                </div>

            </div>

            {/* =========================
                REGISTER MODAL
            ========================= */}

            {showRegister && (

                <div
                    className="register-modal-overlay"
                    onClick={closeRegister}
                >

                    <div
                        className="register-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        {/* Close button */}

                        <button
                            type="button"
                            className="register-modal-close"
                            onClick={closeRegister}
                        >
                            ×
                        </button>

                        {/* Heading */}

                        <div className="register-modal-heading">

                            <div className="register-modal-icon">
                                🌱
                            </div>

                            <div>
                                <p className="auth-welcome">
                                    GET STARTED
                                </p>

                                <h2>Create Account</h2>

                                <p>
                                    Create your SmartAgri-Ai
                                    account.
                                </p>
                            </div>

                        </div>

                        {/* Registration form */}

                        <form onSubmit={handleRegister}>

                            {/* Name */}

                            <div className="form-group">

                                <label htmlFor="register-name">
                                    Name
                                </label>

                                <div className="input-wrapper">

                                    <span className="input-icon">
                                        👤
                                    </span>

                                    <input
                                        id="register-name"
                                        type="text"
                                        value={name}
                                        onChange={(e) =>
                                            setName(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter your name"
                                        required
                                    />

                                </div>

                            </div>

                            {/* Email */}

                            <div className="form-group">

                                <label htmlFor="register-email">
                                    Email Address
                                </label>

                                <div className="input-wrapper">

                                    <span className="input-icon">
                                        ✉
                                    </span>

                                    <input
                                        id="register-email"
                                        type="email"
                                        value={registerEmail}
                                        onChange={(e) =>
                                            setRegisterEmail(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter your email"
                                        required
                                    />

                                </div>

                            </div>

                            {/* Password */}

                            <div className="form-group">

                                <label htmlFor="register-password">
                                    Password
                                </label>

                                <div className="input-wrapper">

                                    <span className="input-icon">
                                        🔒
                                    </span>

                                    <input
                                        id="register-password"
                                        type={
                                            showRegisterPassword
                                                ? "text"
                                                : "password"
                                        }
                                        value={registerPassword}
                                        onChange={(e) =>
                                            setRegisterPassword(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Create a password"
                                        required
                                    />

                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() =>
                                            setShowRegisterPassword(
                                                !showRegisterPassword
                                            )
                                        }
                                    >
                                        {showRegisterPassword
                                            ? "Hide"
                                            : "Show"}
                                    </button>

                                </div>

                            </div>

                            {/* Registration error */}

                            {error && (
                                <div className="auth-error">
                                    {error}
                                </div>
                            )}

                            {/* Registration success */}

                            {success && (
                                <div className="auth-success">
                                    {success}
                                </div>
                            )}

                            {/* Create account button */}

                            <button
                                type="submit"
                                className="auth-button"
                                disabled={loading}
                            >
                                {loading
                                    ? "Creating Account..."
                                    : "Create Account"}

                                {!loading && (
                                    <span>→</span>
                                )}
                            </button>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}

export default Login;