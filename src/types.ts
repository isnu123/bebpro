/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface EquipmentItem {
  id: string;
  nama: string;
  kategori: string;
  jumlahTotal: number;
  jumlahTersedia: number;
  kondisi: 'Baik' | 'Perlu Perbaikan' | 'Rusak';
  status: 'Tersedia' | 'Digunakan' | 'Maintenance';
  lokasiRak?: string;
}

export interface Order {
  id: string;
  namaKlien: string;
  kontak: string; // WhatsApp or Email/Phone
  tanggalAcara: string;
  durasiHari: number;
  tipeAcara: string;
  paketId: string;
  paketNama: string;
  kebutuhanKhusus?: string;
  lokasiAcara: string;
  totalBiaya: number;
  status: 'Pending' | 'Disetujui' | 'Selesai' | 'Dibatalkan';
  createdAt: string;
  peralatanTerpilih?: { id: string; nama: string; qty: number }[];
}

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  aktifkan: boolean;
}

export interface NotifyLog {
  id: string;
  pesan: string;
  timestamp: string;
  tipe: 'Success' | 'Fail' | 'Simulated';
  detailEndpoint?: string;
}

export interface AIRecommendationRequest {
  jenisAcara: string;
  durasiJam: number;
  lokasiTipe: 'indoor' | 'outdoor';
  perkiraanTamu: number;
  budgetMaks: number;
  catatanTambahan?: string;
}

export interface AIRecommendationResponse {
  paketRekomendasi: string;
  estimasiHarga: number;
  detailPeralatan: string[];
  alasanRekomendasi: string;
  tipsAcara: string;
}
