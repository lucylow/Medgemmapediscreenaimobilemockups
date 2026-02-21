import { useState } from "react";
import { useNavigate } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { PrimaryButton } from "../components/PrimaryButton";
import { useApp } from "../context/AppContext";
import { ArrowLeft } from "lucide-react";

export function AddChild() {
  const navigate = useNavigate();
  const { addChild } = useApp();
  const [displayName, setDisplayName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [sex, setSex] = useState<"male" | "female" | "other" | "prefer_not_to_say">("prefer_not_to_say");

  const maxDate = new Date().toISOString().split("T")[0];
  const fiveYearsAgo = new Date();
  fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
  const minDate = fiveYearsAgo.toISOString().split("T")[0];

  const canSubmit = displayName.trim().length > 0 && birthDate.length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const child = addChild({
      displayName: displayName.trim(),
      birthDate,
      sex,
    });
    navigate(`/child/${child.id}/screening-intro`);
  };

  return (
    <MobileContainer>
      <div className="h-full flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 z-10">
          <button
            onClick={() => navigate("/children")}
            className="w-10 h-10 flex items-center justify-center"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-[#1A1A1A]">Add Child</h1>
        </div>

        <div className="flex-1 px-6 py-6 space-y-6">
          <p className="text-[#666666]">
            Enter your child's information to start their developmental screening. 
            You can use a nickname — we keep things private.
          </p>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#1A1A1A]">
              Child's Name or Nickname
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g., Mia, Baby J, Little One"
              className="w-full h-[56px] bg-[#F8F9FA] border-2 border-gray-200 rounded-2xl px-4 text-[#1A1A1A] placeholder-[#999999] focus:border-[#1A73E8] focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#1A1A1A]">
              Date of Birth
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              min={minDate}
              max={maxDate}
              className="w-full h-[56px] bg-[#F8F9FA] border-2 border-gray-200 rounded-2xl px-4 text-[#1A1A1A] focus:border-[#1A73E8] focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-[#1A1A1A]">
              Sex (optional)
            </label>
            <div className="grid grid-cols-2 gap-3">
              {([
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "other", label: "Other" },
                { value: "prefer_not_to_say", label: "Prefer not to say" },
              ] as const).map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSex(option.value)}
                  className={`h-[48px] rounded-2xl border-2 font-semibold text-sm transition-all ${
                    sex === option.value
                      ? "border-[#1A73E8] bg-[#E8F0FE] text-[#1A73E8]"
                      : "border-gray-200 bg-white text-[#666666]"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#E8F0FE] rounded-2xl p-4">
            <p className="text-sm text-[#1A73E8]">
              We store minimal information on your device only. No data is sent anywhere 
              without your knowledge. You can delete all data at any time.
            </p>
          </div>
        </div>

        <div className="px-6 py-4">
          <PrimaryButton onClick={handleSubmit} disabled={!canSubmit}>
            Continue to Screening
          </PrimaryButton>
        </div>
      </div>
    </MobileContainer>
  );
}
