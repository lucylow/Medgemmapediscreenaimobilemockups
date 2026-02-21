import { useNavigate, useParams } from "react-router";
import { MobileContainer } from "../components/MobileContainer";
import { PrimaryButton } from "../components/PrimaryButton";
import { DisclaimerFooter } from "../components/DisclaimerFooter";
import { useApp } from "../context/AppContext";
import { ArrowLeft, MessageCircle, Footprints, Hand, Users, Lightbulb } from "lucide-react";

const domainInfo = [
  { icon: MessageCircle, label: "Communication", color: "#1A73E8", desc: "How your child talks and understands" },
  { icon: Footprints, label: "Gross Motor", color: "#34A853", desc: "How your child moves and balances" },
  { icon: Hand, label: "Fine Motor", color: "#FF9800", desc: "How your child uses their hands" },
  { icon: Users, label: "Personal-Social", color: "#EA4335", desc: "How your child connects with others" },
  { icon: Lightbulb, label: "Problem Solving", color: "#9C27B0", desc: "How your child thinks and learns" },
];

export function ScreeningIntro() {
  const navigate = useNavigate();
  const { id: childId } = useParams();
  const { getChild, startSession, children } = useApp();

  const child = childId ? getChild(childId) : undefined;

  if (!child) {
    return (
      <MobileContainer>
        <div className="h-full flex items-center justify-center p-6">
          <div className="text-center space-y-4">
            <p className="text-[#666666]">Child not found</p>
            <PrimaryButton onClick={() => navigate("/children")}>Go Back</PrimaryButton>
          </div>
        </div>
      </MobileContainer>
    );
  }

  const birthDate = new Date(child.birthDate);
  const now = new Date();
  const ageMonths = (now.getFullYear() - birthDate.getFullYear()) * 12 + (now.getMonth() - birthDate.getMonth());

  const handleStart = () => {
    const session = startSession(child.id, ageMonths);
    navigate(`/screening/${session.id}/questions`);
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
          <h1 className="text-xl font-bold text-[#1A1A1A]">Start Screening</h1>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <div className="bg-gradient-to-br from-[#1A73E8] to-[#34A853] rounded-2xl p-6 text-white text-center">
            <div className="text-4xl font-bold">{child.displayName}</div>
            <div className="text-lg mt-2">{ageMonths} months old</div>
          </div>

          <div className="bg-[#F8F9FA] rounded-2xl p-5">
            <p className="text-[#1A1A1A] leading-relaxed">
              This short screening looks at how your child plays, moves, talks, learns, and 
              connects with others. <strong>It is not a test</strong>, and there are no right 
              or wrong answers. Answer based on what you typically see your child do.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">Areas We'll Look At</h2>
            <div className="space-y-3">
              {domainInfo.map((d) => (
                <div key={d.label} className="flex items-center gap-4 p-3 bg-white border-2 border-gray-100 rounded-xl">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: d.color + "20" }}
                  >
                    <d.icon className="w-5 h-5" style={{ color: d.color }} />
                  </div>
                  <div>
                    <p className="font-semibold text-[#1A1A1A]">{d.label}</p>
                    <p className="text-sm text-[#666666]">{d.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#FFF3E0] rounded-2xl p-4">
            <p className="text-sm text-[#E65100]">
              Takes about 5-10 minutes. You can answer for each area, then review before submitting.
            </p>
          </div>
        </div>

        <div className="px-6 py-4">
          <PrimaryButton onClick={handleStart} variant="success">
            Begin Screening
          </PrimaryButton>
        </div>
        <DisclaimerFooter />
      </div>
    </MobileContainer>
  );
}
