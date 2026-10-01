import { useEffect, useState } from "react";
import { Bell, MapPin, ShieldCheck, Tractor } from "lucide-react";

const defaultSettings = {
	name: "Ramesh Kumar",
	farmName: "Green Valley Farm",
	location: "Nashik, Maharashtra",
	farmSize: "12 acres",
	email: "ramesh@smartagri.ai",
	phone: "9876543210",
	irrigationMode: "Drip",
	notifications: true,
	aiInsights: true,
	autoScheduling: true,
};

function Settings() {
	const [settings, setSettings] = useState(() => {
		try {
			return JSON.parse(localStorage.getItem("smartagri-settings") || "null") || defaultSettings;
		} catch {
			return defaultSettings;
		}
	});
	const [message, setMessage] = useState("");

	useEffect(() => {
		localStorage.setItem("smartagri-settings", JSON.stringify(settings));
	}, [settings]);

	const handleChange = (event) => {
		const { name, value } = event.target;
		setSettings((current) => ({ ...current, [name]: value }));
	};

	const handleToggle = (key) => {
		setSettings((current) => ({ ...current, [key]: !current[key] }));
	};

	const saveSettings = (event) => {
		event.preventDefault();
		setMessage("Profile settings saved successfully.");
	};

	return (
		<div className="page-shell">
			<div className="page-hero">
				<div>
					<div className="page-badge">
						<ShieldCheck size={17} />
						Settings
					</div>
					<h1>Farm Settings</h1>
					<p>Manage profile, alerts and operational preferences for your farm.</p>
				</div>
				<img src="https://images.unsplash.com/photo-1464226184884-fa52ac9fcf5a?auto=format&fit=crop&w=900&q=80" alt="Farm profile" />
			</div>

			<div className="settings-layout">
				<section className="panel">
					<div className="section-header">
						<div>
							<p className="eyebrow">Profile</p>
							<h2>Farmer Profile</h2>
						</div>
					</div>

					<form className="settings-form" onSubmit={saveSettings}>
						<div className="field-grid">
							<label>
								Farmer name
								<input name="name" value={settings.name} onChange={handleChange} />
							</label>
							<label>
								Farm name
								<input name="farmName" value={settings.farmName} onChange={handleChange} />
							</label>
							<label>
								Email
								<input name="email" type="email" value={settings.email} onChange={handleChange} />
							</label>
							<label>
								Phone
								<input name="phone" value={settings.phone} onChange={handleChange} />
							</label>
							<label>
								Location
								<input name="location" value={settings.location} onChange={handleChange} />
							</label>
							<label>
								Farm size
								<input name="farmSize" value={settings.farmSize} onChange={handleChange} />
							</label>
							<label>
								Irrigation mode
								<input name="irrigationMode" value={settings.irrigationMode} onChange={handleChange} />
							</label>
						</div>

						<button type="submit" className="primary-btn">Save Changes</button>
						{message && <div className="status-banner is-active"><strong>Saved</strong><span>{message}</span></div>}
					</form>
				</section>

				<aside className="panel side-panel">
					<div className="section-header">
						<div>
							<p className="eyebrow">Preferences</p>
							<h2>Account</h2>
						</div>
					</div>

					<div className="profile-summary">
						<div className="avatar"><Tractor size={20} /></div>
						<div>
							<strong>{settings.name}</strong>
							<span>{settings.farmName}</span>
						</div>
					</div>

					<div className="toggle-list" style={{ marginTop: "18px" }}>
						<div className="toggle-row">
							<div className="toggle-copy">
								<Bell size={16} />
								<span>Notifications</span>
							</div>
							<input type="checkbox" checked={settings.notifications} onChange={() => handleToggle("notifications")} />
						</div>
						<div className="toggle-row">
							<div className="toggle-copy">
								<ShieldCheck size={16} />
								<span>AI insights</span>
							</div>
							<input type="checkbox" checked={settings.aiInsights} onChange={() => handleToggle("aiInsights")} />
						</div>
						<div className="toggle-row">
							<div className="toggle-copy">
								<MapPin size={16} />
								<span>Auto scheduling</span>
							</div>
							<input type="checkbox" checked={settings.autoScheduling} onChange={() => handleToggle("autoScheduling")} />
						</div>
					</div>
				</aside>
			</div>
		</div>
	);
}

export default Settings;
