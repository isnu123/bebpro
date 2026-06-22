/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Order, EquipmentItem } from '../types';
import { 
  Users, 
  MapPin, 
  Phone, 
  Trash2, 
  Play, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ExternalLink,
  DollarSign,
  MonitorPlay,
  Layers,
  Inbox
} from 'lucide-react';
import { motion } from 'motion/react';

interface OrdersManagerProps {
  orders: Order[];
  inventory: EquipmentItem[];
  onUpdateOrderStatus: (id: string, status: 'Pending' | 'Disetujui' | 'Selesai' | 'Dibatalkan') => Promise<boolean>;
  onDeleteOrder: (id: string) => Promise<boolean>;
}

export default function OrdersManager({ 
  orders, 
  inventory, 
  onUpdateOrderStatus, 
  onDeleteOrder 
}: OrdersManagerProps) {
  const [statusFilter, setStatusFilter] = useState<'Semua' | 'Pending' | 'Disetujui' | 'Selesai' | 'Dibatalkan'>('Semua');

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return [...orders]
      .filter(o => statusFilter === 'Semua' || o.status === statusFilter)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, statusFilter]);

  // Handle status update triggers
  const handleStatusChange = async (id: string, newStatus: 'Pending' | 'Disetujui' | 'Selesai' | 'Dibatalkan') => {
    const isOk = await onUpdateOrderStatus(id, newStatus);
    if (!isOk) {
      alert('Gagal mendata status di server.');
    }
  };

  // Handle delete order
  const handleDelete = async (id: string, klien: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus catatan pesanan "${klien}"?`)) {
      const isOk = await onDeleteOrder(id);
      if (!isOk) {
        alert('Gagal menghapus pesanan dari server.');
      }
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-white/10">
        <div>
          <h2 className="text-2xl font-serif italic text-white flex items-center gap-2">
            <Inbox className="text-amber-500" size={20} />
            Pengelolaan Data Pesanan Jasa
          </h2>
          <p className="text-white/50 text-xs mt-1 font-sans">
            Validasi pesanan, edit status kelayakan event, alokasikan alat, dan otomatisasi komunikasi bot Telegram.
          </p>
        </div>
        
        {/* Status Tab Filters */}
        <div className="flex flex-wrap bg-black/40 p-1 rounded-sm border border-white/10 gap-1 self-start lg:self-center">
          {(['Semua', 'Pending', 'Disetujui', 'Selesai', 'Dibatalkan'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-sm text-[10px] font-mono uppercase tracking-wider transition-all ${
                statusFilter === tab
                  ? 'bg-amber-600 text-black font-semibold shadow-sm'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              {tab === 'Semua' ? 'Semua Jasa' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Grid */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 bg-[#111319] border border-white/10 rounded-sm">
            <Users size={24} className="text-white/20 mx-auto mb-2" />
            <p className="text-white/40 text-xs font-sans">Tidak ada pemesanan dalam status ini.</p>
          </div>
        ) : (
          filteredOrders.map((order, idx) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: idx * 0.04 }}
              className="bg-[#111319] border border-white/10 hover:border-amber-500/30 rounded-sm p-5 shadow-sm space-y-4 relative overflow-hidden transition-all duration-250"
            >
              {/* Accents for different status */}
              <div className={`absolute top-0 bottom-0 left-0 w-1 ${
                order.status === 'Pending' ? 'bg-amber-500' :
                order.status === 'Disetujui' ? 'bg-emerald-500' :
                order.status === 'Selesai' ? 'bg-sky-500' : 'bg-white/20'
              }`}></div>

              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                
                {/* Meta details */}
                <div className="space-y-2 flex-grow pl-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-serif italic text-white tracking-tight leading-none">
                      {order.namaKlien}
                    </span>
                    <span className="text-[9px] font-mono text-white/40 bg-black/40 px-2 py-0.5 rounded-sm border border-white/5">
                      ID: {order.id}
                    </span>
                    
                    {/* Status Pill */}
                    <span className={`px-2 py-0.5 rounded-sm text-[8px] uppercase font-mono tracking-wide font-medium ml-auto md:ml-0 ${
                      order.status === 'Pending' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                      order.status === 'Disetujui' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      order.status === 'Selesai' ? 'bg-sky-500/10 text-sky-450 border border-sky-500/20' :
                      'bg-white/5 text-white/40 border border-white/10'
                    }`}>
                      {order.status}
                    </span>
                  </div>

                  <p className="text-white/80 text-xs font-sans flex items-center gap-1">
                    <MonitorPlay size={13} className="text-amber-500" />
                    Paket: <span className="text-white underline decoration-amber-500/30 font-serif italic">{order.paketNama}</span>
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 py-1 text-white/50 text-xs font-sans">
                    <div className="flex items-center gap-1.5">
                      <Phone size={12} className="text-white/30" /> WhatsApp:
                      <strong className="text-white/80 font-mono text-[11px]">{order.kontak}</strong>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} className="text-white/30" /> Tanggal Event:
                      <strong className="text-amber-400 font-mono text-[11px]">{order.tanggalAcara} ({order.durasiHari} Hari)</strong>
                    </div>
                    <div className="flex items-center gap-1.5 sm:col-span-2 lg:col-span-1">
                      <MapPin size={12} className="text-white/30" /> Lokasi:
                      <strong className="text-white/80">{order.lokasiAcara}</strong>
                    </div>
                  </div>
                </div>

                {/* Right: Price Tag */}
                <div className="text-left md:text-right flex flex-col justify-between shrink-0 h-full gap-2 self-stretch border-t md:border-t-0 pt-3 md:pt-0 border-white/5">
                  <div>
                    <span className="text-[9px] text-white/40 block uppercase font-mono tracking-wider">Total Biaya</span>
                    <span className="text-lg font-mono text-emerald-400 font-semibold block leading-none mt-1">
                      Rp {order.totalBiaya.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <span className="text-[10px] text-white/30 font-mono block mt-1">
                    Masuk: {new Date(order.createdAt).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>

              </div>

              {/* Special instructions box */}
              {order.kebutuhanKhusus && (
                <div className="bg-black/35 p-4 rounded-sm border border-white/5 text-xs ml-3">
                  <span className="font-mono text-[10px] uppercase font-bold text-amber-500 block mb-1">💬 Kategori/Catatan Khusus/Rekomendasi AI:</span>
                  <p className="text-white/70 font-sans whitespace-pre-line leading-relaxed">
                    {order.kebutuhanKhusus}
                  </p>
                </div>
              )}

              {/* Allocated physical assets */}
              {order.peralatanTerpilih && order.peralatanTerpilih.length > 0 && (
                <div className="space-y-1.5 ml-3">
                  <span className="text-[10px] font-mono tracking-wider uppercase font-semibold text-white/40 flex items-center gap-1.5">
                    <Layers size={11} className="text-white/30" /> Alokasi Unit Terpilih:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {order.peralatanTerpilih.map((item) => (
                      <span
                        key={item.id}
                        className="bg-black/20 border border-white/10 text-white/80 text-[10px] px-2 py-0.5 rounded-sm font-mono flex items-center gap-1 hover:border-amber-500/20 transition-colors"
                      >
                        <span className="text-amber-500">🎥</span> {item.nama}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions row */}
              <div className="pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 ml-3">
                <div className="flex items-center gap-2">
                  
                  {order.status === 'Pending' && (
                    <button
                      onClick={() => handleStatusChange(order.id, 'Disetujui')}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-black rounded-sm text-[10px] font-mono font-medium uppercase tracking-wider transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <Play size={10} fill="currentColor" /> Setujui Pekerjaan
                    </button>
                  )}

                  {order.status === 'Disetujui' && (
                    <button
                      onClick={() => handleStatusChange(order.id, 'Selesai')}
                      className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-black rounded-sm text-[10px] font-mono font-medium uppercase tracking-wider transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <CheckCircle2 size={10} /> Selesaikan Event
                    </button>
                  )}

                  {(order.status === 'Pending' || order.status === 'Disetujui') && (
                    <button
                      onClick={() => handleStatusChange(order.id, 'Dibatalkan')}
                      className="px-3 py-1.5 bg-black/20 hover:bg-rose-950/20 text-white/50 hover:text-rose-450 rounded-sm border border-white/10 hover:border-rose-500/30 text-[10px] font-mono uppercase tracking-wider transition-all flex items-center gap-1"
                    >
                      <X size={10} /> Batalkan
                    </button>
                  )}

                  {order.status === 'Dibatalkan' && (
                    <button
                      onClick={() => handleStatusChange(order.id, 'Pending')}
                      className="px-3 py-1.5 bg-black/20 hover:bg-white/5 text-white/70 border border-white/10 rounded-sm text-[10px] font-mono uppercase tracking-wider transition-all"
                    >
                      Kembalikan ke antrean
                    </button>
                  )}

                </div>

                <button
                  onClick={() => handleDelete(order.id, order.namaKlien)}
                  className="px-2.5 py-1.5 bg-black/20 hover:bg-rose-950/20 text-white/30 hover:text-rose-400 border border-white/10 hover:border-rose-550/30 rounded-sm text-[10px] font-mono uppercase tracking-wider transition-colors flex items-center gap-1 ml-auto"
                >
                  <Trash2 size={11} /> Hapus Log
                </button>
              </div>

            </motion.div>
          ))
        )}
      </div>

    </div>
  );
}
