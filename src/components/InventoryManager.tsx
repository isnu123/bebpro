/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { EquipmentItem } from '../types';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  SlidersHorizontal,
  Bookmark,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  FolderOpen,
  MapPin,
  RefreshCw,
  Archive
} from 'lucide-react';

interface InventoryManagerProps {
  inventory: EquipmentItem[];
  onAddItem: (item: Partial<EquipmentItem>) => Promise<boolean>;
  onUpdateItem: (id: string, updates: Partial<EquipmentItem>) => Promise<boolean>;
  onDeleteItem: (id: string) => Promise<boolean>;
}

export default function InventoryManager({ 
  inventory, 
  onAddItem, 
  onUpdateItem, 
  onDeleteItem 
}: InventoryManagerProps) {
  // Filters & State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('Semua');
  const [selectedKondisi, setSelectedKondisi] = useState('Semua');
  const [selectedStatus, setSelectedStatus] = useState('Semua');

  // Form states for creating & editing
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Payload structure
  const [nama, setNama] = useState('');
  const [kategori, setKategori] = useState('Kamera');
  const [jumlahTotal, setJumlahTotal] = useState(1);
  const [jumlahTersedia, setJumlahTersedia] = useState(1);
  const [kondisi, setKondisi] = useState<'Baik' | 'Perlu Perbaikan' | 'Rusak'>('Baik');
  const [status, setStatus] = useState<'Tersedia' | 'Digunakan' | 'Maintenance'>('Tersedia');
  const [lokasiRak, setLokasiRak] = useState('');

  const [savingLoading, setSavingLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  // Categories list
  const categories = useMemo(() => {
    const list = new Set(inventory.map(item => item.kategori));
    return ['Semua', ...Array.from(list)];
  }, [inventory]);

  // Filtered Inventory items
  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const matchSearch = item.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.lokasiRak || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedKategori === 'Semua' || item.kategori === selectedKategori;
      const matchCond = selectedKondisi === 'Semua' || item.kondisi === selectedKondisi;
      const matchStatus = selectedStatus === 'Semua' || item.status === selectedStatus;
      return matchSearch && matchCat && matchCond && matchStatus;
    });
  }, [inventory, searchQuery, selectedKategori, selectedKondisi, selectedStatus]);

  // Open creation panel
  const handleOpenAddForm = () => {
    setEditingId(null);
    setNama('');
    setKategori('Kamera');
    setJumlahTotal(1);
    setJumlahTersedia(1);
    setKondisi('Baik');
    setStatus('Tersedia');
    setLokasiRak('');
    setActionError('');
    setIsFormOpen(true);
  };

  // Open editing panel
  const handleOpenEditForm = (item: EquipmentItem) => {
    setEditingId(item.id);
    setNama(item.nama);
    setKategori(item.kategori);
    setJumlahTotal(item.jumlahTotal);
    setJumlahTersedia(item.jumlahTersedia);
    setKondisi(item.kondisi);
    setStatus(item.status);
    setLokasiRak(item.lokasiRak || '');
    setActionError('');
    setIsFormOpen(true);
  };

  // Save changes
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError('');
    if (!nama.trim()) {
      setActionError('Nama alat tidak boleh kosong.');
      return;
    }

    setSavingLoading(true);
    const payload: Partial<EquipmentItem> = {
      nama,
      kategori,
      jumlahTotal: Number(jumlahTotal),
      jumlahTersedia: Number(jumlahTersedia),
      kondisi,
      status,
      lokasiRak
    };

    try {
      let isSuccess = false;
      if (editingId) {
        isSuccess = await onUpdateItem(editingId, payload);
      } else {
        isSuccess = await onAddItem(payload);
      }

      if (isSuccess) {
        setIsFormOpen(false);
      } else {
        setActionError('Gagal menyimpan data ke database server.');
      }
    } catch (err: any) {
      setActionError(err?.message || 'Terjadi kesalahan sistem.');
    } finally {
      setSavingLoading(false);
    }
  };

  // Delete item handler
  const handleDelete = async (id: string, itemNama: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus "${itemNama}" dari inventori?`)) {
      try {
        await onDeleteItem(id);
      } catch (err) {
        alert('Gagal menghapus item dari server.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/10">
        <div>
          <h2 className="text-2xl font-serif italic text-white flex items-center gap-2">
            <Archive className="text-amber-500" size={20} />
            Manajemen Inventori Peralatan
          </h2>
          <p className="text-white/50 text-xs mt-1 font-sans">
            Tambah, sunting, cari barang, pantau lokasi penyimpanan rak, dan ubah kondisi fisik operasional alat produksi.
          </p>
        </div>
        <button
          onClick={handleOpenAddForm}
          className="self-start sm:self-center px-4 py-2 bg-amber-600 hover:bg-amber-500 text-black font-semibold font-mono uppercase tracking-wider text-[11px] rounded-sm transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Plus size={12} strokeWidth={3} />
          Ubah/Tambah Alat
        </button>
      </div>

      {/* Editor Overlay Panel */}
      {isFormOpen && (
        <div className="bg-[#111319] border border-white/10 rounded-sm p-6 shadow-md space-y-4 max-w-4xl animate-in fade-in duration-200">
          <h3 className="text-base font-serif italic text-white pb-2 border-b border-white/10">
            {editingId ? '📝 Edit Item Peralatan' : '➕ Tambah Peralatan Baru'}
          </h3>

          <form onSubmit={handleSaveItem} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 font-semibold mb-1">Nama Peralatan</label>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Misal: Sony A7C Mark V"
                className="w-full bg-black/40 border border-white/10 rounded-sm p-2 text-white text-xs focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 font-semibold mb-1">Kategori</label>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-sm p-2 text-white text-xs focus:outline-none focus:border-amber-500 [color-scheme:dark]"
              >
                <option value="Kamera" className="bg-[#111319]">Kamera</option>
                <option value="Stabilizer & Tripod" className="bg-[#111319]">Stabilizer &amp; Tripod</option>
                <option value="Video Transmitter" className="bg-[#111319]">Video Transmitter</option>
                <option value="Audio & Soundcard" className="bg-[#111319]">Audio &amp; Soundcard</option>
                <option value="Display & Monitor" className="bg-[#111319]">Display &amp; Monitor</option>
                <option value="Lighting" className="bg-[#111319]">Lighting</option>
                <option value="Udara (Drone)" className="bg-[#111319]">Udara (Drone)</option>
                <option value="Storage" className="bg-[#111319]">Storage</option>
                <option value="Jaringan & Komunikasi" className="bg-[#111319]">Jaringan &amp; Komunikasi</option>
                <option value="Jaringan & Power" className="bg-[#111319]">Jaringan &amp; Power</option>
                <option value="Baterai & Charger" className="bg-[#111319]">Baterai &amp; Charger</option>
                <option value="Kabel & Konektor" className="bg-[#111319]">Kabel &amp; Konektor</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 font-semibold mb-1">Lokasi Rak / Box</label>
              <input
                type="text"
                value={lokasiRak}
                onChange={(e) => setLokasiRak(e.target.value)}
                placeholder="Misal: Rak A-2, Box Kuning"
                className="w-full bg-black/40 border border-white/10 rounded-sm p-2 text-white text-xs focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 font-semibold mb-1">Total Unit</label>
                <input
                  type="number"
                  min={1}
                  value={jumlahTotal}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setJumlahTotal(val);
                    if (!editingId) setJumlahTersedia(val);
                  }}
                  className="w-full bg-black/40 border border-white/10 rounded-sm p-2 text-white text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 font-semibold mb-1">Tersedia di Rak</label>
                <input
                  type="number"
                  min={0}
                  max={jumlahTotal}
                  value={jumlahTersedia}
                  onChange={(e) => setJumlahTersedia(Number(e.target.value))}
                  className="w-full bg-black/40 border border-white/10 rounded-sm p-2 text-white text-xs focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 font-semibold mb-1">Kondisi Fisik</label>
              <select
                value={kondisi}
                onChange={(e) => setKondisi(e.target.value as any)}
                className="w-full bg-black/40 border border-white/10 rounded-sm p-2 text-white text-xs focus:outline-none [color-scheme:dark]"
              >
                <option value="Baik" className="bg-[#111319]">🟢 Baik (Siap)</option>
                <option value="Perlu Perbaikan" className="bg-[#111319]">🟡 Perlu Perbaikan Ringan</option>
                <option value="Rusak" className="bg-[#111319]">🔴 Rusak / Bermasalah</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono tracking-wider text-white/50 font-semibold mb-1">Status Operasional</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-black/40 border border-white/10 rounded-sm p-2 text-white text-xs focus:outline-none [color-scheme:dark]"
              >
                <option value="Tersedia" className="bg-[#111319]">🟢 Tersedia (Gudang)</option>
                <option value="Digunakan" className="bg-[#111319]">🟡 Sedang Digunakan Event</option>
                <option value="Maintenance" className="bg-[#111319]">🔴 Maintenance / Diservis</option>
              </select>
            </div>

            <div className="md:col-span-3 pt-3 border-t border-white/10 flex items-center justify-between gap-4">
              {actionError && <p className="text-xs text-rose-500 font-semibold font-mono uppercase tracking-wider">❌ Gagal: {actionError}</p>}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-black/20 hover:bg-black/40 text-white/60 border border-white/15 rounded-sm text-xs font-mono font-medium uppercase tracking-wider"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingLoading}
                  className="px-5 py-2 bg-amber-600 text-black rounded-sm hover:bg-amber-500 disabled:bg-white/5 disabled:text-white/30 font-bold text-xs font-mono uppercase tracking-wider transition-colors"
                >
                  {savingLoading ? 'Menyimpan...' : 'Simpan Data'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Advanced Filter Control Bar */}
      <div className="bg-[#111319] border border-white/10 rounded-sm p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute left-3 top-2.5 text-white/30">
            <Search size={14} />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari peralatan atau lokasi rak..."
            className="w-full bg-black/40 border border-white/10 rounded-sm p-2 pl-9 text-slate-300 text-xs focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        {/* Filter Category */}
        <div className="w-full md:w-48">
          <select
            value={selectedKategori}
            onChange={(e) => setSelectedKategori(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-sm p-2 text-slate-300 text-xs focus:outline-none focus:border-amber-500 [color-scheme:dark]"
          >
            <option value="Semua" className="bg-[#111319]">Kategori: Semua</option>
            {categories.filter(c => c !== 'Semua').map(cat => (
              <option key={cat} value={cat} className="bg-[#111319]">{cat}</option>
            ))}
          </select>
        </div>

        {/* Filter Kondisi */}
        <div className="w-full md:w-40">
          <select
            value={selectedKondisi}
            onChange={(e) => setSelectedKondisi(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-sm p-2 text-slate-300 text-xs focus:outline-none focus:border-amber-500 [color-scheme:dark]"
          >
            <option value="Semua" className="bg-[#111319]">Kondisi: Semua</option>
            <option value="Baik" className="bg-[#111319]">Kondisi: Baik</option>
            <option value="Perlu Perbaikan" className="bg-[#111319]">Kondisi: Perlu Perbaikan</option>
            <option value="Rusak" className="bg-[#111319]">Kondisi: Rusak</option>
          </select>
        </div>

        {/* Filter Status */}
        <div className="w-full md:w-36">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-sm p-2 text-slate-300 text-xs focus:outline-none focus:border-amber-500 [color-scheme:dark]"
          >
            <option value="Semua" className="bg-[#111319]">Status: Semua</option>
            <option value="Tersedia" className="bg-[#111319]">Status: Tersedia</option>
            <option value="Digunakan" className="bg-[#111319]">Status: Digunakan</option>
            <option value="Maintenance" className="bg-[#111319]">Status: Maintenance</option>
          </select>
        </div>
      </div>

      {/* Mobile-Friendly Cards/Grid for Items Catalog list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInventory.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-[#111319] border border-white/10 rounded-sm">
            <SlidersHorizontal size={24} className="text-white/20 mx-auto mb-2" />
            <p className="text-white/40 text-xs font-sans">Tidak ada peralatan yang cocok dengan filter pencarian.</p>
            <button 
              onClick={() => { setSearchQuery(''); setSelectedKategori('Semua'); setSelectedKondisi('Semua'); setSelectedStatus('Semua'); }}
              className="text-xs text-amber-500 hover:text-amber-400 font-semibold hover:underline mt-2 font-mono uppercase tracking-wider text-[10px]"
            >
              Reset Filter Pencarian
            </button>
          </div>
        ) : (
          filteredInventory.map((item) => (
            <div 
              key={item.id}
              className="bg-[#111319] border border-white/10 hover:border-amber-500/30 rounded-sm p-5 shadow-sm space-y-4 flex flex-col justify-between transition-colors duration-200"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest block font-mono">
                      {item.kategori}
                    </span>
                    <h4 className="text-sm font-sans font-medium text-white tracking-tight">{item.nama}</h4>
                  </div>
                  
                  {/* Kondisi pill */}
                  <span className={`px-2 py-0.5 rounded-sm text-[8px] font-medium flex items-center gap-1 uppercase font-mono tracking-wider ${
                    item.kondisi === 'Baik' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : item.kondisi === 'Perlu Perbaikan'
                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-455 border border-rose-500/20'
                  }`}>
                    {item.kondisi === 'Baik' && <CheckCircle size={8} />}
                    {item.kondisi === 'Perlu Perbaikan' && <HelpCircle size={8} />}
                    {item.kondisi === 'Rusak' && <AlertTriangle size={8} />}
                    {item.kondisi}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-black/30 p-2.5 rounded-sm border border-white/5 text-[11px] font-mono">
                  <div className="text-white/40">
                    Total Unit: <strong className="text-white/80">{item.jumlahTotal}</strong>
                  </div>
                  <div className="text-white/40 text-right">
                    Di Rak: <strong className="text-amber-500 font-bold">{item.jumlahTersedia}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-white/50 font-sans">
                  <MapPin size={11} className="text-white/30" />
                  <span>Rak: <strong className="text-white/85 font-mono text-[11px]">{item.lokasiRak || 'Gudang'}</strong></span>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded-sm text-[8px] uppercase font-mono tracking-wider ${
                  item.status === 'Tersedia' 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : item.status === 'Digunakan'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-rose-500/10 text-rose-455 border border-rose-500/20'
                }`}>
                  {item.status}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEditForm(item)}
                    className="p-1.5 bg-black/20 hover:bg-black/50 text-white/60 hover:text-white rounded-sm border border-white/10 hover:border-amber-500/30 transition-colors"
                    title="Ubah Detail"
                  >
                    <Edit3 size={11} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id, item.nama)}
                    className="p-1.5 bg-black/20 hover:bg-rose-950/20 text-white/45 hover:text-rose-400 rounded-sm border border-white/10 hover:border-rose-500/30 transition-colors"
                    title="Hapus"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}
