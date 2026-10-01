import { Search, Bell, UserCircle2 } from "lucide-react";

function Navbar() {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <h2>Overview</h2>
      </div>

      <div className="topbar-right">
        <div className="search-box">
          <Search size={18} />
          <input type="text" placeholder="Search" />
        </div>

        <button className="icon-button" type="button" aria-label="Notifications">
          <Bell size={18} />
          <span className="notification-dot" />
        </button>

        <div className="profile">
          <span className="profile-icon">
            <UserCircle2 size={22} />
          </span>
          <span>Farmer</span>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
