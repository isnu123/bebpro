/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Heart, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  Users, 
  Tv, 
  Smile, 
  Award,
  Video
} from 'lucide-react';
import { motion } from 'motion/react';

export default function AboutUs() {
  return (
    <div className="space-y-8 animate-in fade-in duration-250">
      
      {/* Hero Banner Grid Card */}
      <div className="relative bg-[#111319] border border-white/10 rounded-sm p-8 overflow-hidden shadow-sm">
        <div className="absolute right-0 top-0 bottom-0 w-[40%] bg-gradient-to-l from-amber-500/5 to-transparent pointer-events-none rounded-r-sm"></div>
        {/* Glow point */}
        <div className="absolute right-12 top-6 w-[200px] h-[200px] bg-amber-500/5 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="max-w-2xl space-y-4 relative">
          <span className="text-[9px] bg-amber-500/10 text-amber-500 font-bold uppercase tracking-widest px-3 py-1 rounded-sm border border-amber-500/20 font-mono">
            EST. 2024 &bull; WONOGIRI
          </span>
          <h2 className="text-4xl font-serif italic text-white tracking-tight font-light">
            BEB Production
          </h2>
          <p className="text-white/70 text-xs leading-relaxed text-justify font-sans">
            Sebuah entitas yang berdiri tahun 2024, bergerak dibidang live streaming &amp; produksi video. Bertempat di Karangtengah, Wonogiri kami akan terus memperluas pelayanan kami seluas-luasnya demi mewujudkan hasil rekaman momen sinematik terbaik.
          </p>
        </div>
      </div>

      {/* Grid: Core Values */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Value 1: Pelayanan Humanis */}
        <div className="bg-[#111319] border border-white/10 p-6 rounded-sm space-y-3">
          <div className="p-3 bg-amber-500/5 text-amber-500 rounded-sm border border-amber-500/10 w-fit">
            <Smile size={18} />
          </div>
          <h3 className="text-sm font-sans font-medium text-white uppercase tracking-wider">Pelayanan Humanis</h3>
          <p className="text-white/60 text-xs leading-relaxed text-justify font-sans">
            Tim kami yang dibentuk oleh talenta anak-anak muda enerjik, mengandalkan pendekatan pelayanan yang humanis, bersahabat, terbuka, dan fleksibel merancang solusi visual terbaik.
          </p>
        </div>

        {/* Value 2: Custom Client Needs */}
        <div className="bg-[#111319] border border-white/10 p-6 rounded-sm space-y-3">
          <div className="p-3 bg-amber-500/5 text-amber-500 rounded-sm border border-amber-500/10 w-fit">
            <Video size={18} />
          </div>
          <h3 className="text-sm font-sans font-medium text-white uppercase tracking-wider">Sesuai Kebutuhan Klien</h3>
          <p className="text-white/60 text-xs leading-relaxed text-justify font-sans">
            Kami berusaha menyesuaikan rancangan produksi video dan peralatan sesuai ketersediaan anggaran dan spesifikasi teknis klien tanpa mengurangi kualitas siaran orisinal.
          </p>
        </div>

        {/* Value 3: Kolaboratif */}
        <div className="bg-[#111319] border border-white/10 p-6 rounded-sm space-y-3 md:col-span-2 lg:col-span-1">
          <div className="p-3 bg-amber-500/5 text-amber-500 rounded-sm border border-amber-500/10 w-fit">
            <Users size={18} />
          </div>
          <h3 className="text-sm font-sans font-medium text-white uppercase tracking-wider">Kemitraan &amp; Kolaborasi</h3>
          <p className="text-white/60 text-xs leading-relaxed text-justify font-sans">
            Demi mewujudkan kemajuan industri kreatif secara sehat dan dinamis di Wonogiri dan sekitarnya, kami sangat terbuka bagi segala bentuk kerja sama sebidang yang saling memberdayakan.
          </p>
        </div>

      </div>

      {/* Stats row list */}
      <div className="bg-[#111319] border border-white/10 rounded-sm p-6 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          
          <div className="space-y-1">
            <span className="text-2xl font-serif italic text-white block">2024</span>
            <span className="text-[9px] text-white/40 uppercase tracking-widest font-mono font-semibold">Tahun Berdiri</span>
          </div>

          <div className="space-y-1 border-l border-white/5">
            <span className="text-2xl font-serif italic text-amber-500 block">40+</span>
            <span className="text-[9px] text-white/40 uppercase tracking-widest font-mono font-semibold">Total Inventori Barang</span>
          </div>

          <div className="space-y-1 border-l border-white/5">
            <span className="text-2xl font-serif italic text-emerald-400 block">99%</span>
            <span className="text-[9px] text-white/40 uppercase tracking-widest font-mono font-semibold">Tanggapan Positif Kami</span>
          </div>

          <div className="space-y-1 border-l border-white/5">
            <span className="text-2xl font-serif italic text-amber-500 block">Wonogiri</span>
            <span className="text-[9px] text-white/40 uppercase tracking-widest font-mono font-semibold">Domisili Kantor</span>
          </div>

        </div>
      </div>

      {/* Narrative Section with customized quote */}
      <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-black/20 border border-white/10 rounded-sm pb-6">
        <div className="p-4 bg-amber-500/10 text-amber-500 rounded-full shrink-0 border border-amber-500/10">
          <Award size={24} />
        </div>
        <div className="space-y-2">
          <h4 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest font-mono">Prinsip Kerja BEB Production Team</h4>
          <p className="text-white/70 text-xs leading-relaxed text-justify font-sans font-light italic">
            &ldquo;Perkembangan industri kreatif yang semakin masif menuntut inovasi konstan. Kami di BEB Production senantiasa beraspirasi untuk menciptakan momen berharga yang dapat diabadikan dengan sempurna tanpa ada bagian rincian sedikitpun yang terlewatkan.&rdquo;
          </p>
        </div>
      </div>

    </div>
  );
}
