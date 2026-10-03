import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";

function Register() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

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
                        email: email,
                        password: password,
                    }),
                }
            );

            const data = await response.json();

            if (response.ok) {
                setSuccess("Account created successfully!");

                // After successful registration,
                // go to Login page after a short delay.
                setTimeout(() => {
                    navigate("/login");
                }, 1000);
            } else {
                setError(data.message || "Registration failed.");
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

    return (
        <div className="register-page">

            {/* Left Hero Section */}
            <div className="register-hero">
                <div className="register-hero-overlay"></div>

                <div className="register-hero-content">

                    <div className="register-brand">
                        <div className="register-brand-icon">🌱</div>
                        <span>SmartAgri-Ai</span>
                    </div>

                    <div className="register-hero-text">

                        <p className="register-small-title">
                            SMART FARMING • SMART FUTURE
                        </p>

                        <h1>
                            Start your
                            <br />
                            smart farming journey.
                        </h1>

                        <p>
                            Create your SmartAgri-Ai account and get access
                            to intelligent tools designed to help farmers
                            make better decisions.
                        </p>

                    </div>

                    <div className="register-features">

                        <div className="register-feature">
                            <span>🌾</span>
                            <p>Smart Farming</p>
                        </div>

                        <div className="register-feature">
                            <span>🤖</span>
                            <p>AI Assistance</p>
                        </div>

                        <div className="register-feature">
                            <span>📊</span>
                            <p>Farm Insights</p>
                        </div>

                    </div>

                </div>
            </div>

            {/* Registration Section */}
            <div className="register-section">

                <div className="register-card">

                    {/* Mobile Brand */}
                    <div className="register-mobile-brand">
                        <div className="register-brand-icon">
                            🌱
                        </div>

                        <span>SmartAgri-Ai</span>
                    </div>

                    {/* Heading */}
                    <div className="register-heading">

                        <p className="register-welcome">
                            GET STARTED
                        </p>

                        <h2>Create Account</h2>

                        <p>
                            Join SmartAgri-Ai and manage your farming
                            smarter.
                        </p>

                    </div>

                    {/* Form */}
                    <form onSubmit={handleRegister}>

                        {/* Name */}
                        <div className="register-form-group">

                            <label htmlFor="name">
                                Full Name
                            </label>

                            <div className="register-input-wrapper">

                                <span className="register-input-icon">
                                    👤
                                </span>

                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) =>
                                        setName(e.target.value)
                                    }
                                    placeholder="Enter your full name"
                                    required
                                />

                            </div>

                        </div>

                        {/* Email */}
                        <div className="register-form-group">

                            <label htmlFor="email">
                                Email Address
                            </label>

                            <div className="register-input-wrapper">

                                <span className="register-input-icon">
                                    ✉
                                </span>

                                <input
                                    id="email"
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
                        <div className="register-form-group">

                            <label htmlFor="password">
                                Password
                            </label>

                            <div className="register-input-wrapper">

                                <span className="register-input-icon">
                                    🔒
                                </span>

                                <input
                                    id="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder="Create a password"
                                    required
                                />

                                <button
                                    type="button"
                                    className="register-password-toggle"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                >
                                    {showPassword
                                        ? "Hide"
                                        : "Show"}
                                </button>

                            </div>

                        </div>

                        {/* Confirm Password */}
                        <div className="register-form-group">

                            <label htmlFor="confirmPassword">
                                Confirm Password
                            </label>

                            <div className="register-input-wrapper">

                                <span className="register-input-icon">
                                    🔐
                                </span>

                                <input
                                    id="confirmPassword"
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Confirm your password"
                                    required
                                />

                                <button
                                    type="button"
                                    className="register-password-toggle"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword
                                        )
                                    }
                                >
                                    {showConfirmPassword
                                        ? "Hide"
                                        : "Show"}
                                </button>

                            </div>

                        </div>

                        {/* Error */}
                        {error && (
                            <div className="register-error">
                                {error}
                            </div>
                        )}

                        {/* Success */}
                        {success && (
                            <div className="register-success">
                                {success}
                            </div>
                        )}

                        {/* Button */}
                        <button
                            type="submit"
                            className="register-button"
                            disabled={loading}
                        >
                            {loading
                                ? "Creating Account..."
                                : "Create Account"}

                            {!loading && <span>→</span>}
                        </button>

                    </form>

                    {/* Login Link */}
                    <div className="register-login-section">

                        <span>
                            Already have an account?
                        </span>

                        <Link to="/login">
                            Sign in
                        </Link>

                    </div>

                    {/* Footer */}
                    <div className="register-footer">

                        <span>🔐 Secure Registration</span>

                        <span>•</span>

                        <span>SmartAgri-Ai</span>

                    </div>

                </div>

            </div>

        </div>
    );
}

export default Register;