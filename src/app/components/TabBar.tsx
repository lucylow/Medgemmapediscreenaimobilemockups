import { useNavigate, useLocation } from "react-router";
import { Home, Users, Stethoscope, Beaker, Settings } from "lucide-react";
import { hapticSelection } from "../platform/haptics";

const tabs = [
  { path: "/dashboard", icon: Home, label: "Home" },
  { path: "/children", icon: Users, label: "Children" },
  { path: "/symptom-checker", icon: Stethoscope, label: "Check" },
  { path: "/demo-cases", icon: Beaker, label: "Demo" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

export function TabBar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex items-center justify-around border-t border-gray-200 bg-white px-2 py-1" style={{ paddingBottom: "env(safe-area-inset-bottom, 8px)" }}>
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        const Icon = tab.icon;
        return (
          <button
            key={tab.path}
            onClick={() => {
              hapticSelection();
              navigate(tab.path);
            }}
            className={`flex flex-col items-center justify-center gap-0.5 min-w-[64px] min-h-[60px] rounded-xl transition-colors ${
              isActive
                ? "text-[#1A73E8] bg-[#E8F0FE]"
                : "text-[#999999] active:bg-gray-50"
            }`}
          >
            <Icon className="w-6 h-6" />
            <span className="text-[11px] font-semibold">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
