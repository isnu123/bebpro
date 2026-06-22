/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { EquipmentItem, Order } from '../types';
import { 
  Video, 
  Layers, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  BadgeAlert, 
  Activity,
  MapPin,
  TrendingUp,
  Briefcase
} from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  inventory: EquipmentItem[];
  orders: Order[];
  onNavigateToTab: (tab: string) => void;
}

export default function Dashboard({ inventory, orders, onNavigateToTab }: DashboardProps) {
  // Compute analytics
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'Pending').length;
    const approvedOrders = orders.filter(o => o.status === 'Disetujui').length;
    const completedOrders = orders.filter(o => o.status === 'Selesai').length;

    const totalIncome = orders
      .filter(o => o.status === 'Disetujui' || o.status === 'Selesai')
      .reduce((sum, o) => sum + o.totalBiaya, 0);

    const totalEquipment = inventory.reduce((sum, item) => sum + item.jumlahTotal, 0);
    const maintenanceEquipment = inventory.filter(i => i.status === 'Maintenance' || i.kondisi === 'Rusak').length;
    const usedEquipment = inventory.filter(i => i.status === 'Digunakan').length;
    const availableEquipment = totalEquipment - maintenanceEquipment - usedEquipment;

    return {
      totalOrders,
      pendingOrders,
      approvedOrders,
      completedOrders,
      totalIncome,
      totalEquipment,
      maintenanceEquipment,
      usedEquipment,
      availableEquipment
    };
  }, [inventory, orders]);

  // Upcoming shooting agenda (sorted by closest date)
  const agenda = useMemo(() => {
    return [...orders]
      .filter(o => o.status === 'Disetujui' || o.status === 'Pending')
      .sort((a, b) => new Date(a.tanggalAcara).getTime() - new Date(b.tanggalAcara).getTime())
      .slice(0, 5);
  }, [orders]);

  // Equipment categories summary
  const categorySummary = useMemo(() => {
    const counts: { [key: string]: number } = {};
    inventory.forEach(item => {
      counts[item.kategori] = (counts[item.kategori] || 0) + item.jumlahTotal;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [inventory]);

  return (
    <div className="space-y-8">
      {/* Dynamic Header Display */}
      <div className="bg-[#111319] border border-white/10 rounded-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div>
          <h1 className="text-3xl font-serif italic text-white tracking-tight">
            Dashboard BEB Production
          </h1>
          <p className="text-white/50 text-xs mt-1 font-sans">
            Sistem pengawasan terpadu untuk pementasan jasa video streaming, perekaman momen, dan manajemen alokasi kesehatan alat.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-amber-500 bg-amber-500/10 px-3.5 py-1 rounded-sm border border-amber-500/20 w-fit self-start md:self-center uppercase tracking-wider">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          Connected Database: Active
        </div>
      </div>

      {/* Grid Status Ringkasan */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total revenue */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-[#111319] border border-white/10 hover:border-amber-500/40 rounded-sm p-5 shadow-sm transition-all duration-350 cursor-pointer"
          onClick={() => onNavigateToTab('orders')}
        >
          <div className="flex items-center justify-between">
            <span className="text-white/40 text-[10px] tracking-widest uppercase font-mono">Total Omset Aktif</span>
            <div className="p-2 bg-emerald-500/5 rounded-full text-emerald-400 border border-emerald-500/10">
              <TrendingUp size={14} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-serif italic text-white">
              Rp {stats.totalIncome.toLocaleString('id-ID')}
            </h3>
            <p className="text-white/40 text-[10px] mt-1.5 font-sans">
              Dari pemesanan Disetujui &amp; Selesai
            </p>
          </div>
        </motion.div>

        {/* Pending Booking */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-[#111319] border border-white/10 hover:border-amber-500/40 rounded-sm p-5 shadow-sm transition-all duration-350 cursor-pointer"
          onClick={() => onNavigateToTab('orders')}
        >
          <div className="flex items-center justify-between">
            <span className="text-white/40 text-[10px] tracking-widest uppercase font-mono">Pemesanan Pending</span>
            <div className="p-2 bg-amber-505/5 rounded-full text-amber-400 border border-amber-500/10">
              <Clock size={14} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-serif italic text-amber-550">
              {stats.pendingOrders} <span className="text-white/40 font-serif text-lg not-italic">Antrean</span>
            </h3>
            <p className="text-amber-550/80 text-[10px] mt-1.5 flex items-center gap-1 font-sans uppercase">
              <Activity size={10} className="animate-pulse" /> Butuh peninjauan admin
            </p>
          </div>
        </motion.div>

        {/* Total Booking */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-[#111319] border border-white/10 hover:border-amber-500/40 rounded-sm p-5 shadow-sm transition-all duration-350 cursor-pointer"
          onClick={() => onNavigateToTab('orders')}
        >
          <div className="flex items-center justify-between">
            <span className="text-white/40 text-[10px] tracking-widest uppercase font-mono">Total Pekerjaan</span>
            <div className="p-2 bg-sky-505/5 rounded-full text-sky-400 border border-sky-500/10">
              <CheckCircle size={14} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-serif italic text-white">
              {stats.totalOrders} <span className="text-white/40 font-serif text-lg not-italic">Total</span>
            </h3>
            <p className="text-white/40 text-[10px] mt-1.5 font-sans">
              {stats.approvedOrders} Disetujui, {stats.completedOrders} Selesai
            </p>
          </div>
        </motion.div>

        {/* Status Inventori */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="bg-[#111319] border border-white/10 hover:border-amber-500/40 rounded-sm p-5 shadow-sm transition-all duration-350 cursor-pointer"
          onClick={() => onNavigateToTab('inventory')}
        >
          <div className="flex items-center justify-between">
            <span className="text-white/40 text-[10px] tracking-widest uppercase font-mono">Kesehatan Alat</span>
            <div className="p-2 bg-rose-505/5 rounded-full text-rose-450 border border-rose-500/10">
              <Layers size={14} />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-serif italic text-white">
              {inventory.length} <span className="text-white/40 font-serif text-lg not-italic">Model Alat</span>
            </h3>
            <p className="text-rose-400 text-[10px] mt-1.5 flex items-center gap-1 font-sans uppercase">
              <AlertTriangle size={11} /> {inventory.filter(i => i.kondisi !== 'Baik').length} Perlu perhatian
            </p>
          </div>
        </motion.div>
      </div>

      {/* Main Row: Agenda Pekerjaan & Detail Alat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Kiri: Jadwal Agenda Kerja */}
        <div className="lg:col-span-7 bg-[#111319] border border-white/10 rounded-sm p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Calendar className="text-amber-500" size={16} />
              <h2 className="text-lg font-serif italic text-white">Jadwal Agenda Pekerjaan Terdekat</h2>
            </div>
            <button 
              onClick={() => onNavigateToTab('orders')}
              className="text-[10px] tracking-widest uppercase font-mono text-amber-500 hover:text-amber-400 font-medium"
            >
              Lihat Semua
            </button>
          </div>

          <div className="space-y-3">
            {agenda.length === 0 ? (
              <div className="text-center py-10">
                <Calendar size={24} className="text-white/20 mx-auto mb-2" />
                <p className="text-white/40 text-xs">Tidak ada pekerjaan terdekat yang terdaftar.</p>
              </div>
            ) : (
              agenda.map((item, idx) => (
                <div 
                  key={item.id} 
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-black/20 hover:bg-black/30 rounded-sm border border-white/5 hover:border-amber-500/20 transition-all gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium text-sm group-hover:text-amber-500 transition-colors">
                        {item.namaKlien}
                      </span>
                      <span className={`px-2 py-0.5 rounded-sm text-[8px] uppercase font-mono tracking-wider ${
                        item.status === 'Disetujui' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-white/50">
                      <span className="flex items-center gap-1">
                        <Briefcase size={11} className="text-white/30" />
                        {item.paketNama}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={11} className="text-white/30" />
                        {item.lokasiAcara}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center sm:text-right flex-row sm:flex-col justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-white/5 gap-1 shrink-0">
                    <span className="text-[10px] font-mono text-white/60 bg-white/5 px-2 py-0.5 rounded-sm border border-white/5">
                      📅 {item.tanggalAcara}
                    </span>
                    <span className="text-xs text-emerald-400 font-semibold font-mono">
                      Rp {item.totalBiaya.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Kanan: Ringkasan Status Alat & Alokasi */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Status Inventori Card */}
          <div className="bg-[#111319] border border-white/10 rounded-sm p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-serif italic text-white flex items-center gap-2 pb-2 border-b border-white/10">
              <Video className="text-amber-500" size={16} />
              Merek &amp; Ketersediaan Alat
            </h2>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-black/30 p-3 rounded-sm border border-white/5">
                <span className="text-emerald-400 font-mono text-lg font-bold">{inventory.filter(i => i.status === 'Tersedia' && i.kondisi === 'Baik').length}</span>
                <p className="text-white/40 text-[9px] mt-1 font-mono uppercase tracking-wider">Siap Dipakai</p>
              </div>
              <div className="bg-black/30 p-3 rounded-sm border border-white/5">
                <span className="text-yellow-400 font-mono text-lg font-bold">{inventory.filter(i => i.status === 'Digunakan').length}</span>
                <p className="text-white/40 text-[9px] mt-1 font-mono uppercase tracking-wider">Sedang Event</p>
              </div>
              <div className="bg-black/30 p-3 rounded-sm border border-white/5">
                <span className="text-rose-400 font-mono text-lg font-bold">{inventory.filter(i => i.kondisi !== 'Baik' || i.status === 'Maintenance').length}</span>
                <p className="text-white/40 text-[9px] mt-1 font-mono uppercase tracking-wider">Maintenance</p>
              </div>
            </div>

            <div className="space-y-2 mt-4 text-[11px]">
              <div className="flex items-center justify-between text-white/50">
                <span>Total Item Fisik Terdaftar:</span>
                <span className="text-white font-mono font-medium">
                  {inventory.reduce((acc, curr) => acc + curr.jumlahTotal, 0)} Pcs
                </span>
              </div>
              <div className="flex items-center justify-between text-white/50">
                <span>Alat Butuh Perbaikan segera:</span>
                <span className="text-rose-400 font-mono font-medium">
                  {inventory.filter(i => i.kondisi === 'Rusak').length} Unit
                </span>
              </div>
              <div className="flex items-center justify-between text-white/50">
                <span>Alat Perlu Pemeliharaan Ringan:</span>
                <span className="text-amber-400 font-mono font-medium">
                  {inventory.filter(i => i.kondisi === 'Perlu Perbaikan').length} Unit
                </span>
              </div>
            </div>

            <button 
              onClick={() => onNavigateToTab('inventory')}
              className="w-full text-center py-2 bg-black/40 hover:bg-black/60 text-amber-500 rounded-sm text-xs font-mono uppercase tracking-wider border border-white/10 hover:border-amber-500/20 transition-all duration-300"
            >
              Kelola Inventori Peralatan
            </button>
          </div>

          {/* Quick Helper / Info UAS Box */}
          <div className="bg-gradient-to-br from-amber-500/5 to-white/5 border border-white/5 rounded-sm p-6 shadow-sm flex flex-col justify-between">
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-amber-500 tracking-widest uppercase font-mono flex items-center gap-1.5">
                <BadgeAlert size={12} /> Proyek UAS Cloud Computing
              </h3>
              <p className="text-xs text-white/70 leading-relaxed font-sans">
                Aplikasi Cloud terintegrasi dengan database, notifikasi bot Telegram instan, dan asisten rekomendasi paket model AI Gemini. 
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 text-[10.5px] text-white/40 space-y-1 font-sans">
              <div><strong className="text-white/60">Mahasiswa:</strong> Isnu Ardianto</div>
              <div><strong className="text-white/60">Dosen Pengampu:</strong> Triyono, S.Kom., M.Kom.</div>
              <div className="text-amber-550 font-medium font-mono text-[9px] uppercase tracking-wider mt-1">BEB Production &copy; 2026</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
