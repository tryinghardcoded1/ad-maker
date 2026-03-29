import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MonitorSmartphone, 
  Search, 
  Facebook, 
  Instagram, 
  Video,
  ThumbsUp,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Bookmark,
  Heart,
  Send,
  Music,
  PlusCircle,
  Globe,
  ChevronRight,
  ChevronUp,
  Smartphone,
  Tablet,
  Monitor,
  Sparkles,
  Loader2,
  Bot,
  X,
  Calendar,
  CheckCircle2,
  BarChart3,
  PenTool,
  Play,
  Clock
} from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// --- Types ---

type Platform = 'google' | 'facebook' | 'instagram' | 'tiktok';
type AdFormat = 'feed' | 'story' | 'right-column' | 'search' | 'display' | 'youtube' | 'email' | 'in-feed' | 'branded-effect';
type Device = 'mobile' | 'tablet' | 'desktop';
type Goal = 'lead_generation' | 'sales' | 'brand_awareness' | 'website_traffic';

interface AIAnalysis {
  score: number;
  expectedResults: string;
  feedback: string[];
  suggestions: string[];
  highlights?: { text: string; reason: string }[];
}

interface AdData {
  brandName: string;
  logoUrl: string;
  imageUrl: string;
  headline: string;
  primaryText: string;
  description: string;
  destinationUrl: string;
  ctaText: string;
  videoUrl?: string;
  imagePrompt?: string;
}

// --- Default Data ---

const DEFAULT_AD: AdData = {
  brandName: "Acme Corp",
  logoUrl: "https://picsum.photos/seed/acmelogo/100/100",
  imageUrl: "https://picsum.photos/seed/acmeproduct/800/800",
  headline: "Revolutionize Your Workflow Today",
  primaryText: "Discover the ultimate tool to boost your productivity. Join thousands of satisfied users today and take your business to the next level with our award-winning platform.",
  description: "Start your free 14-day trial. No credit card required. Cancel anytime.",
  destinationUrl: "www.acmecorp.com",
  ctaText: "Learn More"
};

const CTA_OPTIONS = [
  "Learn More",
  "Shop Now",
  "Sign Up",
  "Download",
  "Subscribe",
  "Book Now",
  "Apply Now"
];

const PLATFORM_FORMATS: Record<Platform, { id: AdFormat, label: string }[]> = {
  google: [
    { id: 'search', label: 'Search' },
    { id: 'display', label: 'Display' },
    { id: 'youtube', label: 'YouTube' },
    { id: 'email', label: 'Email' }
  ],
  facebook: [
    { id: 'feed', label: 'Feed' },
    { id: 'story', label: 'Story' },
    { id: 'right-column', label: 'Right Column' }
  ],
  instagram: [
    { id: 'feed', label: 'Feed' },
    { id: 'story', label: 'Story' }
  ],
  tiktok: [
    { id: 'in-feed', label: 'In-Feed' },
    { id: 'branded-effect', label: 'Branded Effect' }
  ]
};

const CHARACTER_LIMITS = {
  google: { headline: 30, primaryText: 0, description: 90 },
  facebook: { headline: 255, primaryText: 2200, description: 30 },
  instagram: { headline: 0, primaryText: 2200, description: 0 },
  tiktok: { headline: 0, primaryText: 2200, description: 0 }
};

// --- Mock Data for Dashboard ---
const DASHBOARD_DATA = [
  { date: 'Mar 01', impressions: 12000, clicks: 800, conversions: 45 },
  { date: 'Mar 02', impressions: 15000, clicks: 1100, conversions: 60 },
  { date: 'Mar 03', impressions: 14000, clicks: 950, conversions: 50 },
  { date: 'Mar 04', impressions: 18000, clicks: 1400, conversions: 85 },
  { date: 'Mar 05', impressions: 22000, clicks: 1800, conversions: 110 },
  { date: 'Mar 06', impressions: 20000, clicks: 1600, conversions: 95 },
  { date: 'Mar 07', impressions: 25000, clicks: 2100, conversions: 130 },
];

const SCHEDULED_ADS = [
  { id: 1, name: 'Spring Sale - TikTok', platform: 'tiktok', status: 'Scheduled', date: 'Mar 15, 2026', time: '10:00 AM', timezone: 'America/New_York', recurring: 'None' },
  { id: 2, name: 'Brand Awareness - FB', platform: 'facebook', status: 'Active', date: 'Mar 10, 2026', time: '08:00 AM', timezone: 'UTC', recurring: 'Daily' },
  { id: 3, name: 'Retargeting - IG', platform: 'instagram', status: 'Paused', date: 'Mar 01, 2026', time: '12:00 PM', timezone: 'Europe/London', recurring: 'Weekly' },
];

// --- Platform Preview Components ---

const GoogleAd = React.forwardRef<HTMLDivElement, { data: AdData, format: AdFormat }>(({ data, format }, ref) => {
  if (format === 'display') {
    return (
      <motion.div 
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full max-w-[300px] h-[250px] bg-white border border-gray-200 shadow-sm relative overflow-hidden flex flex-col group cursor-pointer"
      >
        <div className="absolute top-1 right-1 bg-white/80 backdrop-blur-sm text-[10px] px-1.5 rounded text-gray-500 z-10">Ad</div>
        <div className="h-[130px] w-full bg-gray-100 relative">
          <img src={data.imageUrl} alt="Ad creative" className="w-full h-full object-cover" />
        </div>
        <div className="p-3 flex flex-col flex-1 justify-between bg-white">
          <div>
            <h3 className="font-semibold text-[14px] text-gray-900 leading-tight line-clamp-2 mb-1">{data.headline}</h3>
            <p className="text-[12px] text-gray-600 line-clamp-2 leading-snug">{data.primaryText}</p>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1.5">
              <img src={data.logoUrl} alt="Logo" className="w-4 h-4 rounded-full object-cover" />
              <span className="text-[11px] font-medium text-gray-500 truncate max-w-[80px]">{data.brandName}</span>
            </div>
            <button className="bg-blue-600 text-white text-[11px] font-semibold px-3 py-1.5 rounded-full hover:bg-blue-700 transition-colors">
              {data.ctaText}
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (format === 'youtube') {
    return (
      <motion.div 
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full max-w-[600px] bg-black aspect-video relative overflow-hidden group font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif]"
      >
        <img src={data.imageUrl} alt="Video thumbnail" className="w-full h-full object-cover opacity-80" />
        
        {/* YouTube UI Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
        
        {/* Top left ad indicator */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <div className="bg-yellow-400 text-black text-[11px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">Ad</div>
          <span className="text-white text-sm font-medium drop-shadow-md">0:15</span>
        </div>

        {/* Bottom controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-3">
          {/* Companion banner */}
          <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-lg p-3 flex items-center justify-between cursor-pointer hover:bg-black/80 transition-colors">
            <div className="flex items-center gap-3">
              <img src={data.logoUrl} alt="Logo" className="w-10 h-10 rounded-full object-cover border border-white/20" />
              <div>
                <h3 className="text-white font-medium text-[15px] leading-tight line-clamp-1">{data.headline}</h3>
                <p className="text-gray-300 text-[13px] line-clamp-1">{data.destinationUrl}</p>
              </div>
            </div>
            <button className="bg-blue-600 text-white text-[14px] font-medium px-4 py-2 rounded-full hover:bg-blue-700 transition-colors whitespace-nowrap ml-4">
              {data.ctaText}
            </button>
          </div>
          
          {/* Progress bar */}
          <div className="w-full h-1 bg-white/30 relative">
            <div className="absolute top-0 left-0 bottom-0 w-1/3 bg-red-600" />
          </div>
        </div>

        {/* Skip Ad Button */}
        <div className="absolute bottom-20 right-0 bg-black/70 backdrop-blur-sm border border-white/20 border-r-0 text-white text-[14px] px-4 py-2 rounded-l-full cursor-pointer hover:bg-black/90 transition-colors flex items-center gap-2">
          Skip Ad <ChevronRight className="w-4 h-4" />
        </div>
      </motion.div>
    );
  }

  if (format === 'email') {
    return (
      <motion.div 
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full max-w-[650px] bg-white rounded-xl shadow-sm border border-gray-200 text-left overflow-hidden font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif]"
      >
        <div className="flex items-center gap-4 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 group">
          <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-lg shrink-0">
            {data.brandName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <div className="flex items-center gap-2 sm:w-48 shrink-0">
              <span className="font-bold text-[14px] text-gray-900 truncate">{data.brandName}</span>
              <span className="bg-green-100 text-green-800 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">Ad</span>
            </div>
            <div className="flex-1 truncate text-[14px]">
              <span className="font-bold text-gray-900">{data.headline}</span>
              <span className="text-gray-500 mx-1">-</span>
              <span className="text-gray-500">{data.primaryText}</span>
            </div>
          </div>
          <div className="text-[12px] text-gray-500 font-medium shrink-0 group-hover:hidden">
            Mar 14
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-[650px] bg-white rounded-xl shadow-md border border-gray-200 text-left overflow-hidden flex flex-col h-full max-h-[800px]"
    >
    {/* Fake Google Search Header */}
    <div className="p-4 border-b border-gray-200 flex items-center gap-4 shrink-0">
      <div className="text-2xl font-bold text-gray-400 tracking-tighter select-none flex items-center">
        <span className="text-blue-500">G</span>
        <span className="text-red-500">o</span>
        <span className="text-yellow-500">o</span>
        <span className="text-blue-500">g</span>
        <span className="text-green-500">l</span>
        <span className="text-red-500">e</span>
      </div>
      <div className="flex-1 flex items-center bg-white border border-gray-300 rounded-full px-4 py-2.5 shadow-sm hover:shadow-md transition-shadow">
        <input 
          type="text" 
          value={`${data.brandName} alternatives`} 
          readOnly 
          className="flex-1 outline-none text-[15px] text-gray-800 bg-transparent"
        />
        <Search className="w-5 h-5 text-blue-500" />
      </div>
    </div>

    {/* Search Results Area */}
    <div className="p-4 sm:p-6 bg-white flex-1 overflow-y-auto">
      <div className="text-[13px] text-gray-500 mb-5">About 1,240,000,000 results (0.42 seconds)</div>
      
      {/* The Ad */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-7 h-7 rounded-full overflow-hidden border border-gray-100 shrink-0 bg-gray-50">
            <img src={data.logoUrl} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[14px]">
              <span className="text-gray-900">{data.brandName}</span>
            </div>
            <div className="flex items-center gap-2 text-[12px]">
              <span className="font-bold text-black">Sponsored</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-800">{data.destinationUrl}</span>
            </div>
          </div>
        </div>
        <h3 className="text-[#1a0dab] text-[20px] font-medium hover:underline cursor-pointer mb-1 leading-tight">
          {data.headline}
        </h3>
        <p className="text-[#4d5156] text-[14px] leading-[1.58]">
          {data.description || data.primaryText}
        </p>
        {/* Fake Sitelinks */}
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-[#1a0dab] text-[14px]">
          <span className="hover:underline cursor-pointer">Pricing & Plans</span>
          <span className="hover:underline cursor-pointer">Features</span>
          <span className="hover:underline cursor-pointer">Contact Us</span>
          <span className="hover:underline cursor-pointer">Customer Reviews</span>
        </div>
      </div>

      {/* Fake Organic Result 1 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-7 h-7 rounded-full overflow-hidden border border-gray-100 shrink-0 bg-gray-100 flex items-center justify-center">
            <Globe className="w-4 h-4 text-gray-500" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[14px]">
              <span className="text-gray-900">Top Reviews Tech</span>
            </div>
            <div className="flex items-center gap-2 text-[12px]">
              <span className="text-gray-800">www.topreviewstech.com › software</span>
            </div>
          </div>
        </div>
        <h3 className="text-[#1a0dab] text-[20px] font-medium hover:underline cursor-pointer mb-1 leading-tight">
          10 Best Software Tools for 2026
        </h3>
        <p className="text-[#4d5156] text-[14px] leading-[1.58]">
          Looking for the best tools? We've compiled a list of the top platforms to help you scale your business, improve productivity, and streamline your workflow...
        </p>
      </div>

      {/* Fake Organic Result 2 */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-7 h-7 rounded-full overflow-hidden border border-gray-100 shrink-0 bg-gray-100 flex items-center justify-center">
            <Globe className="w-4 h-4 text-gray-500" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-[14px]">
              <span className="text-gray-900">Industry Blog</span>
            </div>
            <div className="flex items-center gap-2 text-[12px]">
              <span className="text-gray-800">www.industryblog.io › guides</span>
            </div>
          </div>
        </div>
        <h3 className="text-[#1a0dab] text-[20px] font-medium hover:underline cursor-pointer mb-1 leading-tight">
          How to choose the right platform for your team
        </h3>
        <p className="text-[#4d5156] text-[14px] leading-[1.58]">
          A comprehensive guide on evaluating different solutions, comparing features, pricing, and finding the perfect fit for your team's unique needs...
        </p>
      </div>
    </div>
  </motion.div>
  );
});

const FacebookAd = React.forwardRef<HTMLDivElement, { data: AdData, format: AdFormat }>(({ data, format }, ref) => {
  if (format === 'story') {
    return (
      <motion.div 
        ref={ref}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-[360px] aspect-[9/16] bg-black rounded-xl shadow-lg relative overflow-hidden font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif]"
      >
        <img src={data.imageUrl} alt="Story creative" className="w-full h-full object-cover opacity-90" />
        
        {/* Top Gradient */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
        
        {/* Header */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <img src={data.logoUrl} alt="Logo" className="w-8 h-8 rounded-full object-cover border border-white/20" />
            <div>
              <h4 className="font-semibold text-[14px] text-white leading-tight drop-shadow-md">{data.brandName}</h4>
              <div className="text-[12px] text-white/80 font-medium drop-shadow-md">Sponsored</div>
            </div>
          </div>
          <MoreHorizontal className="w-5 h-5 text-white drop-shadow-md" />
        </div>

        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

        {/* Bottom Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10 flex flex-col items-center">
          <p className="text-white text-[15px] text-center mb-6 drop-shadow-md line-clamp-3">{data.primaryText}</p>
          
          <div className="w-full flex flex-col items-center gap-2 cursor-pointer group">
            <ChevronUp className="w-6 h-6 text-white animate-bounce group-hover:text-blue-400 transition-colors" />
            <div className="bg-white/20 backdrop-blur-md text-white font-semibold text-[15px] py-3 px-6 rounded-full w-full text-center hover:bg-white/30 transition-colors">
              {data.ctaText}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (format === 'right-column') {
    return (
      <motion.div 
        ref={ref}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-[254px] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden text-left font-[Helvetica,Arial,sans-serif] hover:bg-gray-50 cursor-pointer transition-colors"
      >
        <div className="p-2 flex flex-col gap-2">
          <div className="w-full aspect-[1.91/1] bg-gray-100 rounded overflow-hidden">
            <img src={data.imageUrl} alt="Ad creative" className="w-full h-full object-cover" />
          </div>
          <div>
            <h4 className="font-semibold text-[14px] text-[#050505] leading-tight line-clamp-2 mb-1">{data.headline}</h4>
            <p className="text-[12px] text-[#65676B] line-clamp-1">{data.destinationUrl}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-[500px] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden text-left font-[Helvetica,Arial,sans-serif]"
    >
    {/* Header */}
    <div className="p-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <img src={data.logoUrl} alt="Logo" className="w-10 h-10 rounded-full object-cover border border-gray-100" />
        <div>
          <h4 className="font-semibold text-[15px] text-[#050505] leading-tight hover:underline cursor-pointer">{data.brandName}</h4>
          <div className="flex items-center text-[13px] text-[#65676B] gap-1 mt-0.5">
            <span className="hover:underline cursor-pointer">Sponsored</span>
            <span aria-hidden="true"> · </span>
            <Globe className="w-3 h-3 fill-current" />
          </div>
        </div>
      </div>
      <div className="flex gap-2 text-[#65676B] hover:bg-gray-100 p-2 rounded-full cursor-pointer transition-colors">
        <X className="w-5 h-5" />
      </div>
    </div>

    {/* Primary Text */}
    <div className="px-4 pb-3 text-[15px] text-[#050505] whitespace-pre-wrap leading-normal">
      {data.primaryText}
    </div>

    {/* Image */}
    <div className="w-full aspect-[4/5] sm:aspect-video bg-[#F0F2F5] border-y border-gray-200 relative cursor-pointer">
      <img src={data.imageUrl} alt="Ad creative" className="w-full h-full object-cover" />
    </div>

    {/* Link Preview */}
    <div className="bg-[#F0F2F5] flex items-center justify-between cursor-pointer hover:bg-[#E4E6E9] transition-colors border-b border-gray-200">
      <div className="flex-1 py-2.5 px-4 overflow-hidden">
        <div className="text-[12px] text-[#65676B] uppercase tracking-wide mb-0.5 truncate">
          {data.destinationUrl}
        </div>
        <div className="font-semibold text-[15px] text-[#050505] truncate mb-0.5 leading-tight">
          {data.headline}
        </div>
        <div className="text-[14px] text-[#65676B] truncate">
          {data.description}
        </div>
      </div>
      <div className="pr-4 shrink-0">
        <button className="bg-[#E4E6E9] hover:bg-[#D8DADF] text-[#050505] font-semibold text-[15px] px-4 py-1.5 rounded-md transition-colors">
          {data.ctaText}
        </button>
      </div>
    </div>

    {/* Engagement Stats */}
    <div className="px-4 py-2.5 flex justify-between items-center text-[#65676B] text-[13px] border-b border-gray-200 mx-4">
      <div className="flex items-center gap-1">
        <div className="bg-[#1877F2] rounded-full p-1">
          <ThumbsUp className="w-3 h-3 text-white fill-current" />
        </div>
        <div className="bg-[#F02849] rounded-full p-1 -ml-1.5 border border-white">
          <Heart className="w-3 h-3 text-white fill-current" />
        </div>
        <span className="ml-1 hover:underline cursor-pointer">1.2K</span>
      </div>
      <div className="flex gap-3">
        <span className="hover:underline cursor-pointer">124 comments</span>
        <span className="hover:underline cursor-pointer">45 shares</span>
      </div>
    </div>

    {/* Engagement Actions */}
    <div className="px-4 py-1 flex justify-between text-[#65676B] mx-2">
      <button className="flex items-center gap-2 text-[15px] font-semibold hover:bg-gray-100 px-2 py-1.5 rounded-md flex-1 justify-center transition-colors">
        <ThumbsUp className="w-5 h-5" /> Like
      </button>
      <button className="flex items-center gap-2 text-[15px] font-semibold hover:bg-gray-100 px-2 py-1.5 rounded-md flex-1 justify-center transition-colors">
        <MessageCircle className="w-5 h-5" /> Comment
      </button>
      <button className="flex items-center gap-2 text-[15px] font-semibold hover:bg-gray-100 px-2 py-1.5 rounded-md flex-1 justify-center transition-colors">
        <Share2 className="w-5 h-5" /> Share
      </button>
    </div>
  </motion.div>
  );
});

const InstagramAd = React.forwardRef<HTMLDivElement, { data: AdData, format: AdFormat }>(({ data, format }, ref) => {
  if (format === 'story') {
    return (
      <motion.div 
        ref={ref}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-[360px] aspect-[9/16] bg-black rounded-xl shadow-lg relative overflow-hidden font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif]"
      >
        <img src={data.imageUrl} alt="Story creative" className="w-full h-full object-cover opacity-90" />
        
        {/* Top Gradient */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
        
        {/* Progress Bar */}
        <div className="absolute top-2 left-2 right-2 flex gap-1 z-10">
          <div className="h-0.5 bg-white/40 rounded-full flex-1 overflow-hidden">
            <div className="h-full bg-white w-1/3" />
          </div>
          <div className="h-0.5 bg-white/40 rounded-full flex-1" />
          <div className="h-0.5 bg-white/40 rounded-full flex-1" />
        </div>

        {/* Header */}
        <div className="absolute top-5 left-3 right-3 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <img src={data.logoUrl} alt="Logo" className="w-8 h-8 rounded-full object-cover border border-white/20" />
            <div className="flex items-center gap-1.5">
              <h4 className="font-semibold text-[13px] text-white leading-tight drop-shadow-md">{data.brandName}</h4>
              <span className="text-white/80 text-[11px] font-medium drop-shadow-md">Sponsored</span>
            </div>
          </div>
          <MoreHorizontal className="w-5 h-5 text-white drop-shadow-md" />
        </div>

        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

        {/* Bottom Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10 flex flex-col items-center">
          <div className="w-full flex flex-col gap-3">
            <div className="flex items-center justify-between w-full px-2">
              <div className="flex gap-4">
                <Heart className="w-6 h-6 text-white drop-shadow-md" />
                <MessageCircle className="w-6 h-6 text-white drop-shadow-md" />
                <Send className="w-6 h-6 text-white drop-shadow-md" />
              </div>
              <Bookmark className="w-6 h-6 text-white drop-shadow-md" />
            </div>
            
            <div className="bg-white/20 backdrop-blur-md text-white font-semibold text-[14px] py-3 px-6 rounded-full w-full text-center hover:bg-white/30 transition-colors flex items-center justify-between cursor-pointer group">
              <span>{data.ctaText}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-[400px] bg-white rounded-sm border border-gray-200 overflow-hidden text-left font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif]"
    >
    {/* Header */}
    <div className="p-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="relative">
          <img src={data.logoUrl} alt="Logo" className="w-8 h-8 rounded-full object-cover border border-gray-100" />
        </div>
        <div className="flex flex-col -gap-1">
          <h4 className="font-semibold text-[14px] text-[#262626] leading-tight cursor-pointer">{data.brandName}</h4>
          <div className="text-[12px] text-[#262626] cursor-pointer">Sponsored</div>
        </div>
      </div>
      <MoreHorizontal className="w-5 h-5 text-[#262626] cursor-pointer" />
    </div>

    {/* Image */}
    <div className="w-full aspect-square bg-[#FAFAFA] relative cursor-pointer">
      <img src={data.imageUrl} alt="Ad creative" className="w-full h-full object-cover" />
    </div>

    {/* CTA Bar */}
    <div className="bg-[#0095F6] text-white px-4 py-2.5 flex justify-between items-center cursor-pointer hover:bg-[#1877F2] transition-colors">
      <span className="font-semibold text-[14px]">{data.ctaText}</span>
      <ChevronRight className="w-5 h-5" />
    </div>

    {/* Engagement */}
    <div className="px-3 pt-3 pb-2">
      <div className="flex justify-between items-center mb-3">
        <div className="flex gap-4">
          <Heart className="w-6 h-6 text-[#262626] hover:text-gray-500 cursor-pointer transition-colors" />
          <MessageCircle className="w-6 h-6 text-[#262626] hover:text-gray-500 cursor-pointer transition-colors" />
          <Send className="w-6 h-6 text-[#262626] hover:text-gray-500 cursor-pointer transition-colors" />
        </div>
        <Bookmark className="w-6 h-6 text-[#262626] hover:text-gray-500 cursor-pointer transition-colors" />
      </div>
      <div className="font-semibold text-[14px] text-[#262626] mb-1 cursor-pointer">1,234 likes</div>
      <div className="text-[14px] text-[#262626] leading-snug">
        <span className="font-semibold mr-2 cursor-pointer">{data.brandName}</span>
        {data.primaryText}
      </div>
    </div>
  </motion.div>
  );
});

const TikTokAd = React.forwardRef<HTMLDivElement, { data: AdData, format: AdFormat }>(({ data, format }, ref) => {
  if (format === 'branded-effect') {
    return (
      <motion.div 
        ref={ref}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-[360px] aspect-[9/16] bg-black rounded-xl shadow-lg relative overflow-hidden font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif]"
      >
        <img src={data.imageUrl} alt="Video creative" className="w-full h-full object-cover opacity-90" />
        
        {/* Branded Effect Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
          <div className="w-32 h-32 border-4 border-dashed border-white/50 rounded-full animate-spin-slow" />
          <div className="mt-4 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            {data.headline} Effect
          </div>
        </div>

        {/* Top Gradient */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
        
        {/* Header */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
          <div className="flex items-center gap-2">
            <img src={data.logoUrl} alt="Logo" className="w-8 h-8 rounded-full object-cover border border-white/20" />
            <div>
              <h4 className="font-semibold text-[14px] text-white leading-tight drop-shadow-md">{data.brandName}</h4>
              <div className="text-[12px] text-white/80 font-medium drop-shadow-md">Sponsored</div>
            </div>
          </div>
          <MoreHorizontal className="w-5 h-5 text-white drop-shadow-md" />
        </div>

        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

        {/* Bottom Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-20 flex flex-col">
          <div className="flex items-end justify-between w-full mb-4">
            <div className="flex-1 pr-12">
              <h3 className="text-white font-bold text-[16px] mb-1 drop-shadow-md">@{data.brandName.toLowerCase().replace(/\s/g, '')}</h3>
              <p className="text-white text-[14px] line-clamp-2 drop-shadow-md mb-2">{data.primaryText}</p>
              <div className="flex items-center gap-2 text-white/90 text-[13px] font-medium drop-shadow-md">
                <Music className="w-4 h-4" />
                <span className="truncate">Original Sound - {data.brandName}</span>
              </div>
            </div>
          </div>
          
          <div className="w-full bg-[#fe2c55] text-white font-bold text-[15px] py-3 px-6 rounded flex items-center justify-center cursor-pointer hover:bg-[#e02b4d] transition-colors">
            Try this effect
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-[320px] aspect-[9/16] bg-black rounded-2xl overflow-hidden relative text-left shadow-xl font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,Helvetica,Arial,sans-serif]"
    >
    {/* Background Image or Video */}
    {data.videoUrl ? (
      <video src={data.videoUrl} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-90" />
    ) : (
      <img src={data.imageUrl} alt="Ad creative" className="absolute inset-0 w-full h-full object-cover opacity-90" />
    )}
    
    {/* Gradient Overlay for text readability */}
    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

    {/* Right Sidebar Actions */}
    <div className="absolute right-2 bottom-24 flex flex-col items-center gap-4 z-10">
      <div className="relative w-[48px] h-[48px] rounded-full border-2 border-white overflow-hidden mb-2 cursor-pointer">
        <img src={data.logoUrl} alt="Logo" className="w-full h-full object-cover" />
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#FE2C55] rounded-full p-0.5">
          <PlusCircle className="w-3 h-3 text-white fill-current" />
        </div>
      </div>
      <div className="flex flex-col items-center gap-1 text-white cursor-pointer">
        <Heart className="w-8 h-8 fill-white drop-shadow-md" />
        <span className="text-[13px] font-semibold drop-shadow-md">124K</span>
      </div>
      <div className="flex flex-col items-center gap-1 text-white cursor-pointer">
        <MessageCircle className="w-8 h-8 fill-white drop-shadow-md" />
        <span className="text-[13px] font-semibold drop-shadow-md">1024</span>
      </div>
      <div className="flex flex-col items-center gap-1 text-white cursor-pointer">
        <Bookmark className="w-8 h-8 fill-white drop-shadow-md" />
        <span className="text-[13px] font-semibold drop-shadow-md">8432</span>
      </div>
      <div className="flex flex-col items-center gap-1 text-white cursor-pointer">
        <Share2 className="w-8 h-8 fill-white drop-shadow-md" />
        <span className="text-[13px] font-semibold drop-shadow-md">Share</span>
      </div>
    </div>

    {/* Bottom Content */}
    <div className="absolute bottom-0 left-0 right-0 p-3 z-10 text-white">
      <div className="flex items-center gap-2 mb-1.5">
        <h3 className="font-bold text-[17px] drop-shadow-md cursor-pointer">@{data.brandName.replace(/\s+/g, '').toLowerCase()}</h3>
      </div>
      <p className="text-[15px] mb-2 line-clamp-2 drop-shadow-md leading-snug pr-12">
        {data.primaryText}
      </p>
      <div className="flex items-center gap-2 text-[14px] mb-3 font-medium drop-shadow-md cursor-pointer">
        <Music className="w-4 h-4" />
        <span className="truncate pr-12">Original sound - {data.brandName}</span>
      </div>
      
      {/* CTA Button */}
      <div className="bg-[#FE2C55]/90 backdrop-blur-sm hover:bg-[#FE2C55] text-white font-semibold py-2.5 rounded-sm flex justify-between items-center px-4 transition-colors cursor-pointer border border-white/20">
        <span className="text-[15px]">{data.ctaText}</span>
        <ChevronRight className="w-5 h-5" />
      </div>
    </div>
  </motion.div>
  );
});

// --- Main App Component ---

export default function App() {
  const [activeTab, setActiveTab] = useState<'create' | 'dashboard'>('create');
  const [platform, setPlatform] = useState<Platform>('facebook');
  const [adFormat, setAdFormat] = useState<AdFormat>('feed');
  const [device, setDevice] = useState<Device>('mobile');
  const [goal, setGoal] = useState<Goal>('lead_generation');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [adData, setAdData] = useState<AdData>(DEFAULT_AD);
  const [imageStyle, setImageStyle] = useState<string>('none');

  // Chatbot state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'model', text: string, suggestion?: Partial<AdData>}[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Scheduling state
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduleTimezone, setScheduleTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [scheduleRecurring, setScheduleRecurring] = useState('none');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Video generation state
  const [isVideoGenerating, setIsVideoGenerating] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAdData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'imageUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdData(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const applySuggestion = (suggestion: Partial<AdData>) => {
    setAdData(prev => ({ ...prev, ...suggestion }));
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;

    const newUserMsg = { role: 'user' as const, text: chatInput };
    setChatMessages(prev => [...prev, newUserMsg]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const parts: any[] = [{ text: chatInput }];
      
      if (adData.logoUrl.startsWith('data:')) {
        const [mime, data] = adData.logoUrl.split(',');
        parts.push({
          inlineData: {
            mimeType: mime.split(':')[1].split(';')[0],
            data: data
          }
        });
      }
      
      if (adData.imageUrl.startsWith('data:')) {
        const [mime, data] = adData.imageUrl.split(',');
        parts.push({
          inlineData: {
            mimeType: mime.split(':')[1].split(';')[0],
            data: data
          }
        });
      }

      const contents = chatMessages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      })).concat({
        role: 'user',
        parts: parts
      });

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: contents,
        config: {
          systemInstruction: `You are an expert ad copywriter AI. Help the user create ad copy and ad images. 
Make sure the content is catchy, looks cool, and uses emojis appropriately.
If the user provides a URL, use the urlContext tool to read it and generate a headline, primary text, and description. 
If the user asks for an image, or if it makes sense to suggest one, include an 'imagePrompt' in the JSON block. 
If the user has selected an image style (${imageStyle}), incorporate that style into the imagePrompt.
If the user has uploaded images (logo or main image), use them as context for your suggestions.
Whenever you suggest ad copy or an image, you MUST include a JSON block in your response formatted exactly like this:
\`\`\`json
{
  "headline": "Short catchy headline",
  "primaryText": "Main ad body text",
  "description": "Short description or subtext",
  "imagePrompt": "A detailed prompt for an image generation model (optional)"
}
\`\`\`
Be conversational but concise. Do not use markdown for the ad copy outside of the JSON block.`,
          tools: [{ urlContext: {} }]
        }
      });

      const responseText = response.text || '';
      
      let suggestion: any = undefined;
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        try {
          suggestion = JSON.parse(jsonMatch[1]);
          
          if (suggestion.imagePrompt) {
            try {
              const imageResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                  parts: [
                    {
                      text: suggestion.imagePrompt,
                    },
                  ],
                },
              });
              
              for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
                if (part.inlineData) {
                  const base64EncodeString = part.inlineData.data;
                  suggestion.imageUrl = `data:${part.inlineData.mimeType};base64,${base64EncodeString}`;
                  break;
                }
              }
            } catch (imageError) {
              console.error("Failed to generate image", imageError);
            }
          }
        } catch (e) {
          console.error("Failed to parse suggestion JSON", e);
        }
      }

      setChatMessages(prev => [...prev, {
        role: 'model',
        text: responseText.replace(/```json\s*([\s\S]*?)\s*```/, '').trim(),
        suggestion
      }]);

    } catch (error) {
      console.error("Chat error:", error);
      setChatMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const generateVideo = async () => {
    try {
      setIsVideoGenerating(true);
      // @ts-ignore
      if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
        // @ts-ignore
        await window.aistudio.openSelectKey();
      }
      
      const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("No API key available");
      }

      const ai = new GoogleGenAI({ apiKey });

      let imagePart = undefined;
      try {
        const res = await fetch(adData.imageUrl);
        const blob = await res.blob();
        const reader = new FileReader();
        const base64data = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
        const base64 = base64data.split(',')[1];
        imagePart = {
          imageBytes: base64,
          mimeType: blob.type || 'image/jpeg'
        };
      } catch (e) {
        console.warn("Could not fetch image for video generation", e);
      }

      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: `A promotional video for ${adData.brandName}. ${adData.primaryText}`,
        ...(imagePart ? { image: imagePart } : {}),
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '9:16'
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({operation: operation});
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const videoRes = await fetch(downloadLink, {
          headers: { 'x-goog-api-key': apiKey }
        });
        const videoBlob = await videoRes.blob();
        const videoObjectUrl = URL.createObjectURL(videoBlob);
        setAdData(prev => ({ ...prev, videoUrl: videoObjectUrl }));
      }
    } catch (error) {
      console.error("Video generation failed", error);
      alert("Video generation failed. Please try again.");
    } finally {
      setIsVideoGenerating(false);
    }
  };

  const analyzeAd = async () => {
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `
        Analyze this digital advertisement.
        Platform: ${platform}
        Format: ${adFormat}
        Goal: ${goal.replace('_', ' ')}
        Brand Name: ${adData.brandName}
        Headline: ${adData.headline}
        Primary Text: ${adData.primaryText}
        Description: ${adData.description}
        Call to Action: ${adData.ctaText}
        
        Provide a comprehensive analysis including:
        1. A score out of 100 based on best practices for this platform and goal.
        2. Expected results (e.g., estimated leads, CTR, or conversion rate).
        3. 2-3 points of constructive feedback.
        4. 2-3 actionable suggestions for improvement.
        5. Specific highlights of the ad copy (headline, primaryText, or description) that need improvement, and the reason why.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER, description: "Score out of 100" },
              expectedResults: { type: Type.STRING, description: "Estimated results based on the goal" },
              feedback: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Constructive feedback points" },
              suggestions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Actionable suggestions" },
              highlights: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    text: { type: Type.STRING, description: "The specific text snippet from the ad copy that needs improvement" },
                    reason: { type: Type.STRING, description: "Why this text needs improvement" }
                  },
                  required: ["text", "reason"]
                },
                description: "Specific parts of the ad copy that need improvement"
              }
            },
            required: ["score", "expectedResults", "feedback", "suggestions"]
          }
        }
      });

      if (response.text) {
        setAnalysis(JSON.parse(response.text));
      }
    } catch (error) {
      console.error("Error analyzing ad:", error);
      alert("Failed to analyze ad. Please check your API key and try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (scheduleDate && scheduleTime) {
      setIsScheduleModalOpen(false);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    }
  };

  const getDeviceStyles = () => {
    switch (device) {
      case 'mobile':
        return "w-[375px] h-[812px] rounded-[3rem] border-[12px] border-gray-900 shadow-2xl overflow-hidden bg-white flex flex-col relative shrink-0";
      case 'tablet':
        return "w-[768px] h-[1024px] rounded-[2rem] border-[12px] border-gray-900 shadow-2xl overflow-hidden bg-white flex flex-col relative shrink-0";
      case 'desktop':
        return "w-full h-full rounded-xl border border-gray-200 shadow-lg overflow-hidden bg-white flex flex-col relative";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <MonitorSmartphone className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">Ad Maker</h1>
          </div>
          
          <div className="flex items-center bg-gray-100 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('create')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'create' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <PenTool className="w-4 h-4" />
              Create Ad
            </button>
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'dashboard' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'create' ? (
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Left Column: Form */}
          <div className="w-full lg:w-[400px] shrink-0 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                Ad Details
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Goal</label>
                  <select 
                    value={goal}
                    onChange={(e) => setGoal(e.target.value as Goal)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
                  >
                    <option value="lead_generation">Lead Generation</option>
                    <option value="sales">Sales / Conversions</option>
                    <option value="brand_awareness">Brand Awareness</option>
                    <option value="website_traffic">Website Traffic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand Name</label>
                  <input 
                    type="text" 
                    name="brandName"
                    value={adData.brandName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL or Upload</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        name="logoUrl"
                        value={adData.logoUrl.startsWith('data:') ? 'Uploaded Image' : adData.logoUrl}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      />
                      <label className="flex items-center justify-center px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                        <span className="text-xs font-medium text-gray-700">Upload</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'logoUrl')} />
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL or Upload</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        name="imageUrl"
                        value={adData.imageUrl.startsWith('data:') ? 'Uploaded Image' : adData.imageUrl}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                      />
                      <label className="flex items-center justify-center px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                        <span className="text-xs font-medium text-gray-700">Upload</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'imageUrl')} />
                      </label>
                    </div>
                    {platform === 'tiktok' && (
                      <button
                        type="button"
                        onClick={generateVideo}
                        disabled={isVideoGenerating}
                        className="mt-2 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm disabled:opacity-50"
                      >
                        {isVideoGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                        {isVideoGenerating ? 'Generating Video...' : 'Generate AI Video'}
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-end mb-1">
                    <label className="block text-sm font-medium text-gray-700">Headline <span className="text-gray-400 font-normal">(Google, FB)</span></label>
                    {CHARACTER_LIMITS[platform].headline > 0 && (
                      <span className={`text-xs ${adData.headline.length > CHARACTER_LIMITS[platform].headline ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                        {adData.headline.length} / {CHARACTER_LIMITS[platform].headline}
                      </span>
                    )}
                  </div>
                  <input 
                    type="text" 
                    name="headline"
                    value={adData.headline}
                    onChange={handleInputChange}
                    maxLength={CHARACTER_LIMITS[platform].headline > 0 ? CHARACTER_LIMITS[platform].headline : undefined}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-end mb-1">
                    <label className="block text-sm font-medium text-gray-700">Primary Text <span className="text-gray-400 font-normal">(FB, IG, TikTok)</span></label>
                    {CHARACTER_LIMITS[platform].primaryText > 0 && (
                      <span className={`text-xs ${adData.primaryText.length > CHARACTER_LIMITS[platform].primaryText ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                        {adData.primaryText.length} / {CHARACTER_LIMITS[platform].primaryText}
                      </span>
                    )}
                  </div>
                  <textarea 
                    name="primaryText"
                    value={adData.primaryText}
                    onChange={handleInputChange}
                    maxLength={CHARACTER_LIMITS[platform].primaryText > 0 ? CHARACTER_LIMITS[platform].primaryText : undefined}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-end mb-1">
                    <label className="block text-sm font-medium text-gray-700">Description <span className="text-gray-400 font-normal">(Google, FB)</span></label>
                    {CHARACTER_LIMITS[platform].description > 0 && (
                      <span className={`text-xs ${adData.description.length > CHARACTER_LIMITS[platform].description ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                        {adData.description.length} / {CHARACTER_LIMITS[platform].description}
                      </span>
                    )}
                  </div>
                  <textarea 
                    name="description"
                    value={adData.description}
                    onChange={handleInputChange}
                    maxLength={CHARACTER_LIMITS[platform].description > 0 ? CHARACTER_LIMITS[platform].description : undefined}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Destination URL</label>
                    <input 
                      type="text" 
                      name="destinationUrl"
                      value={adData.destinationUrl}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Call to Action</label>
                    <select 
                      name="ctaText"
                      value={adData.ctaText}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
                    >
                      {CTA_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Panel */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex gap-3">
                <button
                  onClick={() => setIsScheduleModalOpen(true)}
                  className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Schedule Post
                </button>
                <button
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Publish Now
                </button>
              </div>
            </div>

            {/* AI Assistant Panel */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl shadow-sm border border-indigo-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-indigo-900">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  AI Ad Scorer
                </h2>
                <button
                  onClick={analyzeAd}
                  disabled={isAnalyzing}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Ad'}
                </button>
              </div>

              {analysis && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-indigo-50">
                    <div className="flex flex-col items-center justify-center w-16 h-16 rounded-full bg-indigo-100 text-indigo-700 font-bold text-2xl border-4 border-indigo-200 shrink-0">
                      {analysis.score}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">Expected Results</h3>
                      <p className="text-sm text-gray-600 leading-snug">{analysis.expectedResults}</p>
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-indigo-50">
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm">Feedback</h3>
                    <ul className="space-y-1">
                      {analysis.feedback.map((item, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-indigo-400 mt-0.5">•</span> <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-indigo-50">
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm">Suggestions</h3>
                    <ul className="space-y-1">
                      {analysis.suggestions.map((item, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">→</span> <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {analysis.highlights && analysis.highlights.length > 0 && (
                    <div className="bg-white p-4 rounded-xl border border-indigo-50">
                      <h3 className="font-semibold text-gray-900 mb-2 text-sm">Copy Highlights</h3>
                      <ul className="space-y-3">
                        {analysis.highlights.map((item, i) => (
                          <li key={i} className="text-sm">
                            <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded inline-block mb-1 font-medium">
                              "{item.text}"
                            </div>
                            <p className="text-gray-600 text-xs">{item.reason}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              )}
              
              {!analysis && !isAnalyzing && (
                <div className="text-center py-6 text-indigo-400/80 text-sm">
                  Click "Analyze Ad" to get AI-powered insights, score, and expected leads based on your goal.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Preview */}
          <div className="flex-1 flex flex-col">
            {/* Platform & Device Selector */}
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-200 mb-6 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 overflow-x-auto hide-scrollbar">
              <div className="flex flex-col gap-2 min-w-max">
                <div className="flex space-x-2">
                  <button
                    onClick={() => { setPlatform('google'); setAdFormat('search'); }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                      platform === 'google' 
                        ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' 
                        : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <Search className="w-4 h-4" /> Google
                  </button>
                  <button
                    onClick={() => { setPlatform('facebook'); setAdFormat('feed'); }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                      platform === 'facebook' 
                        ? 'bg-[#1877f2]/10 text-[#1877f2] shadow-sm border border-[#1877f2]/20' 
                        : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <Facebook className="w-4 h-4" /> Facebook
                  </button>
                  <button
                    onClick={() => { setPlatform('instagram'); setAdFormat('feed'); }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                      platform === 'instagram' 
                        ? 'bg-pink-50 text-pink-600 shadow-sm border border-pink-100' 
                        : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <Instagram className="w-4 h-4" /> Instagram
                  </button>
                  <button
                    onClick={() => { setPlatform('tiktok'); setAdFormat('in-feed'); }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                      platform === 'tiktok' 
                        ? 'bg-gray-900 text-white shadow-sm border border-gray-800' 
                        : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <Video className="w-4 h-4" /> TikTok
                  </button>
                </div>
                <div className="flex space-x-2">
                  {PLATFORM_FORMATS[platform].map((format) => (
                    <button
                      key={format.id}
                      onClick={() => setAdFormat(format.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        adFormat === format.id
                          ? 'bg-gray-800 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {format.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center bg-gray-100 p-1 rounded-lg shrink-0">
                <button
                  onClick={() => setDevice('mobile')}
                  className={`p-2 rounded-md transition-all ${device === 'mobile' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                  title="Mobile"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDevice('tablet')}
                  className={`p-2 rounded-md transition-all ${device === 'tablet' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                  title="Tablet"
                >
                  <Tablet className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDevice('desktop')}
                  className={`p-2 rounded-md transition-all ${device === 'desktop' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                  title="Desktop"
                >
                  <Monitor className="w-4 h-4" />
                </button>
              </div>
            </div>

          {/* Preview Canvas */}
            <div className="flex-1 bg-gray-200/50 rounded-3xl border-2 border-dashed border-gray-300 flex items-center justify-center p-4 sm:p-8 min-h-[600px] overflow-hidden relative">
              <div className={`transition-all duration-500 ease-in-out ${getDeviceStyles()}`}>
                {/* Device Header Bar (for mobile/tablet) */}
                {device !== 'desktop' && (
                  <div className="h-6 w-full bg-gray-100 flex items-center justify-center shrink-0 border-b border-gray-200">
                    <div className="w-16 h-1.5 bg-gray-300 rounded-full"></div>
                  </div>
                )}
                
                <div className="flex-1 overflow-y-auto flex items-center justify-center p-4 bg-gray-50">
                  <AnimatePresence mode="wait">
                    {platform === 'google' && <GoogleAd key="google" data={adData} format={adFormat} />}
                    {platform === 'facebook' && <FacebookAd key="facebook" data={adData} format={adFormat} />}
                    {platform === 'instagram' && <InstagramAd key="instagram" data={adData} format={adFormat} />}
                    {platform === 'tiktok' && <TikTokAd key="tiktok" data={adData} format={adFormat} />}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Performance Dashboard</h2>
              <div className="flex gap-2">
                <select className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 outline-none">
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>This Month</option>
                </select>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
                <div className="text-sm font-medium text-gray-500 mb-1">Total Impressions</div>
                <div className="text-3xl font-bold text-gray-900">126,000</div>
                <div className="text-sm font-medium text-green-600 mt-2 flex items-center gap-1">
                  ↑ 12.5% <span className="text-gray-400 font-normal">vs last period</span>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
                <div className="text-sm font-medium text-gray-500 mb-1">Total Clicks</div>
                <div className="text-3xl font-bold text-gray-900">9,750</div>
                <div className="text-sm font-medium text-green-600 mt-2 flex items-center gap-1">
                  ↑ 8.2% <span className="text-gray-400 font-normal">vs last period</span>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
                <div className="text-sm font-medium text-gray-500 mb-1">Conversions</div>
                <div className="text-3xl font-bold text-gray-900">575</div>
                <div className="text-sm font-medium text-green-600 mt-2 flex items-center gap-1">
                  ↑ 15.3% <span className="text-gray-400 font-normal">vs last period</span>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
                <div className="text-sm font-medium text-gray-500 mb-1">Avg. CTR</div>
                <div className="text-3xl font-bold text-gray-900">7.74%</div>
                <div className="text-sm font-medium text-red-600 mt-2 flex items-center gap-1">
                  ↓ 1.1% <span className="text-gray-400 font-normal">vs last period</span>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Clicks & Impressions</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={DASHBOARD_DATA} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dx={-10} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dx={10} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line yAxisId="left" type="monotone" dataKey="impressions" stroke="#818CF8" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Impressions" />
                    <Line yAxisId="right" type="monotone" dataKey="clicks" stroke="#34D399" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Clicks" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Scheduled Ads Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Scheduled & Active Ads</h3>
                <button 
                  onClick={() => setActiveTab('create')}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <PlusCircle className="w-4 h-4" /> New Ad
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3">Ad Name</th>
                      <th className="px-6 py-3">Platform</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Schedule</th>
                      <th className="px-6 py-3">Timezone</th>
                      <th className="px-6 py-3">Recurring</th>
                      <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {SCHEDULED_ADS.map((ad) => (
                      <tr key={ad.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{ad.name}</td>
                        <td className="px-6 py-4 capitalize">{ad.platform}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            ad.status === 'Active' ? 'bg-green-100 text-green-700' :
                            ad.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {ad.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-gray-900">
                            <Clock className="w-4 h-4 text-gray-400" />
                            {ad.date} at {ad.time}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500">{ad.timezone}</td>
                        <td className="px-6 py-4 text-gray-500">{ad.recurring}</td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-indigo-600 hover:text-indigo-900 font-medium">Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Schedule Modal */}
      <AnimatePresence>
        {isScheduleModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  Schedule Ad
                </h3>
                <button onClick={() => setIsScheduleModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSchedule} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    required
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                  <select
                    value={scheduleTimezone}
                    onChange={(e) => setScheduleTimezone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="Europe/London">London (GMT)</option>
                    <option value="Europe/Paris">Central European Time (CET)</option>
                    <option value="Asia/Tokyo">Japan Standard Time (JST)</option>
                    <option value="Australia/Sydney">Australian Eastern Time (AET)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recurring</label>
                  <select
                    value={scheduleRecurring}
                    onChange={(e) => setScheduleRecurring(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="none">None (One-time)</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsScheduleModalOpen(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700"
                  >
                    Confirm Schedule
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 z-[70]"
          >
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <span className="font-medium">Ad scheduled successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chatbot Toggle Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className={`fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-xl hover:bg-indigo-700 transition-all z-50 ${isChatOpen ? 'hidden' : 'flex'}`}
      >
        <Bot className="w-6 h-6" />
      </button>

      {/* Chatbot Window */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-[380px] h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-indigo-600 p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                <h3 className="font-semibold">AI Copywriter</h3>
              </div>
              <div className="flex items-center gap-2">
                <select 
                  value={imageStyle} 
                  onChange={(e) => setImageStyle(e.target.value)}
                  className="bg-indigo-700 text-white text-xs rounded px-2 py-1 outline-none border border-indigo-500"
                >
                  <option value="none">No Style</option>
                  <option value="vintage">Vintage</option>
                  <option value="minimalist">Minimalist</option>
                  <option value="cinematic">Cinematic</option>
                  <option value="neon">Neon</option>
                </select>
                <button onClick={() => setIsChatOpen(false)} className="text-white/80 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {chatMessages.length === 0 && (
                <div className="text-center text-gray-500 text-sm mt-4">
                  Hi! I can help you write ad copy. Paste a URL and tell me what kind of ad you want to create!
                </div>
              )}
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {msg.text && (
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm whitespace-pre-wrap'}`}>
                      {msg.text}
                    </div>
                  )}
                  {msg.suggestion && (
                    <div className="mt-2 w-[90%] bg-white border border-indigo-100 rounded-xl p-3 shadow-sm self-start">
                      <div className="text-xs font-semibold text-indigo-600 mb-2 uppercase tracking-wider">Suggested Copy</div>
                      {msg.suggestion.headline && (
                        <div className="mb-2">
                          <div className="text-[10px] text-gray-500 font-medium">HEADLINE</div>
                          <div className="text-sm font-medium text-gray-900">{msg.suggestion.headline}</div>
                        </div>
                      )}
                      {msg.suggestion.primaryText && (
                        <div className="mb-2">
                          <div className="text-[10px] text-gray-500 font-medium">PRIMARY TEXT</div>
                          <div className="text-sm text-gray-700 line-clamp-2">{msg.suggestion.primaryText}</div>
                        </div>
                      )}
                      {msg.suggestion.description && (
                        <div className="mb-3">
                          <div className="text-[10px] text-gray-500 font-medium">DESCRIPTION</div>
                          <div className="text-sm text-gray-700 line-clamp-2">{msg.suggestion.description}</div>
                        </div>
                      )}
                      {msg.suggestion.imageUrl && (
                        <div className="mb-3">
                          <div className="text-[10px] text-gray-500 font-medium mb-1">IMAGE</div>
                          <img src={msg.suggestion.imageUrl} alt="Suggested ad creative" className="w-full h-auto rounded-lg object-cover" />
                        </div>
                      )}
                      <button
                        onClick={() => applySuggestion(msg.suggestion!)}
                        className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Apply to Ad
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {isChatLoading && (
                <div className="flex items-start">
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                    <span className="text-xs text-gray-500">Thinking...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 bg-white border-t border-gray-200">
              <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Paste a URL or ask for copy..."
                  className="flex-1 bg-gray-100 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-xl px-4 py-2 text-sm outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isChatLoading}
                  className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
