import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import { gsap } from "gsap";
import { Users, ArrowLeft } from "lucide-react";

interface TeamMember {
  admission_number: string;
  name: string;
  position: string;
  image_url: string;
}

const TeamPage: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Custom ranking function matching your exact hierarchical sequence
  const getPositionRank = (position: string): number => {
    if (!position) return 999; 
    
    const pos = position.toLowerCase();

    // Tier 1: Top Leadership
    if (pos.includes("ambassador")) return 1;
    if (pos.includes("student head")) return 2;

    // Tier 2: Core Heads (Exact Sequence: PC -> Finance -> Media/Op -> Editorial -> PR -> Design -> Inquisitive -> Web -> Doc)
    if (pos.includes("pc head") || pos.includes("program coordinator head") || pos === "program coordinator") return 10;
    if (pos.includes("finance head")) return 20;
    if (pos.includes("media and operation") || (pos.includes("operation") && pos.includes("head")) || (pos.includes("media") && pos.includes("head"))) return 30;
    if (pos.includes("editorial head")) return 40;
    if (pos.includes("pr head") || pos.includes("public relations head")) return 50;
    if (pos.includes("design head")) return 60;
    if (pos.includes("inquizitive") && pos.includes("head")) return 70;
    if (pos.includes("web head")) return 80;
    if (pos.includes("doc head") || pos.includes("documentation head") || pos.includes("content & documentation head")) return 90;

    // Tier 3: Team Members (Following the exact same departmental order)
    if (pos.includes("pc team") || pos.includes("program coordinator team")) return 110;
    if (pos.includes("finance team")) return 120;
    if (pos.includes("media team") || pos.includes("operation team") || pos.includes("operations team")) return 130;
    if (pos.includes("editorial team")) return 140;
    if (pos.includes("public relations") || pos.includes("pr team")) return 150;
    if (pos.includes("design team")) return 160;
    if (pos.includes("inquizitive")) return 170; 
    if (pos.includes("web team")) return 180;
    if (pos.includes("documentation team") || pos.includes("doc team")) return 190;

    // Default fallback for any other roles
    return 999;
  };

  useEffect(() => {
    const fetchAllMembers = async () => {
      try {
        const { data, error } = await supabase
          .from("committee_members")
          .select("admission_number, name, position, image_url");

        if (error) throw error;

        if (data) {
          const sortedData = data.sort((a, b) => {
            const rankA = getPositionRank(a.position);
            const rankB = getPositionRank(b.position);

            if (rankA !== rankB) {
              return rankA - rankB;
            }
            
            return a.name.localeCompare(b.name);
          });

          setTeamMembers(sortedData);
        }
      } catch (error) {
        console.error("Error fetching team members:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllMembers();
  }, []);

  // GSAP Animation targets all elements with the 'member-card' class
  useEffect(() => {
    if (!isLoading && containerRef.current) {
      const cards = containerRef.current.querySelectorAll('.member-card');
      if (cards.length > 0) {
        gsap.fromTo(
          cards,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.05,
            ease: "power3.out",
          }
        );
      }
    }
  }, [isLoading]);

  // Split sorted members into visual groups based on their ranks
  const topLeadership = teamMembers.filter(m => getPositionRank(m.position) <= 2);
  const coreHeads = teamMembers.filter(m => {
    const rank = getPositionRank(m.position);
    return rank >= 10 && rank <= 90;
  });
  const teamMembersList = teamMembers.filter(m => {
    const rank = getPositionRank(m.position);
    return rank >= 110;
  });

  // Helper function to render a member profile card
  const renderMember = (member: TeamMember, sizeClass: string = "w-32 h-32") => (
    <Link
      key={member.admission_number}
      to={`/team/${member.admission_number}`}
      className="member-card flex flex-col items-center text-center group transform-gpu transition-all duration-500 hover:-translate-y-2 p-4"
    >
      <div className={`relative mb-5 ${sizeClass}`}>
        <div className="w-full h-full rounded-full overflow-hidden border-2 border-white/10 group-hover:border-neon-blue group-hover:shadow-[0_0_25px_rgba(0,245,255,0.3)] transition-all duration-500">
          <img
            src={member.image_url || ""}
            alt={member.name}
            loading="lazy" 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
              target.nextElementSibling!.classList.remove("hidden");
              target.nextElementSibling!.classList.add("flex");
            }}
          />
          <div className="hidden w-full h-full bg-gray-800 items-center justify-center absolute inset-0">
            <Users className="w-10 h-10 text-gray-500" />
          </div>
        </div>
      </div>
      
      <h3 className="text-white font-semibold text-lg mb-1 group-hover:text-neon-blue transition-colors duration-300">
        {member.name}
      </h3>
      <p className="text-neon-purple/80 text-sm font-medium tracking-wide">
        {member.position}
      </p>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-900 pt-28 pb-32 px-6 font-lexend relative overflow-x-hidden">
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-neon-blue/10 blur-[150px] rounded-full pointer-events-none transform-gpu" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20 relative">
          <button
            onClick={() => navigate("/")}
            className="absolute left-0 top-1/2 -translate-y-1/2 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-colors hidden md:block"
          >
            <ArrowLeft className="w-5 h-5 text-gray-300" />
          </button>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Our Team
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Meet the Execom Committee
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-blue"></div>
          </div>
        ) : (
          <div ref={containerRef} className="flex flex-col gap-16">
            
            {/* Tier 1: Top Leadership */}
            {topLeadership.length > 0 && (
              <div className="flex flex-wrap justify-center gap-8 md:gap-16">
                {topLeadership.map(member => renderMember(member, "w-40 h-40 md:w-48 md:h-48"))}
              </div>
            )}

            {/* Tier 2: Core Heads in Exact Sequence */}
            {coreHeads.length > 0 && (
              <div className="flex flex-wrap justify-center gap-6 md:gap-12">
                {coreHeads.map(member => renderMember(member, "w-32 h-32 md:w-36 md:h-36"))}
              </div>
            )}

            {/* Tier 3: Team Members in Corresponding Department Order */}
            {teamMembersList.length > 0 && (
              <div className="flex flex-wrap justify-center gap-6 md:gap-10 mt-8">
                {teamMembersList.map(member => renderMember(member, "w-24 h-24 md:w-28 md:h-28"))}
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

export default TeamPage;