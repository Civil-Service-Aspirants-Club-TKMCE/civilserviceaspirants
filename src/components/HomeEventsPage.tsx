import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  Globe,
  ArrowLeft,
  Search,
  Filter,
  Image,
} from "lucide-react";
import { gsap } from "gsap";
import Footer from "./Footer";
import { api } from "../utils/api";

interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  mode: string;
  attendees?: number;
  max_participants: number;
  organizer?: string;
  img_url: string; // from Supabase/backend
  is_active?: boolean; // used to distinguish ongoing/completed
}

// 1. Define the interface for the incoming props from App.tsx
interface HomeEventsPageProps {
  user?: any;
  onLoginClick?: () => void;
}

// 2. Pass the interface into React.FC and destructure the props
const HomeEventsPage: React.FC<HomeEventsPageProps> = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [errorEvents, setErrorEvents] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState<
    "all" | "online" | "offline" | "hybrid"
  >("all");
  const [eventType, setEventType] = useState<"ongoing" | "completed">(
    "ongoing",
  );

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (!loadingEvents) {
      gsap.fromTo(
        ".events-header",
        { y: -50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
      );
      gsap.fromTo(
        ".events-content",
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, delay: 0.3, ease: "power2.out" },
      );
      gsap.fromTo(
        ".event-card",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          delay: 0.5,
          ease: "power2.out",
        },
      );
    }
  }, [loadingEvents]);

  const fetchEvents = async () => {
    try {
      const res = await api.get<EventItem[]>("/api/getevents");
      setEvents(res.data);
    } catch {
      setErrorEvents("Failed to fetch events");
    } finally {
      setLoadingEvents(false);
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode.toLowerCase()) {
      case "online":
        return <Globe className="w-4 h-4 text-green-400" />;
      case "offline":
        return <MapPin className="w-4 h-4 text-blue-400" />;
      case "hybrid":
        return <Globe className="w-4 h-4 text-purple-400" />;
      default:
        return <MapPin className="w-4 h-4 text-gray-400" />;
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode.toLowerCase()) {
      case "online":
        return "bg-green-400/20 text-green-400 border-green-400/30";
      case "offline":
        return "bg-blue-400/20 text-blue-400 border-blue-400/30";
      case "hybrid":
        return "bg-purple-400/20 text-purple-400 border-purple-400/30";
      default:
        return "bg-gray-400/20 text-gray-400 border-gray-400/30";
    }
  };

  // Filter events by ongoing/completed, search term, and mode filter
  const filteredEvents = events.filter((event) => {
    const matchesType =
      eventType === "ongoing"
        ? event.is_active !== false
        : event.is_active === false;
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterMode === "all" || event.mode.toLowerCase() === filterMode;
    return matchesType && matchesSearch && matchesFilter;
  });

  const handleEventClick = (eventId: string) => {
    navigate(`/event/${eventId}`);
  };

  if (loadingEvents) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">
        Loading events...
      </div>
    );
  }

  return (
    <div className="bg-[#0f172a] min-h-screen">
      {/* Header */}
      <div className="events-header glass-panel border-b border-white/10 relative">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6 relative flex items-center justify-center">
          {/* Back Button */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center w-10 h-10 bg-glass-bg backdrop-blur-sm border border-white/20 rounded-full hover:border-neon-blue/50 hover:shadow-glow transition-all duration-300 group absolute left-6"
          >
            <ArrowLeft className="w-5 h-5 text-white group-hover:text-neon-blue transition-colors" />
          </button>

          {/* Centered Title */}
          <h1 className="text-3xl font-extrabold text-white text-center">
            Events
          </h1>
        </div>

        {/* Toggle Buttons */}
        <div className="flex justify-center mb-6 space-x-4 max-w-2xl mx-auto">
          <button
            onClick={() => setEventType("ongoing")}
            className={`px-6 py-2 rounded-md font-semibold ${
              eventType === "ongoing"
                ? "bg-neon-blue text-white"
                : "bg-white/10 text-gray-400 hover:text-white"
            }`}
          >
            Ongoing Events
          </button>
          <button
            onClick={() => setEventType("completed")}
            className={`px-6 py-2 rounded-md font-semibold ${
              eventType === "completed"
                ? "bg-neon-blue text-white"
                : "bg-white/10 text-gray-400 hover:text-white"
            }`}
          >
            Completed Events
          </button>
        </div>

        {/* Search + Filter Section */}
        <div className="container mx-auto px-4 sm:px-6 md:px-8 pb-6">
          <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-glass-bg border border-white/20 text-white placeholder-gray-400 focus:border-neon-blue/50 focus:outline-none transition-colors"
                placeholder="Search events..."
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={filterMode}
                onChange={(e) => setFilterMode(e.target.value as any)}
                className="pl-10 pr-8 py-2 bg-glass-bg border border-white/20 rounded-lg text-white appearance-none focus:border-neon-blue/50 focus:outline-none transition-colors cursor-pointer"
              >
                <option className="bg-[#0f172a] text-white" value="all">
                  All Events
                </option>
                <option className="bg-[#0f172a] text-white" value="online">
                  Online
                </option>
                <option className="bg-[#0f172a] text-white" value="offline">
                  Offline
                </option>
                <option className="bg-[#0f172a] text-white" value="hybrid">
                  Hybrid
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Event Cards */}
      <div className="events-content container mx-auto px-6 py-12 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {errorEvents ? (
          <div className="text-center text-red-400">{errorEvents}</div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center text-gray-400">No events found.</div>
        ) : (
          filteredEvents.map((event) => (
            <div
              key={event.id}
              className="event-card glass-panel rounded-2xl border border-white/10 overflow-hidden hover:border-neon-blue/30 transition-all duration-300 transform hover:scale-105 flex flex-col cursor-pointer"
              onClick={() => handleEventClick(event.id)}
            >
              {/* Image */}
              <div className="relative h-48">
                <img
                  src={event.img_url}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div
                  className={`absolute top-4 left-4 inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${getModeColor(
                    event.mode,
                  )} border backdrop-blur-sm`}
                >
                  {getModeIcon(event.mode)}
                  <span className="capitalize">{event.mode}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2 line-clamp-2">
                    {event.title}
                  </h3>
                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                    {event.description}
                  </p>
                  <div className="space-y-2 mb-4 text-gray-400 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(event.date).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{event.venue}</span>
                    </div>
                  </div>
                </div>
                {/* Button */}
                <button
                  type="button"
                  className={`w-full py-3 font-semibold rounded-lg hover:shadow-glow transition duration-300 mt-4 ${
                    eventType === "ongoing"
                      ? "bg-gradient-to-r from-neon-blue to-neon-purple text-white hover:scale-105"
                      : "bg-green-600 text-white hover:bg-green-700 flex items-center justify-center gap-2"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEventClick(event.id);
                  }}
                >
                  {eventType === "ongoing" ? (
                    "View & Enroll"
                  ) : (
                    <>
                      <Image className="w-5 h-5" />
                      View Gallery
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Footer />
    </div>
  );
};

export default HomeEventsPage;