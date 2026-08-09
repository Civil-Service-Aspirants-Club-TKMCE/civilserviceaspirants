import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import { gsap } from "gsap";
import { ArrowLeft, Phone, Instagram, GraduationCap, User } from "lucide-react";

interface MemberData {
  admission_number: string;
  name: string;
  position: string;
  class: string;
  phone_number: string;
  instagram_profile_link: string;
  image_url: string;
}

const MemberProfile: React.FC = () => {
  const { admissionNo } = useParams<{ admissionNo: string }>();
  const [member, setMember] = useState<MemberData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMemberData = async () => {
      try {
        if (!admissionNo) return;

        const { data, error } = await supabase
          .from("committee_members")
          .select("*")
          .eq("admission_number", admissionNo)
          .single();

        if (error) throw error;
        setMember(data);
      } catch (error) {
        console.error("Error fetching member:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMemberData();
  }, [admissionNo]);

  useEffect(() => {
    if (!isLoading && member && contentRef.current) {
      gsap.fromTo(
        contentRef.current.children,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power3.out" }
      );
    }
  }, [isLoading, member]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-neon-blue"></div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white font-lexend px-4">
        <User className="w-24 h-24 text-gray-600 mb-6" />
        <h2 className="text-4xl md:text-5xl font-bold text-neon-blue mb-4">Member Not Found</h2>
        <Link 
          to="/team" 
          className="px-8 py-4 mt-8 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all flex items-center gap-2 text-lg"
        >
          <ArrowLeft className="w-6 h-6" />
          Back to Team Roster
        </Link>
      </div>
    );
  }

  return (
    /* Changed overflow-hidden to overflow-y-auto to allow scrolling on direct load/QR scan */
    <div className="min-h-screen bg-gray-900 text-white font-lexend relative overflow-y-auto flex flex-col">
      {/* Massive Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-neon-blue/10 blur-[150px] rounded-full pointer-events-none transform-gpu"></div>

      {/* Top Navigation */}
      <div className="w-full max-w-screen-2xl mx-auto px-6 pt-24 md:pt-32 relative z-20">
        <Link 
          to="/team" 
          className="inline-flex items-center gap-3 text-gray-400 hover:text-neon-blue transition-colors group text-lg md:text-xl font-medium"
        >
          <ArrowLeft className="w-6 h-6 group-hover:-translate-x-2 transition-transform" />
          <span>Return to Team Directory</span>
        </Link>
      </div>

      {/* Full Screen Content Layout */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <div ref={contentRef} className="w-full max-w-screen-2xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24">
          
          {/* Col 1: Massive Profile Image */}
          <div className="shrink-0">
            <div className="w-64 h-64 md:w-80 md:h-80 lg:w-[450px] lg:h-[450px] relative group">
              <div className="absolute inset-0 bg-neon-blue/20 rounded-full blur-2xl group-hover:bg-neon-blue/30 transition-colors duration-500"></div>
              <div className="w-full h-full rounded-full overflow-hidden border-4 border-white/10 shadow-2xl relative z-10">
                <img 
                  src={member.image_url || "/default-avatar.png"} 
                  alt={member.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    target.nextElementSibling!.classList.remove("hidden");
                    target.nextElementSibling!.classList.add("flex");
                  }}
                />
                <div className="hidden w-full h-full bg-gray-800 items-center justify-center absolute inset-0">
                  <User className="w-32 h-32 text-gray-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Col 2: Giant Typography Details */}
          <div className="flex-1 text-center lg:text-left flex flex-col justify-center max-w-3xl">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-white to-neon-blue bg-clip-text text-transparent leading-tight mb-4 tracking-tight">
              {member.name}
            </h1>
            <h2 className="text-2xl md:text-4xl lg:text-5xl text-neon-purple font-medium mb-12">
              {member.position}
            </h2>

            <div className="space-y-6 md:space-y-8 flex flex-col items-center lg:items-start">
              <div className="flex items-center gap-6 text-gray-300">
                <div className="p-4 bg-white/5 rounded-full border border-white/10">
                  <GraduationCap className="w-8 h-8 text-neon-blue" />
                </div>
                <span className="text-2xl md:text-3xl font-light">{member.class}</span>
              </div>
              
              <div className="flex items-center gap-6 text-gray-300">
                <div className="p-4 bg-white/5 rounded-full border border-white/10">
                  <Phone className="w-8 h-8 text-neon-blue" />
                </div>
                <span className="text-2xl md:text-3xl font-light tracking-wide">{member.phone_number}</span>
              </div>

              {member.instagram_profile_link && (
                <a 
                  href={member.instagram_profile_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-4 mt-8 px-10 py-5 bg-gradient-to-r from-neon-purple/20 to-neon-blue/20 hover:from-neon-purple/40 hover:to-neon-blue/40 border border-white/10 rounded-2xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(191,0,255,0.3)] group"
                >
                  <Instagram className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
                  <span className="text-xl md:text-2xl font-medium text-white">Connect on Instagram</span>
                </a>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MemberProfile;