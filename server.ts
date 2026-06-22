/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { 
  EquipmentItem, 
  Order, 
  TelegramConfig, 
  NotifyLog, 
  AIRecommendationRequest,
  AIRecommendationResponse 
} from './src/types.js';

// Load environmental variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Data folder path
const DATA_DIR = path.join(process.cwd(), 'data');
const INVENTORY_FILE = path.join(DATA_DIR, 'inventory.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const TELEGRAM_FILE = path.join(DATA_DIR, 'telegram_config.json');
const LOGS_FILE = path.join(DATA_DIR, 'notify_logs.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Equipment Data based strictly on BEB Production's actual stock
const initialInventory: EquipmentItem[] = [
  // Kamera (3 kamera)
  { id: 'cam-1', nama: 'Sony A7C', kategori: 'Kamera', jumlahTotal: 1, jumlahTersedia: 1, kondisi: 'Baik', status: 'Tersedia', lokasiRak: 'A-1' },
  { id: 'cam-2', nama: 'Sony A6400', kategori: 'Kamera', jumlahTotal: 1, jumlahTersedia: 1, kondisi: 'Baik', status: 'Tersedia', lokasiRak: 'A-2' },
  { id: 'cam-3', nama: 'Sony A3600', kategori: 'Kamera', jumlahTotal: 1, jumlahTersedia: 1, kondisi: 'Perlu Perbaikan', status: 'Maintenance', lokasiRak: 'A-3' },
  
  // Stabilizer & Tripod
  { id: 'gimb-1', nama: 'Gimbal Feiyu Tech Scorp C', kategori: 'Stabilizer & Tripod', jumlahTotal: 1, jumlahTersedia: 1, kondisi: 'Baik', status: 'Tersedia', lokasiRak: 'B-1' },
  { id: 'trip-1', nama: 'Tripod 2 Meter Takara', kategori: 'Stabilizer & Tripod', jumlahTotal: 2, jumlahTersedia: 2, kondisi: 'Baik', status: 'Tersedia', lokasiRak: 'B-2' },
  { id: 'trip-2', nama: 'Tripod Takara Kecil', kategori: 'Stabilizer & Tripod', jumlahTotal: 1, jumlahTersedia: 1, kondisi: 'Baik', status: 'Tersedia', lokasiRak: 'B-3' },
  
  // Transmitter & Wireless
  { id: 'trans-1', nama: 'Transmitter Hollyland (Set)', kategori: 'Video Transmitter', jumlahTotal: 2, jumlahTersedia: 2, kondisi: 'Baik', status: 'Tersedia', lokasiRak: 'C-1' },
  { id: 'trans-st', nama: 'Stand Transmitter', kategori: 'Video Transmitter', jumlahTotal: 1, jumlahTersedia: 1, kondisi: 'Baik', status: 'Tersedia', lokasiRak: 'C-2' },
  
  // Switcher & Komputasi
  { id: 'switch-1', nama: 'Switcher Cinetreak CineLive V1', kategori: 'Komputasi & Switcher', jumlahTotal: 1, jumlahTersedia: 1, kondisi: 'Baik', status: 'Tersedia', lokasiRak: 'D-1' },
  { id: 'lap-1', nama: 'Laptop Lenovo IdeaPad Gaming 3', kategori: 'Komputasi & Switcher', jumlahTotal: 1, jumlahTersedia: 1, kondisi: 'Baik', status: 'Tersedia', lokasiRak: 'E-1' },
  { id: 'lap-2', nama: 'Laptop ThinkPad T14', kategori: 'Komputasi & Switcher', jumlahTotal: 1, jumlahTersedia: 1, kondisi: 'Baik', status: 'Tersedia', lokasiRak: 'E-2' },
  
  // Display
  { id: 'tv-1', nama: 'TV 50 Inch LED', kategori: 'Display & Monitor', jumlahTotal: 2, jumlahTersedia: 2, kondisi: 'Baik', status: 'Tersedia', lokasiRak: 'F-1' },
  { id: 'tv-2', nama: 'TV 32 Inch LED', kategori: 'Display & Monitor', jumlahTotal: 1, jumlahTersedia: 1, kondisi: 'Baik', status: 'Tersedia', lokasiRak: 'F-2' },
  { id: 'mon-1', nama: 'Monitor Acer 21 Inch', kategori: 'Display & Monitor', jumlahTotal: 1, jumlahTersedia: 1, kondisi: 'Baik', status: 'Tersedia', lokasiRak: 'F-3' },
  { id: 'tv-st', nama: 'Stand TV Custom', kategori: 'Display & Monitor', jumlahTotal: 3, jumlahTersedia: 3, kondisi: 'Baik', status: 'Tersedia', lokasiRak: 'F-4' },
  
  // Audio
  { id: 'aud-1', nama: 'Audio Interface DS Orca', kategori: 'Audio & Soundcard', jumlahTotal: 1, jumlahTersedia: 1, kondisi: 'Baik', status: 'Tersedia', lokasiRak: 'G-1' },
  { id: 'aud-2', nama: 'Soundcard Behringer UMC404HD', kategori: 'Audio & Soundcard', jumlahTotal: 1, jumlahTersedia: 1, kondisi: 'Baik', status: 'Tersedia', lokasiRak: 'G-2' },
  
  // Lighting
  { id: 'light-1', nama: 'Lampu Godox SL 60W', kategori: 'Lighting', jumlahTotal: 2, jumlahTersedia: 2, kondisi: 'Baik', status: 'Tersedia', lokasiRak: 'H-1' },
  { id: 'light-st', nama: 'Stand Lampu Godox', kategori: 'Lighting', jumlahTotal: 2, jumlahTersedia: 2, kondisi: 'Baik', status: 'Tersedia', lokasiRak: 'H-2' },
  
  // Drone
  { id: 'drone-1', nama: 'Drone DJI Mini 3', kategori: 'Udara (Drone)', jumlahTotal: 1, jumlahTersedia: 1, kondisi: 'Baik', status: 'Tersedia', lokasiRak: 'I-1' },
  
  // Storage
  { id: 'ssd-1', nama: 'SSD Eksternal 128GB', kategori: 'Storage', jumlahTotal: 1, jumlahTersedia: 1, kondisi: 'Baik', status: 'Tersedia', lokasiRak: 'J-1' },
  { id: 'ssd-2', nama: 'SSD Eksternal 256GB', kategori: 'Storage', jumlahTotal: 1, jumlahTersedia: 1, kondisi: 'Baik', status: 'Tersedia', lokasiRak: 'J-2' },
  { id: 'hdd-1', nama: 'Harddisk Eksternal 1 TB', kategori: 'Storage', jumlahTotal: 1, jumlahTersedia: 1, kondisi: 'Baik', status: 'Tersedia', lokasiRak: 'J-3' },
  { id: 'mem-1', nama: 'Memory Card Kamera High-Speed', kategori: 'Storage', jumlahTotal: 5, jumlahTersedia: 5, kondisi: 'Baik', status: 'Tersedia', lokasiRak: 'J-4' },
  
  // Jaringan, Komunikasi & Listrik
  { id: 'net-1', nama: 'Modem Wavlink Outdoor', kategori: 'Jaringan & Komunikasi', jumlahTotal: 1, jumlahTersedia: 1, kondisi: 'Baik', status: 'Tersedia', lokasiRak: 'K-1' },
  { id: 'net-2', nama: 'Modem Huawei Mifi', kategori: 'Jaringan & Komunikasi', jumlahTotal: 1, jumlahTersedia: 1, kondisi: 'Baik', status: 'Tersedia', lokasiRak: 'K-2' },
  { id: 'ht-1', nama: 'HT Handy Talky (Pasang)', kategori: 'Jaringan & Komunikasi', jumlahTotal: 2, jumlahTersedia: 2, kondisi: 'Baik', status: 'Tersedia', lokasiRak: 'K-3' },
  { id: 'ups-1', nama: 'UPS 1200VA Pro', kategori: 'Jaringan & Power', jumlahTotal: 1, jumlahTersedia: 1, kondisi: 'Baik', status: 'Tersedia', lokasiRak: 'L-1' },
  { id: 'pb-1', nama: 'Power Bank 10.000 mAh', kategori: 'Jaringan & Power', jumlahTotal: 2, jumlahTersedia: 2, kondisi: 'Baik', status: 'Tersedia', lokasiRak: 'L-2' },
  
  // Baterai & Charger
  { id: 'bat-64', nama: 'Baterai Sony NP-FW50 (A6400/A6300)', kategori: 'Baterai & Charger', jumlahTotal: 7, jumlahTersedia: 7, kondisi: 'Baik', status: 'Tersedia', lokasiRak: 'M-1' },
  { id: 'bat-a7', nama: 'Baterai Sony NP-FZ100 (A7C)', kategori: 'Baterai & Charger', jumlahTotal: 3, jumlahTersedia: 3, kondisi: 'Baik', status: 'Tersedia', lokasiRak: 'M-2' },
  { id: 'bat-npf', nama: 'Baterai NPF (untuk Hollyland/Monitor)', kategori: 'Baterai & Charger', jumlahTotal: 4, jumlahTersedia: 4, kondisi: 'Baik', status: 'Tersedia', lokasiRak: 'M-3' },
  { id: 'chg-1', nama: 'Charger Multi-Slot untuk Baterai', kategori: 'Baterai & Charger', jumlahTotal: 5, jumlahTersedia: 5, kondisi: 'Baik', status: 'Tersedia', lokasiRak: 'M-4' },
  
  // Kabel & Konektor
  { id: 'cab-20', nama: 'Kabel HDMI High-Speed 20 Meter', kategori: 'Kabel & Konektor', jumlahTotal: 2, jumlahTersedia: 2, kondisi: 'Baik', status: 'Tersedia', lokasiRak: 'N-1' },
  { id: 'cab-10', nama: 'Kabel HDMI High-Speed 10 Meter', kategori: 'Kabel & Konektor', jumlahTotal: 4, jumlahTersedia: 4, kondisi: 'Baik', status: 'Tersedia', lokasiRak: 'N-2' },
  { id: 'cab-5', nama: 'Kabel HDMI High-Speed 5 Meter', kategori: 'Kabel & Konektor', jumlahTotal: 1, jumlahTersedia: 1, kondisi: 'Baik', status: 'Tersedia', lokasiRak: 'N-3' },
  { id: 'cab-2', nama: 'Kabel HDMI 2 Meter', kategori: 'Kabel & Konektor', jumlahTotal: 2, jumlahTersedia: 2, kondisi: 'Baik', status: 'Tersedia', lokasiRak: 'N-4' },
  { id: 'cab-to-mic', nama: 'Kabel HDMI to Micro HDMI 1 Meter', kategori: 'Kabel & Konektor', jumlahTotal: 3, jumlahTersedia: 3, kondisi: 'Baik', status: 'Tersedia', lokasiRak: 'N-5' },
  { id: 'cab-mic-30', nama: 'Kabel HDMI to Micro HDMI 30 CM', kategori: 'Kabel & Konektor', jumlahTotal: 2, jumlahTersedia: 2, kondisi: 'Baik', status: 'Tersedia', lokasiRak: 'N-6' },
  { id: 'cab-snake', nama: 'Kabel Snake XLR/Canon to Aux 10 Meter (isi 4)', kategori: 'Kabel & Konektor', jumlahTotal: 1, jumlahTersedia: 1, kondisi: 'Baik', status: 'Tersedia', lokasiRak: 'N-7' },
  { id: 'cab-lan', nama: 'Kabel LAN Cat6 20 Meter', kategori: 'Kabel & Konektor', jumlahTotal: 1, jumlahTersedia: 1, kondisi: 'Baik', status: 'Tersedia', lokasiRak: 'N-8' },
  { id: 'con-hdmi', nama: 'Konektor HDMI Coupler / Adapter', kategori: 'Kabel & Konektor', jumlahTotal: 5, jumlahTersedia: 5, kondisi: 'Baik', status: 'Tersedia', lokasiRak: 'O-1' },
  { id: 'spl-hdmi', nama: 'HDMI Splitter 1x2', kategori: 'Kabel & Konektor', jumlahTotal: 2, jumlahTersedia: 2, kondisi: 'Baik', status: 'Tersedia', lokasiRak: 'O-2' },
  { id: 'cab-pw20', nama: 'Kabel Listrik / Roll 20 Meter', kategori: 'Kabel & Konektor', jumlahTotal: 2, jumlahTersedia: 2, kondisi: 'Baik', status: 'Tersedia', lokasiRak: 'P-1' },
  { id: 'cab-pw10', nama: 'Kabel Listrik / Roll 10 Meter', kategori: 'Kabel & Konektor', jumlahTotal: 3, jumlahTersedia: 3, kondisi: 'Baik', status: 'Tersedia', lokasiRak: 'P-2' },
  { id: 'cab-pw2', nama: 'Kabel Listrik 2 Meter', kategori: 'Kabel & Konektor', jumlahTotal: 1, jumlahTersedia: 1, kondisi: 'Baik', status: 'Tersedia', lokasiRak: 'P-3' },
  { id: 'stp-con', nama: 'Paket Stop Kontak isi 8 Colokan', kategori: 'Kabel & Konektor', jumlahTotal: 1, jumlahTersedia: 1, kondisi: 'Baik', status: 'Tersedia', lokasiRak: 'P-4' },
];

const initialOrders: Order[] = [
  {
    id: 'ord-1',
    namaKlien: 'Pernikahan Rahmat & Dinda',
    kontak: '081234567890',
    tanggalAcara: '2026-06-20',
    durasiHari: 1,
    tipeAcara: 'Wedding',
    paketId: 'pkt-3',
    paketNama: 'Wedding Documentation Suite & Live',
    kebutuhanKhusus: 'Butuh live streaming lancar, monitoring TV 50 inch untuk tamu.',
    lokasiAcara: 'Gedung PGRI Karangtengah, Wonogiri',
    totalBiaya: 3500000,
    status: 'Disetujui',
    createdAt: '2026-06-13T10:00:00Z',
    peralatanTerpilih: [
      { id: 'cam-1', nama: 'Sony A7C', qty: 1 },
      { id: 'cam-2', nama: 'Sony A6400', qty: 1 },
      { id: 'tv-1', nama: 'TV 50 Inch LED', qty: 1 },
      { id: 'trans-1', nama: 'Transmitter Hollyland (Set)', qty: 1 }
    ]
  },
  {
    id: 'ord-2',
    namaKlien: 'Wisuda SMK Negeri Wonogiri',
    kontak: '087799881122',
    tanggalAcara: '2026-07-05',
    durasiHari: 1,
    tipeAcara: 'Wisuda/Kelulusan',
    paketId: 'pkt-4',
    paketNama: 'Acara Wisuda / Instansi / Corporate Multi-Cam',
    kebutuhanKhusus: 'Butuh drone coverage untuk foto angkatan luar ruangan.',
    lokasiAcara: 'Pendopo Kabupaten Wonogiri',
    totalBiaya: 6000000,
    status: 'Pending',
    createdAt: '2026-06-14T14:30:00Z',
    peralatanTerpilih: [
      { id: 'cam-1', nama: 'Sony A7C', qty: 1 },
      { id: 'cam-2', nama: 'Sony A6400', qty: 1 },
      { id: 'drone-1', nama: 'Drone DJI Mini 3', qty: 1 },
      { id: 'tv-1', nama: 'TV 50 Inch LED', qty: 2 }
    ]
  }
];

const initialTelegram: TelegramConfig = {
  botToken: '',
  chatId: '',
  aktifkan: false
};

const initialLogs: NotifyLog[] = [
  {
    id: 'log-1',
    pesan: 'Sistem Informasi BEB Production berhasil diinisialisasi.',
    timestamp: new Date().toISOString(),
    tipe: 'Success',
    detailEndpoint: 'Local System Log'
  }
];

// Read/Write helper functions
const readData = <T>(filePath: string, fallback: T): T => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2));
    return fallback;
  }
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data) as T;
  } catch (error) {
    console.error(`Gagal membaca data dari ${filePath}:`, error);
    return fallback;
  }
};

const writeData = <T>(filePath: string, data: T): void => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Gagal menulis data ke ${filePath}:`, error);
  }
};

// Initial state load
let inventory = readData<EquipmentItem[]>(INVENTORY_FILE, initialInventory);
let orders = readData<Order[]>(ORDERS_FILE, initialOrders);
let telegramConfig = readData<TelegramConfig>(TELEGRAM_FILE, initialTelegram);
let notificationLogs = readData<NotifyLog[]>(LOGS_FILE, initialLogs);

// Initialize Gemini Client
let aiClient: GoogleGenAI | null = null;
const getGeminiClient = (): GoogleGenAI | null => {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
    }
  }
  return aiClient;
};

// Functions to send real telegram messages if config is set
async function triggerTelegramNotification(messageText: string) {
  const logId = 'log-' + Math.random().toString(36).substr(2, 9);
  const nowStr = new Date().toISOString();

  if (!telegramConfig.aktifkan || !telegramConfig.botToken || !telegramConfig.chatId) {
    const mockLog: NotifyLog = {
      id: logId,
      pesan: `[SIMULATED TELEGRAM LOG] ${messageText}`,
      timestamp: nowStr,
      tipe: 'Simulated',
      detailEndpoint: `Telegram bot is not activated or configured. Fill botToken and chatId under Integrations.`
    };
    notificationLogs.unshift(mockLog);
    writeData(LOGS_FILE, notificationLogs);
    return;
  }

  const endpoint = `https://api.telegram.org/bot${telegramConfig.botToken}/sendMessage`;
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: telegramConfig.chatId,
        text: `⚠️ *BEB PRODUCTION SYSTEM*\n\n${messageText}`,
        parse_mode: 'Markdown'
      })
    });

    if (response.ok) {
      const respData = await response.json();
      const successLog: NotifyLog = {
        id: logId,
        pesan: `Telegram Terkirim: "${messageText.substring(0, 30)}..."`,
        timestamp: nowStr,
        tipe: 'Success',
        detailEndpoint: `Telegram API: Sent to ChatID ${telegramConfig.chatId}`
      };
      notificationLogs.unshift(successLog);
      writeData(LOGS_FILE, notificationLogs);
    } else {
      const errText = await response.text();
      const failLog: NotifyLog = {
        id: logId,
        pesan: `Gagal mengirim Telegram! Status: ${response.status}`,
        timestamp: nowStr,
        tipe: 'Fail',
        detailEndpoint: `Telegram API Error: ${errText.substring(0, 100)}`
      };
      notificationLogs.unshift(failLog);
      writeData(LOGS_FILE, notificationLogs);
    }
  } catch (error: any) {
    const errorLog: NotifyLog = {
      id: logId,
      pesan: 'Network error ketika menghubungi Telegram API.',
      timestamp: nowStr,
      tipe: 'Fail',
      detailEndpoint: `Fetch Error: ${error?.message || error}`
    };
    notificationLogs.unshift(errorLog);
    writeData(LOGS_FILE, notificationLogs);
  }
}

// REST API Endpoints

// 1. INVENTORY ENDPOINTS
app.get('/api/inventory', (req, res) => {
  res.json(inventory);
});

app.post('/api/inventory', (req, res) => {
  const newItem = req.body as Partial<EquipmentItem>;
  if (!newItem.nama || !newItem.kategori) {
    return res.status(400).json({ error: 'Nama dan Kategori peralatan wajib diisi.' });
  }

  const item: EquipmentItem = {
    id: newItem.id || 'eq-' + Math.random().toString(36).substr(2, 9),
    nama: newItem.nama,
    kategori: newItem.kategori,
    jumlahTotal: Number(newItem.jumlahTotal) || 1,
    jumlahTersedia: Number(newItem.jumlahTotal) || 1,
    kondisi: newItem.kondisi || 'Baik',
    status: newItem.status || 'Tersedia',
    lokasiRak: newItem.lokasiRak || 'Umum'
  };

  inventory.push(item);
  writeData(INVENTORY_FILE, inventory);
  res.status(201).json(item);
});

app.put('/api/inventory/:id', (req, res) => {
  const { id } = req.params;
  const updatedItem = req.body as Partial<EquipmentItem>;
  
  const index = inventory.findIndex(item => item.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Peralatan tidak ditemukan' });
  }

  inventory[index] = {
    ...inventory[index],
    ...updatedItem,
    // Sanitize counts and states
    jumlahTotal: updatedItem.jumlahTotal !== undefined ? Number(updatedItem.jumlahTotal) : inventory[index].jumlahTotal,
    jumlahTersedia: updatedItem.jumlahTersedia !== undefined ? Number(updatedItem.jumlahTersedia) : inventory[index].jumlahTersedia,
    kondisi: updatedItem.kondisi || inventory[index].kondisi,
    status: updatedItem.status || inventory[index].status,
  };

  writeData(INVENTORY_FILE, inventory);
  res.json(inventory[index]);
});

app.delete('/api/inventory/:id', (req, res) => {
  const { id } = req.params;
  const index = inventory.findIndex(item => item.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Peralatan tidak ditemukan.' });
  }

  inventory.splice(index, 1);
  writeData(INVENTORY_FILE, inventory);
  res.json({ message: 'Peralatan berhasil dihapus.' });
});


// 2. BOOKING/ORDERS ENDPOINTS
app.get('/api/orders', (req, res) => {
  res.json(orders);
});

app.post('/api/orders', async (req, res) => {
  const newOrder = req.body as Partial<Order>;
  if (!newOrder.namaKlien || !newOrder.tanggalAcara || !newOrder.tipeAcara) {
    return res.status(400).json({ error: 'Nama klien, tanggal, dan tipe acara wajib diisi.' });
  }

  const order: Order = {
    id: 'ord-' + Math.random().toString(36).substr(2, 9),
    namaKlien: newOrder.namaKlien,
    kontak: newOrder.kontak || '',
    tanggalAcara: newOrder.tanggalAcara,
    durasiHari: Number(newOrder.durasiHari) || 1,
    tipeAcara: newOrder.tipeAcara,
    paketId: newOrder.paketId || 'custom',
    paketNama: newOrder.paketNama || 'Custom Package',
    kebutuhanKhusus: newOrder.kebutuhanKhusus || '',
    lokasiAcara: newOrder.lokasiAcara || 'Wonogiri',
    totalBiaya: Number(newOrder.totalBiaya) || 0,
    status: 'Pending',
    createdAt: new Date().toISOString(),
    peralatanTerpilih: newOrder.peralatanTerpilih || []
  };

  orders.push(order);
  writeData(ORDERS_FILE, orders);

  // Trigger Telegram Bot Notification
  const formattedMsg = `🔔 *PESANAN BARU MASUK!*\n\n` +
    `👤 *Klien:* ${order.namaKlien}\n` +
    `📞 *Kontak:* ${order.kontak}\n` +
    `📅 *Tanggal:* ${order.tanggalAcara} (${order.durasiHari} hari)\n` +
    `🎥 *Paket:* ${order.paketNama}\n` +
    `📍 *Lokasi:* ${order.lokasiAcara}\n` +
    `💰 *Estimasi Biaya:* Rp ${order.totalBiaya.toLocaleString('id-ID')}\n` +
    `💬 *Catatan:* ${order.kebutuhanKhusus || '-'}\n\n` +
    `Silakan tinjau pesanan ini di Dashboard Admin BEB Production.`;

  await triggerTelegramNotification(formattedMsg);

  res.status(201).json(order);
});

app.put('/api/orders/:id', async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body as Partial<Order>;

  const index = orders.findIndex(o => o.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Pesanan tidak ditemukan' });
  }

  const previousStatus = orders[index].status;
  orders[index] = {
    ...orders[index],
    ...updatedData,
    status: updatedData.status || orders[index].status
  };

  writeData(ORDERS_FILE, orders);

  // Send updates to Telegram if status changes
  if (updatedData.status && updatedData.status !== previousStatus) {
    const updateMsg = `🔄 *PERUBAHAN STATUS PESANAN*\n\n` +
      `👤 *Klien:* ${orders[index].namaKlien}\n` +
      `📅 *Tanggal:* ${orders[index].tanggalAcara}\n` +
      `📦 *Status:* Dari *${previousStatus}* menjadi *${orders[index].status}*\n` +
      `📍 *Lokasi:* ${orders[index].lokasiAcara}`;
    await triggerTelegramNotification(updateMsg);
  }

  res.json(orders[index]);
});

app.delete('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const index = orders.findIndex(o => o.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Pesanan tidak ditemukan.' });
  }

  orders.splice(index, 1);
  writeData(ORDERS_FILE, orders);
  res.json({ message: 'Pesanan berhasil dihapus.' });
});


// 3. INTEGRATIONS & CONFIG ENDPOINTS
app.get('/api/telegram-config', (req, res) => {
  res.json(telegramConfig);
});

app.post('/api/telegram-config', (req, res) => {
  const info = req.body as Partial<TelegramConfig>;
  telegramConfig = {
    botToken: info.botToken || '',
    chatId: info.chatId || '',
    aktifkan: info.aktifkan !== undefined ? !!info.aktifkan : telegramConfig.aktifkan
  };
  writeData(TELEGRAM_FILE, telegramConfig);
  res.json({ message: 'Konfigurasi Telegram berhasil disimpan.', config: telegramConfig });
});

app.get('/api/notify-logs', (req, res) => {
  res.json(notificationLogs);
});

app.post('/api/test-telegram', async (req, res) => {
  const { token, chatId, text } = req.body;
  if (!token || !chatId) {
    return res.status(400).json({ error: 'Token dan Chat ID wajib diisi untuk tes.' });
  }

  const testMsg = text || `Test Koneksi bot Telegram berhasil dari BEB Production System!`;
  const endpoint = `https://api.telegram.org/bot${token}/sendMessage`;
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: `🧪 *TES KONEKSI BOT*\n\n${testMsg}`,
        parse_mode: 'Markdown'
      })
    });

    if (response.ok) {
      res.json({ status: 'Success', message: 'Notifikasi tes berhasil dikirim ke Telegram!' });
    } else {
      const errText = await response.text();
      res.status(response.status).json({ status: 'Fail', message: `Gagal mengirim. API Telegram: ${errText}` });
    }
  } catch (error: any) {
    res.status(500).json({ status: 'Fail', error: error?.message || error });
  }
});


// 4. AI GEMINI RECOMMENDATION ENDPOINT
app.post('/api/ai-recommend', async (req, res) => {
  const requestBody = req.body as AIRecommendationRequest;
  const client = getGeminiClient();

  if (!client) {
    // If no key configured, we provide high-fidelity realistic recommendations fallback matching the exact schema
    // and let users know they can configure their key under settings. This keeps usability flawless.
    console.warn("Gemini API Key is not configured. Falling back to structured default fallback.");
    
    // Choose package based on type and budget
    let recommendedPkg = 'Paket Streaming Event Standard';
    let estimatedPrice = 1500000;
    let gear = ['1x Sony A7C', '1x Tripod 2 Meter Takara', '1x Audio Interface DS Orca', 'Laptop Lenovo IdeaPad', '1x Kabel HDMI 10 Meter'];
    let rationale = 'Berdasarkan jenis acara Anda, kami merekomendasikan Paket Standard karena seimbang untuk budget Anda. Layout diatur indoor secara efisien.';
    let tips = 'Pastikan untuk menyewa jaringan internet yang stabil di lokasi Wisata/Gedung atau membawa mifi cadangan.';

    if (requestBody.jenisAcara.toLowerCase().includes('wedding') || requestBody.budgetMaks >= 3000000) {
      recommendedPkg = 'Wedding Documentation Suite & Live';
      estimatedPrice = 3500000;
      gear = ['1x Sony A7C', '1x Sony A6400', '1x Gimbal Feiyu Tech', '2x Hollyland Transmitter', '1x Switcher CineLive V1', '1x TV 50 Inch LED', '2x Lampu Godox SL 60W', 'HT Communication'];
      rationale = 'Untuk acara Wedding, visual multi-camera sangat vital untuk menangkap momen sakral dari sudut estetis (gimbal) sekaligus live-screen monitoring.';
      tips = 'Siapkan pencahayaan tambahan (Godox SL 60W) agar wajah pengantin terlihat bercahaya tanpa bayangan keras.';
    }

    if (requestBody.perkiraanTamu > 300 || requestBody.budgetMaks >= 4500000) {
      recommendedPkg = 'Acara Wisuda / Instansi / Corporate Multi-Cam';
      estimatedPrice = 4500000;
      gear = ['1x Sony A7C', '1x Sony A6400', '1x Switcher Cinetreak Movie Line', '2x TV 50 Inch LED', '2x Hollyland Transmitter', '1x Drone DJI Mini 3 (outdoor footage)', 'Soundcard Behringer 404', 'HT Communication', '1x UPS 1200VA Power Protection'];
      rationale = 'Untuk acara berskala besar, setup multi-camera dengan video transmitter Hollyland nirkabel memberikan mobilitas operator. Drone memberikan panorama epik, dan TV monitoring diposisikan strategis bagi audiens.';
      tips = 'Gunakan UPS 1200VA untuk melindungi laptop switcher dan pemancar video dari drop tegangan listrik seketika.';
    }

    const fallbackResponse: AIRecommendationResponse = {
      paketRekomendasi: recommendedPkg,
      estimasiHarga: estimatedPrice,
      detailPeralatan: gear,
      alasanRekomendasi: rationale,
      tipsAcara: tips
    };

    return res.json({
      ...fallbackResponse,
      aiSource: 'Fallback Generator (API Key missing in Secrets panel)'
    });
  }

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Rekomendasikan paket produksi media, harga, peralatan spesifik, dan tips untuk acara berikut:
- Jenis Acara: ${requestBody.jenisAcara}
- Durasi Acara: ${requestBody.durasiJam} Jam
- Lokasi Tipe: ${requestBody.lokasiTipe}
- Perkiraan Tamu: ${requestBody.perkiraanTamu} orang
- Budget Maksimum: Rp ${requestBody.budgetMaks}
- Catatan Tambahan: ${requestBody.catatanTambahan || '-'}

Pilihan Peralatan BEB Production yang tersedia:
- Kamera: Sony A7C, Sony A6400, Sony A3600 (sedang maintenance)
- Stabilizer: Gimbal Feiyu Tech Scorp C
- Transmitter: Hollyland
- Display: TV 50 Inch LED, TV 32 Inch LED, Monitor Acer 21 Inch
- Komputasi & Switcher: Laptop Lenovo IdeaPad Gaming, Laptop ThinkPad T14, Switcher Cinetreak CineLive V1
- Audio: Audio Interface DS Orca, Soundcard Behringer UMC404HD
- Lighting: Lampu Godox SL 60W, Stand Lampu
- Drone: Drone DJI Mini 3 (hanya direkomendasikan jika outdoor & budget memadai)
- Pengamanan: UPS 1200VA, Power Bank

Hasilkan response berupa file JSON murni dengan format schema berikut:
{
  "paketRekomendasi": "Nama paket (misal: Paket Streaming Event Standard / Paket Streaming Multi-Cam Pro / Wedding Documentation / Paket Custom Mandiri)",
  "estimasiHarga": angka bulat Rupiah (sesuaikan kisaran antara 1500000 sampai 6000000 berdasarkan budget dan kelengkapan alat),
  "detailPeralatan": ["peralatan 1", "peralatan 2", "dan seterusnya"],
  "alasanRekomendasi": "Alasan detail mengapa memilih paket dan spesifikasi ini untuk klien",
  "tipsAcara": "Tips operasional teknis produksi khusus untuk acara tersebut (misal: penataan kabel, kestabilan modem, backup baterai, dll)"
}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            paketRekomendasi: { type: Type.STRING },
            estimasiHarga: { type: Type.INTEGER },
            detailPeralatan: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            alasanRekomendasi: { type: Type.STRING },
            tipsAcara: { type: Type.STRING }
          },
          required: ["paketRekomendasi", "estimasiHarga", "detailPeralatan", "alasanRekomendasi", "tipsAcara"]
        }
      }
    });

    const textContent = response.text;
    if (!textContent) {
      throw new Error('Response text dari Gemini API kosong.');
    }

    const aiResult = JSON.parse(textContent) as AIRecommendationResponse;
    res.json({
      ...aiResult,
      aiSource: 'Google Gemini 3.5 Flash Model'
    });
  } catch (error: any) {
    console.error("Gagal melakukan permintaan ke Gemini API:", error);
    res.status(500).json({ error: 'Gagal memproses rekomendasi AI: ' + (error?.message || error) });
  }
});


// 5. PRODUCTION vs DEVELOPMENT VITE INTEGRATION
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Vite Middleware Setup
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Static assets serving in Production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    
    // SPA routing fallback
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[BEB PRODUCTION SERVER] Running locally on port ${PORT}`);
  });
}

// Modify to bind standard 0.0.0.0 host for container routing
async function run() {
  await startServer();
}
run();
