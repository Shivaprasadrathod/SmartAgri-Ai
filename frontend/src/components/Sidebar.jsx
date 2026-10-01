import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  Sprout,
  Bot,
  Camera,
  Droplets,
  Wheat,
  Truck,
  ShoppingCart,
  Store,
  Settings
} from "lucide-react";


function Sidebar() {

  const menuItems = [

    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard
    },

    {
      name: "Farming Guide",
      path: "/farming-guide",
      icon: Sprout
    },

    {
      name: "AI Assistant",
      path: "/ai-assistant",
      icon: Bot
    },

    {
      name: "Disease Detection",
      path: "/disease-detection",
      icon: Camera
    },

    {
      name: "Irrigation",
      path: "/irrigation",
      icon: Droplets
    },

    {
      name: "Crop Guide",
      path: "/crop-guide",
      icon: Wheat
    },

    {
      name: "Fertilizer",
      path: "/fertilizer",
      icon: Wheat
    },

    {
      name: "Agri Delivery",
      path: "/delivery",
      icon: Truck
    },

    {
      name: "Products",
      path: "/products",
      icon: ShoppingCart
    },

    {
      name: "Market",
      path: "/market",
      icon: Store
    },

    {
      name: "Settings",
      path: "/settings",
      icon: Settings
    }

  ];


  return (

    <aside className="sidebar">

      <div className="logo">

        <span>🌱</span>

        <h2>SmartAgri AI</h2>

      </div>


      <nav className="sidebar-menu">

        {menuItems.map((item) => {

          const Icon = item.icon;

          return (

            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive
                  ? "sidebar-link active"
                  : "sidebar-link"
              }
            >

              <Icon size={21} />

              <span>{item.name}</span>

            </NavLink>

          );

        })}

      </nav>

    </aside>

  );
}

export default Sidebar;