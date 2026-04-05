"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Heart, Bookmark, MessageCircle, MapPin, Calendar,
  Users, IndianRupee, Clock, Eye
} from "lucide-react";
import { useDiscoverStore } from "../store/discoverStore";
import { useState } from "react";

// Destination-based gradient palettes for image fallback
const DEST_GRADIENTS = {
  goa:        ["#0ea5e9", "#06b6d4"],
  bali:       ["#10b981", "#065f46"],
  kerala:     ["#22c55e", "#16a34a"],
  manali:     ["#6366f1", "#4338ca"],
  rajasthan:  ["#f97316", "#b45309"],
  jaipur:     ["#f97316", "#b45309"],
  paris:      ["#ec4899", "#be185d"],
  dubai:      ["#f59e0b", "#b45309"],
  singapore:  ["#8b5cf6", "#6d28d9"],
  mumbai:     ["#14b8a6", "#0f766e"],
  delhi:      ["#ef4444", "#b91c1c"],
  default:    ["#6366f1", "#8b5cf6"],
};

function getGradient(destination = "") {
  const d = destination.toLowerCase();
  for (const key of Object.keys(DEST_GRADIENTS)) {
    if (key !== "default" && d.includes(key)) return DEST_GRADIENTS[key];
  }
  return DEST_GRADIENTS.default;
}

function getDestEmoji(destination = "") {
  const d = destination.toLowerCase();
  if (/goa|andaman|maldives|bali/.test(d)) return "🏖️";
  if (/manali|ladakh|himachal|shimla|kedarnath/.test(d)) return "🏔️";
  if (/dubai|singapore|mumbai|delhi|bangalore|hyderabad/.test(d)) return "🏙️";
  if (/jaipur|rajasthan|agra|hampi/.test(d)) return "🏯";
  if (/paris|rome|london|barcelona/.test(d)) return "🗺️";
  if (/kerala|coorg|ooty|kodaikanal/.test(d)) return "🌿";
  return "✈️";
}

function formatPrice(val) {
  if (!val && val !== 0) return null;
  const n = Number(val);
  if (isNaN(n) || n <= 0) return null;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n.toLocaleString("en-IN")}`;
}

export default function TripCard({ trip }) {
  const { toggleLike, toggleSave } = useDiscoverStore();
  const [isLiking, setIsLiking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLiking) return;
    setIsLiking(true);
    await toggleLike(trip.trip_id);
    setIsLiking(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSaving) return;
    setIsSaving(true);
    await toggleSave(trip.trip_id);
    setIsSaving(false);
  };

  const formattedDate = trip.created_at
    ? formatDistanceToNow(new Date(trip.created_at), { addSuffix: true })
    : "";

  const [g1, g2] = getGradient(trip.destination);
  const emoji = getDestEmoji(trip.destination);

  // Price: prefer cost_per_person, fallback to budget / num_travelers, fallback to budget
  const rawPrice =
    trip.cost_per_person ||
    (trip.budget && trip.num_travelers ? trip.budget / trip.num_travelers : null) ||
    trip.budget ||
    trip.budget_summary?.total_cost;

  const price = formatPrice(rawPrice);

  const showImage = !imgError && trip.cover_image;

  return (
    <Link href={`/dashboard/discover/${trip.trip_id}`} className="block group">
      <div
        className="overflow-hidden rounded-3xl flex flex-col h-full transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
        style={{
          background: "var(--card-bg, #fff)",
          border: "1px solid var(--border-color, #e2e8f0)",
          boxShadow: "0 2px 20px rgba(0,0,0,0.06)",
        }}
      >
        {/* ── Cover Image / Gradient Fallback ─────────────────────── */}
        <div className="relative h-52 overflow-hidden flex-shrink-0">
          {/* Gradient fallback (always rendered behind) */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${g1}, ${g2})` }}
          >
            <span className="text-7xl opacity-30 select-none">{emoji}</span>
          </div>

          {/* Cover image */}
          {trip.cover_image && (
            <img
              src={trip.cover_image}
              alt={trip.destination}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${
                imgError ? "opacity-0" : "opacity-100"
              }`}
              loading="lazy"
              onError={() => setImgError(true)}
            />
          )}

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />

          {/* Top bar: user + save */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
            {/* User pill */}
            <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md rounded-full pl-1 pr-2.5 py-1 border border-white/10">
              {trip.user?.profile_image ? (
                <img
                  src={trip.user.profile_image}
                  alt={trip.user.username}
                  className="w-5 h-5 rounded-full object-cover"
                  onError={(e) => { e.target.style.display = "none"; }}
                />
              ) : (
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${g1}, ${g2})` }}
                >
                  {(trip.user?.username || "U").charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-[11px] font-semibold text-white/90 max-w-[90px] truncate">
                @{trip.user?.username || "traveler"}
              </span>
            </div>

            {/* Save button */}
            <button
              onClick={handleSave}
              className="p-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white transition-all hover:bg-white hover:text-indigo-600 active:scale-90"
              title={trip.is_saved ? "Unsave" : "Save"}
            >
              <Bookmark
                className={`w-3.5 h-3.5 transition-colors ${
                  trip.is_saved ? "fill-indigo-400 text-indigo-400" : ""
                }`}
              />
            </button>
          </div>

          {/* Bottom: title + location + price */}
          <div className="absolute bottom-3 left-3 right-3 z-10">
            <h3 className="text-base font-bold text-white mb-1.5 line-clamp-1 leading-snug">
              {trip.title || `${trip.destination} Trip`}
            </h3>
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1 text-white/80 text-xs font-medium">
                <MapPin className="w-3 h-3 text-rose-400 flex-shrink-0" />
                <span className="truncate max-w-[120px]">{trip.destination}</span>
              </span>
              {price ? (
                <span className="flex items-center gap-0.5 text-emerald-300 text-xs font-bold bg-black/30 rounded-lg px-2 py-0.5 border border-emerald-400/20">
                  <IndianRupee className="w-3 h-3" />
                  {price.replace("₹", "")}
                  <span className="text-white/50 text-[10px] font-normal">/person</span>
                </span>
              ) : (
                <span className="text-xs text-white/40 font-medium">Free plan</span>
              )}
            </div>
          </div>
        </div>

        {/* ── Card Body ─────────────────────────────────────────── */}
        <div className="p-4 flex flex-col gap-3 flex-1">
          {/* Description */}
          <p className="text-sm leading-relaxed line-clamp-2" style={{ color: "var(--text-muted, #64748b)" }}>
            {trip.description || `Discover the best of ${trip.destination} in ${trip.duration_days || "?"} days!`}
          </p>

          {/* Chips: duration, group type, tags */}
          <div className="flex flex-wrap gap-1.5">
            {trip.duration_days && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                style={{ background: "var(--accent-soft, #eef2ff)", color: "var(--accent-primary, #6366f1)" }}>
                <Calendar className="w-3 h-3" />
                {trip.duration_days} Days
              </span>
            )}
            {trip.group_type && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize"
                style={{ background: "var(--bg-secondary, #f1f5f9)", color: "var(--text-secondary, #475569)" }}>
                <Users className="w-3 h-3" />
                {trip.group_type}
              </span>
            )}
            {trip.tags?.slice(0, 2).map((tag, i) => (
              <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                style={{ background: `${g1}18`, color: g1 }}>
                #{tag}
              </span>
            ))}
          </div>

          {/* Footer: like, comment, time */}
          <div className="flex items-center justify-between pt-3 mt-auto"
            style={{ borderTop: "1px solid var(--border-color, #e2e8f0)" }}>
            <div className="flex items-center gap-3">
              {/* Like */}
              <button
                onClick={handleLike}
                className="flex items-center gap-1 text-[12px] font-semibold transition-all hover:scale-110 active:scale-90"
                style={{ color: trip.is_liked ? "#ef4444" : "var(--text-muted, #94a3b8)" }}
              >
                <Heart
                  className={`w-4 h-4 transition-all ${
                    trip.is_liked ? "fill-red-500 text-red-500" : ""
                  } ${isLiking ? "animate-pulse" : ""}`}
                />
                <span>{trip.likes || 0}</span>
              </button>

              {/* Comment */}
              <div className="flex items-center gap-1 text-[12px] font-semibold"
                style={{ color: "var(--text-muted, #94a3b8)" }}>
                <MessageCircle className="w-4 h-4" />
                <span>{trip.comments_count || 0}</span>
              </div>

              {/* Views */}
              {trip.views > 0 && (
                <div className="flex items-center gap-1 text-[12px] font-semibold"
                  style={{ color: "var(--text-muted, #94a3b8)" }}>
                  <Eye className="w-3.5 h-3.5" />
                  <span>{trip.views}</span>
                </div>
              )}
            </div>

            {formattedDate && (
              <span className="text-[11px] font-medium" style={{ color: "var(--text-muted, #94a3b8)" }}>
                {formattedDate}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
