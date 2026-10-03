import { useEffect, useState } from "react";

function Dashboard() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem("user");
            const userStr = storedUser === "undefined" ? "null" : (storedUser || "null");
            const parsedUser = JSON.parse(userStr);
            setUser(parsedUser);
        } catch (error) {
            console.error("Invalid user data:", error);
        }
    }, []);

    return (
        <div className="dashboard-page">

            {/* Header */}
            <div className="dashboard-header">
                <div>
                    <p className="dashboard-label">
                        SMARTAGRI-AI
                    </p>

                    <h1>
                        Good Morning, {user?.name || "Farmer"} 👋
                    </h1>

                    <p className="dashboard-subtitle">
                        Welcome back! Here is your farm overview.
                    </p>
                </div>

                <div className="dashboard-date">
                    🌱 Smart Farming
                </div>
            </div>

            {/* Statistics */}
            <div className="dashboard-stats">

                <div className="dashboard-stat-card">
                    <div className="stat-icon">
                        🌾
                    </div>

                    <div>
                        <p>Active Crops</p>
                        <h2>5</h2>
                    </div>
                </div>

                <div className="dashboard-stat-card">
                    <div className="stat-icon">
                        💧
                    </div>

                    <div>
                        <p>Water Usage</p>
                        <h2>68%</h2>
                    </div>
                </div>

                <div className="dashboard-stat-card">
                    <div className="stat-icon">
                        🌡️
                    </div>

                    <div>
                        <p>Temperature</p>
                        <h2>28°C</h2>
                    </div>
                </div>

                <div className="dashboard-stat-card">
                    <div className="stat-icon">
                        📈
                    </div>

                    <div>
                        <p>Farm Health</p>
                        <h2>Good</h2>
                    </div>
                </div>

            </div>

            {/* Main Content */}
            <div className="dashboard-grid">

                {/* Weather */}
                <div className="dashboard-card weather-card">

                    <div className="card-header">
                        <div>
                            <p className="card-label">
                                WEATHER
                            </p>

                            <h2>Today's Weather</h2>
                        </div>

                        <span className="card-icon">
                            ☀️
                        </span>
                    </div>

                    <div className="weather-main">
                        <span className="weather-temperature">
                            28°
                        </span>

                        <div>
                            <strong>Sunny</strong>
                            <p>Sandur, Karnataka</p>
                        </div>
                    </div>

                    <div className="weather-details">

                        <div>
                            <span>💧</span>
                            <p>Humidity</p>
                            <strong>62%</strong>
                        </div>

                        <div>
                            <span>💨</span>
                            <p>Wind</p>
                            <strong>12 km/h</strong>
                        </div>

                        <div>
                            <span>🌧️</span>
                            <p>Rain</p>
                            <strong>10%</strong>
                        </div>

                    </div>

                </div>

                {/* Farm Health */}
                <div className="dashboard-card">

                    <div className="card-header">
                        <div>
                            <p className="card-label">
                                FARM STATUS
                            </p>

                            <h2>Farm Health</h2>
                        </div>

                        <span className="card-icon">
                            🌱
                        </span>
                    </div>

                    <div className="health-content">

                        <div className="health-circle">
                            <span>82%</span>
                            <small>Healthy</small>
                        </div>

                        <div className="health-info">

                            <div>
                                <span>Crop Health</span>
                                <strong>Good</strong>
                            </div>

                            <div>
                                <span>Soil Condition</span>
                                <strong>Good</strong>
                            </div>

                            <div>
                                <span>Irrigation</span>
                                <strong>Normal</strong>
                            </div>

                        </div>

                    </div>

                </div>

            </div>

            {/* Bottom Section */}
            <div className="dashboard-bottom-grid">

                {/* Today's Tasks */}
                <div className="dashboard-card">

                    <div className="card-header">

                        <div>
                            <p className="card-label">
                                FARMING
                            </p>

                            <h2>Today's Tasks</h2>
                        </div>

                        <span className="card-icon">
                            📋
                        </span>

                    </div>

                    <div className="task-list">

                        <div className="task-item">
                            <span className="task-check">
                                ✓
                            </span>

                            <div>
                                <strong>
                                    Check irrigation system
                                </strong>

                                <p>
                                    Morning task
                                </p>
                            </div>
                        </div>

                        <div className="task-item">
                            <span className="task-check pending">
                                •
                            </span>

                            <div>
                                <strong>
                                    Check crop health
                                </strong>

                                <p>
                                    Recommended today
                                </p>
                            </div>
                        </div>

                        <div className="task-item">
                            <span className="task-check pending">
                                •
                            </span>

                            <div>
                                <strong>
                                    Review fertilizer plan
                                </strong>

                                <p>
                                    Recommended today
                                </p>
                            </div>
                        </div>

                    </div>

                </div>

                {/* AI Assistant */}
                <div className="dashboard-card ai-card">

                    <div className="ai-icon">
                        🤖
                    </div>

                    <p className="card-label">
                        AI ASSISTANT
                    </p>

                    <h2>
                        Need help with your farm?
                    </h2>

                    <p>
                        Ask SmartAgri-Ai about crops,
                        diseases, irrigation, fertilizers,
                        weather and more.
                    </p>

                    <button
                        type="button"
                        className="ai-button"
                    >
                        Ask AI Assistant →
                    </button>

                </div>

            </div>

        </div>
    );
}

export default Dashboard;