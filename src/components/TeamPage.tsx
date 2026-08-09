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

  // Custom function to determine the rank of a position and its corresponding team members
  const getPositionRank = (position: string): number => {
    if (!position) return 99; 
    
    const pos = position.toLowerCase();

    // Tier 1: Top Leadership
    if (pos.includes("ambassador")) return 1;
    if (pos.includes("student head")) return 2;

    // Tier 2: Core Heads & Their Corresponding Sub-Teams (Sub-teams get ranked immediately after their head)
    if (pos.includes("pc head") || pos.includes("program coordinator head") || pos === "program coordinator") return 3;
    if (pos.includes("pc team") || pos.includes("program coordinator team")) return 4;

    if (pos.includes("finance head")) return 5;
    if (pos.includes("finance team")) return 6;

    if ((pos.includes("operation") && pos.includes("head")) || (pos.includes("media") && pos.includes("head"))) return 7;
    if (pos.includes("operation") || pos.includes("media team")) return 8;

    if (pos.includes("editorial head")) return 9;
    if (pos.includes("editorial team")) return 10;

    // Public Relations is explicitly treated as a normal general team member (rank 99), 
    // but if you want them grouped under a specific section, you can adjust here.
    // Here we skip PR head/team special ranking so they fall into 99.

    if (pos.includes("design head")) return 11;
    if (pos.includes("design team")) return 12;

    if (pos.includes("inquisitive") && pos.includes("head")) return 13;
    if (pos.includes("inquisitive")) return 14;

    if (pos.includes("web head")) return 15;
    if (pos.includes("web team")) return 16;

    if (pos.includes("doc head") || pos.includes("documentation head") || pos.includes("content & documentation")) return 17;
    if (pos.includes("documentation team") || pos.includes("doc team")) return 18;

    // Default for general members (including Public Relations)
    return 99;
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

  // Split the sorted array into visual tiers
  const topLeadership = teamMembers.filter(m => getPositionRank(m.position) <= 2);
  const coreHeadsAndTeams = teamMembers.filter(m => {
    const rank = getPositionRank(m.position);
    return rank >= 3 && rank <= 18;
  });
  const generalTeam = teamMembers.filter(m => getPositionRank(m.position) === 99);

  // Helper function to render a member profile without the outer square
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

            {/* Tier 2: Core Heads & Sub-Teams in Order */}
            {coreHeadsAndTeams.length > 0 && (
              <div className="flex flex-wrap justify-center gap-6 md:gap-12">
                {coreHeadsAndTeams.map(member => renderMember(member, "w-32 h-32 md:w-36 md:h-36"))}
              </div>
            )}

            {/* Tier 3: General Team Members (Including Public Relations) */}
            {generalTeam.length > 0 && (
              <div className="flex flex-wrap justify-center gap-6 md:gap-10 mt-8">
                {generalTeam.map(member => renderMember(member, "w-24 h-24 md:w-28 md:h-28"))}
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

export default TeamPage;