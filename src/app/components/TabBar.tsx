import { useNavigate, useLocation } from "react-router";
import { Home, Users, Beaker, Settings } from "lucide-react";

const tabs = [
  { path: "/dashboard", icon: Home, label: "Home" },
  { path: "/children", icon: Users, label: "Children" },
  { path: "/demo-cases", icon: Beaker, label: "Demo" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

export function TabBar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex items-center justify-around border-t border-gray-200 bg-white px-2 py-2">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        const Icon = tab.icon;
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
              isActive
                ? "text-[#1A73E8]"
                : "text-[#999999]"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-semibold">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
