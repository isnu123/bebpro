/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { EquipmentItem, Order, AIRecommendationResponse } from '../types';
import { 
  Sparkles, 
  Tv, 
  Flame, 
  MapPin, 
  User, 
  Phone, 
  Calendar,
  Hourglass,
  DollarSign,
  Monitor,
  Video,
  Send,
  Wand2,
  ListRestart,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CatalogBookingProps {
  inventory: EquipmentItem[];
  onAddOrder: (order: Partial<Order>) => Promise<boolean>;
}

// Built-in packages
const PACKAGES = [
  {
    id: 'pkt-1',
    nama: 'Paket Streaming Event Standard',
    harga: 1500000,
    durasi: 'Up to 4 Jam',
    kamera: '1 Kamera (Sony A7C atau A6400)',
    fitur: [
      'Live Streaming full HD 1080p',
      '1x Operator Profesional',
      'DS Orca USB Audio Interface',
      '1x Laptop Lenovo/ThinkPad',
      'Kabel HDMI Standard'
    ],
    cocokUntuk: 'Syarahan, Kajian, Acara Organisasi Kecil, Webinar Seminar, Rapat Kantor.'
  },
  {
    id: 'pkt-2',
    nama: 'Wedding Documentation Suite & Live',
    harga: 3500000,
    durasi: 'Up to 10 Jam',
    kamera: '2 Kamera Profesional (Sony A7C + Sony A6400)',
    fitur: [
      'Sinematik Video Wedding Highlight (3-5 menit)',
      'Mentahan File Video Dokumentasi (G-Drive)',
      'Live Streaming Up to 2 Jam (Akad / Resepsi)',
      'Gimbal Feiyu Tech Scorp C Stabilizer',
      '2x Lampu Godox SL 60W + Softbox',
      'Wireless Intercom / HT Team'
    ],
    cocokUntuk: 'Acara Pernikahan, Khitanan, Lamaran, Reuni Akbar.'
  },
  {
    id: 'pkt-3',
    nama: 'Paket Streaming Multi-Cam Pro',
    harga: 4500000,
    durasi: 'Up to 8 Jam',
    kamera: '3 Kamera (Sony A7C + Sony A6400 + Bantuan)',
    fitur: [
      'Switcher Cinetreak CineLive V1 Hardware',
      '2x Pemancar Hollyland Wireless Transmitter',
      '1x TV 50 Inch LED untuk Client Monitoring',
      'Kabel Snake XLR to Aux 10 Meter',
      'Soundcard Behringer UMC404HD Integration',
      'Internet Modem Router Dual Backup'
    ],
    cocokUntuk: 'Seminar Besar, Konser Musik, Live Keagamaan, Pertunjukan Seni Budaya.'
  },
  {
    id: 'pkt-4',
    nama: 'Acara Wisuda / Instansi / Corporate Multi-Cam',
    harga: 6000000,
    durasi: 'Up to 12 Jam',
    kamera: 'Setup Multi-Camera Full Wireless Integration',
    fitur: [
      'Drone DJI Mini 3 Outdoor Footage (1 Sesi)',
      '2x TV 50 Inch LED + Stand TV di Lokasii',
      '3x Operator Kamera + 1 Switcher Director',
      'UPS 1200VA Listrik Generator Stabilizer',
      'Hollyland Wireless Link & CineLive Switcher',
      'Monitoring Terdistribusi HDMI Splitter'
    ],
    cocokUntuk: 'Wisuda Sekolah/Universitas, Event Instansi Pemerintah, Corporate Gathering, Produk Promosi.'
  }
];

export default function CatalogBooking({ inventory, onAddOrder }: CatalogBookingProps) {
  // Booking Form State
  const [namaKlien, setNamaKlien] = useState('');
  const [kontak, setKontak] = useState('');
  const [tanggalAcara, setTanggalAcara] = useState('');
  const [durasiHari, setDurasiHari] = useState(1);
  const [tipeAcara, setTipeAcara] = useState('');
  const [paketId, setPaketId] = useState(PACKAGES[0].id);
  const [paketNama, setPaketNama] = useState(PACKAGES[0].nama);
  const [totalBiaya, setTotalBiaya] = useState(PACKAGES[0].harga);
  const [lokasiAcara, setLokasiAcara] = useState('');
  const [kebutuhanKhusus, setKebutuhanKhusus] = useState('');
  const [peralatanTerpilih, setPeralatanTerpilih] = useState<{ id: string; nama: string; qty: number }[]>([]);
  
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // AI Recommendation State
  const [aiJenisAcara, setAiJenisAcara] = useState('Pernikahan / Wedding');
  const [aiDurasiJam, setAiDurasiJam] = useState(6);
  const [aiLokasiTipe, setAiLokasiTipe] = useState<'indoor' | 'outdoor'>('indoor');
  const [aiPerkiraanTamu, setAiPerkiraanTamu] = useState(250);
  const [aiBudgetMaks, setAiBudgetMaks] = useState(4000000);
  const [aiCatatan, setAiCatatan] = useState('');
  
  const [aiLoading, setAiLoading] = useState(false);
  const [recommendationResult, setRecommendationResult] = useState<AIRecommendationResponse | null>(null);

  // Handle select manual package
  const handlePaketChange = (pId: string) => {
    setPaketId(pId);
    if (pId === 'custom') {
      setPaketNama('Paket Custom Jasa BEB Production');
      setTotalBiaya(2000000); // default custom baseline
    } else {
      const selected = PACKAGES.find(p => p.id === pId);
      if (selected) {
        setPaketNama(selected.nama);
        setTotalBiaya(selected.harga);
      }
    }
  };

  // Run AI query via server proxy
  const handleRequestAIRecommendation = async () => {
    setAiLoading(true);
    setRecommendationResult(null);
    try {
      const response = await fetch('/api/ai-recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jenisAcara: aiJenisAcara,
          durasiJam: aiDurasiJam,
          lokasiTipe: aiLokasiTipe,
          perkiraanTamu: aiPerkiraanTamu,
          budgetMaks: aiBudgetMaks,
          catatanTambahan: aiCatatan
        })
      });

      if (!response.ok) {
        throw new Error('Gagal menghubungi asisten AI.');
      }

      const data = await response.json();
      setRecommendationResult(data);
    } catch (e: any) {
      console.error(e);
      alert('Gagal mendapatkan rekomendasi AI: ' + e?.message);
    } finally {
      setAiLoading(false);
    }
  };

  // Automatically load the AI recommendation directly into physical booking form inputs
  const applyAIRecommendationToForm = () => {
    if (!recommendationResult) return;
    setPaketId('custom-ai');
    setPaketNama(`[Rekomendasi AI] ${recommendationResult.paketRekomendasi}`);
    setTotalBiaya(recommendationResult.estimasiHarga);
    setTipeAcara(aiJenisAcara);
    
    // Auto populate kebutuhan khusus with gear details & summary
    const formattedNeed = `Sistem Rekomendasi AI Gemini:\n` +
      `- Alasan: ${recommendationResult.alasanRekomendasi}\n` +
      `- Tips Produksi: ${recommendationResult.tipsAcara}\n` +
      `- Alokasi Alat: ${recommendationResult.detailPeralatan.join(', ')}`;
    
    setKebutuhanKhusus(formattedNeed);
    
    // Parse selected equipment and try to map to existing inventory items if possible
    const tempPeralatan: { id: string; nama: string; qty: number }[] = [];
    recommendationResult.detailPeralatan.forEach(itemText => {
      // Find matches in inventory elements
      const matched = inventory.find(inv => 
        itemText.toLowerCase().includes(inv.nama.toLowerCase()) ||
        inv.nama.toLowerCase().includes(itemText.toLowerCase())
      );
      if (matched) {
        tempPeralatan.push({ id: matched.id, nama: matched.nama, qty: 1 });
      }
    });
    
    setPeralatanTerpilih(tempPeralatan);

    // Scroll client down to the booking form dynamically and smoothly
    const element = document.getElementById('formulir-pesan-target');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Submit booking order
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess(false);

    if (!namaKlien.trim() || !kontak.trim() || !tanggalAcara || !lokasiAcara.trim()) {
      setFormError('Sila isi semua data utama (Klien, Kontak, Tanggal, dan Lokasi Acara)');
      return;
    }

    setSubmittingOrder(true);
    const orderData: Partial<Order> = {
      namaKlien,
      kontak,
      tanggalAcara,
      durasiHari: Number(durasiHari),
      tipeAcara,
      paketId,
      paketNama,
      totalBiaya: Number(totalBiaya),
      lokasiAcara,
      kebutuhanKhusus,
      peralatanTerpilih
    };

    try {
      const isOk = await onAddOrder(orderData);
      if (isOk) {
        setFormSuccess(true);
        // reset form
        setNamaKlien('');
        setKontak('');
        setTanggalAcara('');
        setDurasiHari(1);
        setTipeAcara('');
        setKebutuhanKhusus('');
        setLokasiAcara('');
        setPeralatanTerpilih([]);
      } else {
        setFormError('Terjadi kesalahan pada backend server.');
      }
    } catch (err: any) {
      setFormError(err?.message || 'Gagal menyimpan pesanan.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  // Multi-select equipment list handler
  const toggleEquipmentAllocation = (id: string, nama: string) => {
    setPeralatanTerpilih(prev => {
      const exists = prev.find(p => p.id === id);
      if (exists) {
        return prev.filter(p => p.id !== id);
      } else {
        return [...prev, { id, nama, qty: 1 }];
      }
    });
  };

  return (
    <div className="space-y-8">
      
      {/* 1. LAYANAN PAKET STANDARD (CATALOG) */}
      <section className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-serif italic text-white flex items-center gap-2">
              <Video className="text-amber-505" size={20} />
              Katalog Layanan &amp; Paket Jasa BEB Production
            </h2>
            <p className="text-white/50 text-xs mt-1 font-sans">
              Daftar paket standard shooting dan streaming berkualitas tinggi sesuai dengan kebutuhan industri kreatif digital.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PACKAGES.map((pkg, idx) => (
            <motion.div 
              key={pkg.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="bg-[#111319] border border-white/10 hover:border-amber-500/30 rounded-sm p-6 shadow-sm flex flex-col justify-between transition-colors relative overflow-hidden"
            >
              {/* Decorative gold vertical bar */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
              
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-base font-serif italic font-bold text-white pr-2">{pkg.nama}</h3>
                    <span className="text-[9px] font-mono uppercase bg-white/5 text-amber-500 px-2 py-0.5 rounded-sm border border-white/5 tracking-wider">
                      ⏱️ {pkg.durasi}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-mono text-emerald-450 font-bold">
                      Rp {pkg.harga.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                <p className="text-white/60 text-xs text-justify leading-relaxed">
                  <span className="font-semibold text-white/85">Cocok untuk:</span> {pkg.cocokUntuk}
                </p>

                <div className="space-y-2 py-1">
                  <span className="text-[11px] font-semibold text-white/80 flex items-center gap-1.5 font-sans uppercase tracking-wider">
                    <Monitor size={11} className="text-white/30" /> Peralatan Alokasi:
                  </span>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 text-white/50 text-[10.5px] list-disc pl-4 leading-normal">
                    {pkg.fitur.map((f, fIdx) => (
                      <li key={fIdx}>{f}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center bg-black/5 -mx-6 -mb-6 p-6">
                <span className="text-[10px] font-medium text-amber-500 font-mono uppercase tracking-wider">
                  🎥 {pkg.kamera}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setPaketId(pkg.id);
                    setPaketNama(pkg.nama);
                    setTotalBiaya(pkg.harga);
                    // scroll to form
                    document.getElementById('formulir-pesan-target')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-black font-semibold rounded-sm text-xs transition-all uppercase tracking-wider font-mono shadow-sm"
                >
                  Pilih Paket
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 2. REKOMENDASI AI GENERATOR PANEL */}
      <section className="bg-[#111319] border border-white/10 rounded-sm p-6 shadow-sm relative overflow-hidden">
        {/* BG highlight glow effect */}
        <div className="absolute right-0 top-0 w-[300px] h-[300px] bg-amber-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="flex items-center gap-3 pb-3 border-b border-white/10">
          <div className="p-2 bg-amber-500 text-black rounded-sm shadow">
            <Sparkles size={16} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-serif italic text-white">Rekomendasi Paket Kreatif Berbasis AI</h3>
            <p className="text-white/50 text-xs mt-0.5">
              Masukkan rincian acara Anda. Model Google Gemini akan merancang formasi peralatan &amp; taksiran biaya paling efisien.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          
          {/* Form input data untuk AI */}
          <div className="lg:col-span-5 space-y-4">
            <h4 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest font-mono">1. Rincian Event Anda</h4>
            
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-white/50 font-semibold mb-1 font-mono">
                  Jenis Acara / Kebutuhan
                </label>
                <input
                  type="text"
                  value={aiJenisAcara}
                  onChange={(e) => setAiJenisAcara(e.target.value)}
                  placeholder="Misalnya: Live Pernikahan Wonogiri / Pembuatan Iklan UMKM"
                  className="w-full bg-black/40 border border-white/10 rounded-sm p-2 text-white text-xs focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/50 font-semibold mb-1 font-mono">
                    Durasi (Jam)
                  </label>
                  <input
                    type="number"
                    value={aiDurasiJam}
                    onChange={(e) => setAiDurasiJam(Number(e.target.value))}
                    min={1}
                    className="w-full bg-black/40 border border-white/10 rounded-sm p-2 text-white text-xs focus:outline-none focus:border-amber-500 [appearance:textfield]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/50 font-semibold mb-1 font-mono">
                    Tipe Area Lokasi
                  </label>
                  <select
                    value={aiLokasiTipe}
                    onChange={(e) => setAiLokasiTipe(e.target.value as 'indoor' | 'outdoor')}
                    className="w-full bg-black/40 border border-white/10 rounded-sm p-2 text-white text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="indoor" className="bg-[#111319]">Dalam Ruangan (Indoor)</option>
                    <option value="outdoor" className="bg-[#111319]">Luar Ruangan (Outdoor)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/50 font-semibold mb-1 font-mono">
                    Estimasi Tamu
                  </label>
                  <input
                    type="number"
                    value={aiPerkiraanTamu}
                    onChange={(e) => setAiPerkiraanTamu(Number(e.target.value))}
                    min={0}
                    className="w-full bg-black/40 border border-white/10 rounded-sm p-2 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-white/50 font-semibold mb-1 font-mono">
                    Budget Maksimal (Rp)
                  </label>
                  <input
                    type="number"
                    value={aiBudgetMaks}
                    onChange={(e) => setAiBudgetMaks(Number(e.target.value))}
                    step={100000}
                    min={1000000}
                    className="w-full bg-black/40 border border-white/10 rounded-sm p-2 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-white/50 font-semibold mb-1 font-mono">
                  Catatan khusus tambahan (opsional)
                </label>
                <textarea
                  value={aiCatatan}
                  onChange={(e) => setAiCatatan(e.target.value)}
                  rows={2}
                  placeholder="Butuh file mentahan cepat, butuh TV monitor tambahan..."
                  className="w-full bg-black/40 border border-white/10 rounded-sm p-2 text-white text-xs focus:outline-none focus:border-amber-500 resize-none transition-colors"
                />
              </div>

              <button
                type="button"
                disabled={aiLoading}
                onClick={handleRequestAIRecommendation}
                className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 disabled:bg-white/5 disabled:text-white/30 text-black rounded-sm text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow"
              >
                {aiLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-black/30 border-t-black"></div>
                    Mengkaji Formasi Skenario...
                  </>
                ) : (
                  <>
                    <Wand2 size={12} />
                    Kalkulasi Rekomendasi AI
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Kolom Kanan: Hasil Rekomendasi AI */}
          <div className="lg:col-span-7 bg-black/20 border border-white/10 rounded-sm p-5 flex flex-col justify-between min-h-[300px]">
            <AnimatePresence mode="wait">
              {!recommendationResult && !aiLoading ? (
                <div className="my-auto text-center space-y-2 py-8">
                  <Sparkles size={24} className="text-white/20 mx-auto" />
                  <p className="text-white/40 text-xs font-sans">
                    Hasil analisis penataan skenario produksi dan estimasi harga dari asisten kecerdasan buatan akan tampil di sini.
                  </p>
                  <p className="text-[10px] text-white/30 font-mono tracking-wide uppercase">
                    Terhubung live dengan database alat BEB Production
                  </p>
                </div>
              ) : aiLoading ? (
                <div className="my-auto text-center space-y-3 py-10">
                  <Flame size={24} className="text-amber-500 animate-bounce mx-auto" strokeWidth={1.5} />
                  <div className="space-y-1.5 select-none">
                    <p className="text-amber-500 text-xs font-mono uppercase tracking-wider animate-pulse">Menghubungi asisten google/genai...</p>
                    <p className="text-[10px] text-white/40 leading-relaxed font-sans">Mengkalkulasi model kamera Sony, switchers, dan kabel transmisi terbaik...</p>
                  </div>
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4 h-full flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-3 gap-2">
                      <div>
                        <span className="text-[8px] font-bold text-amber-500 tracking-widest uppercase bg-amber-500/10 px-2 py-0.5 rounded-sm border border-amber-500/20 font-mono">
                          Rekomendasi Paket Khusus
                        </span>
                        <h4 className="text-base font-serif italic text-white mt-2">
                          {recommendationResult.paketRekomendasi}
                        </h4>
                      </div>
                      <div className="text-left sm:text-right">
                        <span className="text-[9px] text-white/40 block uppercase font-mono tracking-wider">Est. Anggaran</span>
                        <span className="text-lg font-mono text-emerald-400 font-bold">
                          Rp {recommendationResult.estimasiHarga.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-white/40 font-mono">Alasan Analitis AI:</span>
                      <p className="text-white/70 text-xs leading-relaxed text-justify italic">
                        &ldquo;{recommendationResult.alasanRekomendasi}&rdquo;
                      </p>
                    </div>

                    <div className="bg-black/30 p-3 rounded-sm space-y-2 border border-white/5">
                      <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-white/60 block">🔧 Usulan Alokasi Alat:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {recommendationResult.detailPeralatan.map((gear, idx) => (
                          <span 
                            key={idx} 
                            className="bg-black/40 border border-white/10 text-white/80 text-[10px] px-2 py-0.5 rounded-sm font-mono"
                          >
                            {gear}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-amber-500 flex items-center gap-1 font-serif italic">
                        💡 Tips Penting Produksi (Lokasi {aiLokasiTipe === 'indoor' ? 'Dalam' : 'Luar'} Ruangan):
                      </span>
                      <p className="text-white/50 text-[11px] leading-relaxed">
                        {recommendationResult.tipsAcara}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest leading-none">
                      Powered by {'aiSource' in recommendationResult ? String(recommendationResult.aiSource) : 'Gemini AI'}
                    </span>
                    <button
                      type="button"
                      onClick={applyAIRecommendationToForm}
                      className="w-full sm:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-500 text-black font-semibold rounded-sm text-xs font-mono uppercase tracking-wider transition-colors shadow flex items-center justify-center gap-1"
                    >
                      <Sparkles size={11} />
                      Terapkan Rekomendasi
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </section>

      {/* 3. FORMULIR PEMESANAN JASA (BOOKING FORM) */}
      <section id="formulir-pesan-target" className="bg-[#111319] border border-white/10 rounded-sm p-6 shadow-sm">
        <h3 className="text-lg font-serif italic text-white pb-3 border-b border-white/10 flex items-center gap-2">
          <Send size={16} className="text-amber-500" />
          Formulir Pemesanan Layanan BEB Production
        </h3>

        <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          
          {/* Kolom Kiri: Detil Kontak & Acara */}
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 font-semibold mb-1">
                Nama Klien / Instansi / Event <span className="text-amber-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-white/30">
                  <User size={13} />
                </span>
                <input
                  type="text"
                  required
                  value={namaKlien}
                  onChange={(e) => setNamaKlien(e.target.value)}
                  placeholder="Contoh: Panitia Wisuda SMK 2 Wonogiri"
                  className="w-full bg-black/40 border border-white/10 rounded-sm p-2 pl-9 text-white text-xs focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 font-semibold mb-1">
                  Kontak (WhatsApp / HP) <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-white/30">
                    <Phone size={13} />
                  </span>
                  <input
                    type="text"
                    required
                    value={kontak}
                    onChange={(e) => setKontak(e.target.value)}
                    placeholder="Contoh: 08123xxx"
                    className="w-full bg-black/40 border border-white/10 rounded-sm p-2 pl-9 text-white text-xs focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 font-semibold mb-1">
                  Tipe Acara / Event
                </label>
                <input
                  type="text"
                  value={tipeAcara}
                  onChange={(e) => setTipeAcara(e.target.value)}
                  placeholder="Contoh: Pernikahan, Rapat, Seminar"
                  className="w-full bg-black/40 border border-white/10 rounded-sm p-2 text-white text-xs focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 font-semibold mb-1">
                  Tanggal Acara <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-white/30">
                    <Calendar size={13} />
                  </span>
                  <input
                    type="date"
                    required
                    value={tanggalAcara}
                    onChange={(e) => setTanggalAcara(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-sm p-2 pl-9 text-white text-xs focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 font-semibold mb-1">
                  Durasi Pekerjaan (Hari)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-white/30">
                    <Hourglass size={13} />
                  </span>
                  <input
                    type="number"
                    min={1}
                    value={durasiHari}
                    onChange={(e) => setDurasiHari(Number(e.target.value))}
                    className="w-full bg-black/40 border border-white/10 rounded-sm p-2 pl-9 text-white text-xs focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 font-semibold mb-1">
                Lokasi Lengkap Acara <span className="text-amber-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-white/30">
                  <MapPin size={13} />
                </span>
                <input
                  type="text"
                  required
                  value={lokasiAcara}
                  onChange={(e) => setLokasiAcara(e.target.value)}
                  placeholder="Gedung PGRI Wonogiri / Karangtengah Wonogiri"
                  className="w-full bg-black/40 border border-white/10 rounded-sm p-2 pl-9 text-white text-xs focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Jenis Paket, Biaya & Multi Select Alat */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 font-semibold mb-1">
                  Pilih Paket Layanan
                </label>
                <select
                  value={paketId}
                  onChange={(e) => handlePaketChange(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-sm p-2 text-white text-xs focus:outline-none focus:border-amber-500 [color-scheme:dark]"
                >
                  {PACKAGES.map(p => (
                    <option key={p.id} value={p.id} className="bg-[#111319]">{p.nama}</option>
                  ))}
                  <option value="custom" className="bg-[#111319]">Paket Custom Jasa Manual</option>
                  <option value="custom-ai" className="bg-[#111319]">Hasil Rekomendasi AI Gemini</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 font-semibold mb-1">
                  Nama Paket Tercatat <span className="text-amber-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={paketNama}
                  onChange={(e) => setPaketNama(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-sm p-2 text-white text-xs focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 font-semibold mb-1">
                Estimasi Total Biaya Jasa (Rp)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-white/40 font-mono text-xs">Rp</span>
                <input
                  type="number"
                  value={totalBiaya}
                  onChange={(e) => setTotalBiaya(Number(e.target.value))}
                  className="w-full bg-black/40 border border-white/10 rounded-sm p-2 pl-9 text-emerald-400 font-mono font-bold text-xs focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 font-semibold mb-1">
                Kebutuhan Khusus / Keterangan Tambahan / Log Alat AI
              </label>
              <textarea
                value={kebutuhanKhusus}
                onChange={(e) => setKebutuhanKhusus(e.target.value)}
                rows={3}
                placeholder="Deskripsikan kebutuhan streaming, layout monitor, atau detail lainnya..."
                className="w-full bg-black/40 border border-white/10 rounded-sm p-2 text-white text-xs focus:outline-none focus:border-amber-500 resize-none transition-colors"
              />
            </div>
          </div>

          {/* Kolom Bawah Lebar: Pilihan Alokasi Alat Fisik Terdaftar */}
          <div className="md:col-span-2 space-y-3 pt-2">
            <div>
              <span className="text-xs uppercase font-mono tracking-wider font-semibold text-white/80 block">
                Alokasi Peralatan Inventori Langsung BEB (Opsional - Multi Select):
              </span>
              <p className="text-white/40 text-[10px] mt-0.5">
                Pilih peralatan spesifik dari database inventori untuk dipesan / diamankan pada event ini.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-[150px] overflow-y-auto bg-black/30 p-3 rounded-sm border border-white/10 select-none">
              {inventory
                .filter(item => item.kondisi === 'Baik')
                .map((item) => {
                  const isSelected = peralatanTerpilih.some(p => p.id === item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleEquipmentAllocation(item.id, item.nama)}
                      className={`p-2 rounded-sm border cursor-pointer select-none text-[10px] font-sans flex items-center gap-1.5 transition-all ${
                        isSelected 
                          ? 'bg-amber-500/10 border-amber-500 text-amber-500 font-semibold' 
                          : 'bg-black/20 border-white/5 text-white/40 hover:border-white/20'
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        checked={isSelected} 
                        readOnly 
                        className="rounded-sm border-white/10 accent-amber-500 pointer-events-none" 
                      />
                      <span className="truncate">{item.nama}</span>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="md:col-span-2 pt-2 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Success & Error State Indicators */}
            <div className="w-full md:w-auto shrink">
              {formError && (
                <p className="text-rose-450 text-xs font-semibold font-mono uppercase tracking-wider">❌ Gagal: {formError}</p>
              )}
              {formSuccess && (
                <div className="text-emerald-400 text-xs font-semibold flex items-center gap-1 font-sans">
                  <span>✅ Pemesanan Berhasil Disimpan &amp; Notifikasi Telegram Dikirim!</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submittingOrder}
              className="w-full md:w-auto px-6 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:bg-white/5 disabled:text-white/30 text-black font-bold text-xs rounded-sm font-mono uppercase tracking-wider transition-all shadow flex items-center justify-center gap-1.5 shrink-0"
            >
              {submittingOrder ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-black/30 border-t-black"></div>
                  Mengirim Pesanan...
                </>
              ) : (
                'Kirim Pemesanan & Notifikasi Telegram Bot'
              )}
            </button>
          </div>

        </form>
      </section>

    </div>
  );
}
