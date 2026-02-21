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
    <div
      className="flex items-center justify-around border-t px-2 py-1"
      style={{
        backgroundColor: "#020617",
        borderColor: "rgba(148,163,184,0.2)",
        paddingBottom: "env(safe-area-inset-bottom, 8px)",
      }}
    >
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
            className="flex flex-col items-center justify-center gap-0.5 min-w-[64px] min-h-[60px] rounded-xl transition-colors"
            style={{
              color: isActive ? "#38BDF8" : "#6B7280",
              backgroundColor: isActive ? "rgba(56,189,248,0.1)" : "transparent",
            }}
          >
            <Icon className="w-6 h-6" />
            <span className="text-[11px] font-semibold">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
