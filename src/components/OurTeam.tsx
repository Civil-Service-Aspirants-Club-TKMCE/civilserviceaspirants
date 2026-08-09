import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import { Users, ArrowRight } from "lucide-react";

interface TeamMember {
  admission_number: string;
  name: string;
  position: string;
  image_url: string;
}

const OurTeam: React.FC = () => {
  const [topMembers, setTopMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // 1. The exact same ranking logic from the main TeamPage
  const getPositionRank = (position: string): number => {
    if (!position) return 99; 
    
    const pos = position.toLowerCase();

    if (pos.includes("ambassador")) return 1;
    if (pos.includes("student head")) return 2;
    if (pos.includes("pc head") || pos.includes("program coordinator head") || pos === "program coordinator") return 3;
    if (pos.includes("finance head")) return 4;
    if (pos.includes("operation") && pos.includes("head") || pos.includes("media") && pos.includes("head")) return 5;
    if (pos.includes("editorial head")) return 6;
    if (pos.includes("pr head") || pos.includes("public relations")) return 7;
    if (pos.includes("design head")) return 8;
    if (pos.includes("inquisitive head")) return 9;
    if (pos.includes("web head")) return 10;
    if (pos.includes("doc head") || pos.includes("documentation head")) return 11;

    return 99;
  };

  useEffect(() => {
    const fetchTopMembers = async () => {
      try {
        const { data, error } = await supabase
          .from("committee_members")
          .select("admission_number, name, position, image_url");

        if (error) throw error;

        if (data) {
          // Sort the entire roster to find the true top leaders
          const sortedData = data.sort((a, b) => {
            const rankA = getPositionRank(a.position);
            const rankB = getPositionRank(b.position);

            if (rankA !== rankB) {
              return rankA - rankB;
            }
            
            return a.name.localeCompare(b.name);
          });

          // 2. Slice only the first 3 members for the home page preview
          setTopMembers(sortedData.slice(0, 3));
        }
      } catch (error) {
        console.error("Error fetching team members:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopMembers();
  }, []);

  return (
    <div className="bg-[#0a0f16] py-20 px-6 font-lexend relative">
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        
        <h2 className="text-4xl md:text-5xl font-bold text-neon-blue mb-16 tracking-wide">
          Our Team
        </h2>

        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-neon-blue"></div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row justify-center items-center gap-12 md:gap-24 mb-16 w-full">
            {topMembers.map((member) => (
              <Link
                key={member.admission_number}
                to={`/team/${member.admission_number}`}
                className="flex flex-col items-center text-center group transform-gpu transition-all duration-300 hover:-translate-y-2"
              >
                <div className="w-40 h-40 md:w-48 md:h-48 mb-6 relative">
                  <div className="w-full h-full rounded-full overflow-hidden border-[3px] border-teal-600/80 group-hover:border-neon-blue group-hover:shadow-[0_0_20px_rgba(0,245,255,0.3)] transition-all duration-300">
                    <img
                      src={member.image_url ? `${member.image_url}?v=2` : ""}
                      alt={member.name}
                      loading="lazy" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        target.nextElementSibling!.classList.remove("hidden");
                        target.nextElementSibling!.classList.add("flex");
                      }}
                    />
                    <div className="hidden w-full h-full bg-gray-800 items-center justify-center absolute inset-0">
                      <Users className="w-12 h-12 text-gray-500" />
                    </div>
                  </div>
                </div>
                
                <h3 className="text-white font-bold text-xl mb-1 group-hover:text-neon-blue transition-colors">
                  {member.name}
                </h3>
                <p className="text-gray-400 text-sm font-medium">
                  {member.position}
                </p>
              </Link>
            ))}
          </div>
        )}

        <button
          onClick={() => navigate("/team")}
          className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded-full font-semibold hover:bg-gray-200 transition-colors duration-300"
        >
          Meet Our Team <ArrowRight className="w-5 h-5" />
        </button>

      </div>
    </div>
  );
};

export default OurTeam;