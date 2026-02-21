import { useNavigate } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { PrimaryButton } from "../components/PrimaryButton";
import { DisclaimerFooter } from "../components/DisclaimerFooter";
import { useApp } from "../context/AppContext";
import { Plus, User, ChevronRight, Trash2, Calendar } from "lucide-react";
import { TabBar } from "../components/TabBar";

export function ChildList() {
  const navigate = useNavigate();
  const { children, removeChild, role } = useApp();

  const getAgeText = (birthDate: string): string => {
    const birth = new Date(birthDate);
    const now = new Date();
    const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    if (months < 1) return "Newborn";
    if (months < 12) return `${months} month${months !== 1 ? "s" : ""} old`;
    const years = Math.floor(months / 12);
    const rem = months % 12;
    return rem > 0 ? `${years}y ${rem}m old` : `${years} year${years !== 1 ? "s" : ""} old`;
  };

  return (
    <MobileContainer>
      <div className="h-full flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-[#1A1A1A]">
                {role === "parent" ? "My Children" : "Children"}
              </h1>
              <p className="text-sm text-[#666666]">
                {children.length === 0
                  ? "Add a child to get started"
                  : `${children.length} child${children.length !== 1 ? "ren" : ""} registered`}
              </p>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="text-sm text-[#1A73E8] font-semibold"
            >
              Dashboard
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {children.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-12">
              <div className="w-20 h-20 bg-[#E8F0FE] rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-[#1A73E8]" />
              </div>
              <h2 className="text-lg font-bold text-[#1A1A1A]">No children added yet</h2>
              <p className="text-[#666666] max-w-[280px]">
                Add a child's profile to start developmental screenings
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {children.map((child) => (
                <div
                  key={child.id}
                  className="bg-white border-2 border-gray-200 rounded-2xl p-4 flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform"
                  onClick={() => navigate(`/child/${child.id}/screening-intro`)}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-[#1A73E8] to-[#34A853] rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">
                      {child.displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[#1A1A1A] truncate">{child.displayName}</h3>
                    <div className="flex items-center gap-1 text-sm text-[#666666]">
                      <Calendar className="w-3 h-3" />
                      <span>{getAgeText(child.birthDate)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Remove ${child.displayName}'s profile and all their screening data?`)) {
                          removeChild(child.id);
                        }
                      }}
                      className="w-8 h-8 flex items-center justify-center text-[#999999] hover:text-[#EA4335] transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <ChevronRight className="w-5 h-5 text-[#999999]" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 space-y-2">
          <PrimaryButton onClick={() => navigate("/add-child")}>
            <Plus className="w-5 h-5 mr-2 inline" />
            Add Child
          </PrimaryButton>
        </div>
        <DisclaimerFooter />
        <TabBar />
      </div>
    </MobileContainer>
  );
}
