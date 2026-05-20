# MIRA FEB Web Dashboard 🖥️

Frontend Web Dashboard untuk **MIRA FEB** (Media Informasi dan Relasi Anda - Fakultas Ekonomi dan Bisnis) Telkom University. Aplikasi web modern ini berfungsi sebagai pusat kendali (*command center*) terpadu untuk kebutuhan manajemen keluhan mahasiswa, pengawasan kontrak kinerja unit, kalender agenda terintegrasi, notulensi rapat, dan pengaturan data master civitas akademika.

Aplikasi ini dibangun menggunakan **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, dan **shadcn/ui** dengan fokus pada performa tinggi, layout responsif yang menawan, serta penulisan kode yang modular.

---

## 🌟 Features

Dashboard MIRA FEB menyediakan antarmuka interaktif yang disesuaikan berdasarkan wewenang Role masing-masing pengguna:

| Modul | Fitur Utama Frontend |
| :--- | :--- |
| **📊 Admin Dashboard** | Panel ringkasan data statistik dengan chart interaktif (**Recharts**), grafik tren pengaduan, dan log aktivitas real-time. |
| **🎫 Halo Dekan Hub** | * **Mahasiswa**: Form pengaduan dinamis dilengkapi area *drag-and-drop* berkas lampiran (**react-dropzone**).<br>* **Admin**: Panel sortir (*triage*) cepat.<br>* **Dekan**: Panel disposisi unit & persetujuan tindak lanjut.<br>* **Unit Kerja**: Panel upload bukti pengerjaan fisik berkas pendukung. |
| **🎯 Kontrak Kinerja (KM)** | Grid interaktif pengisian realisasi indikator kinerja triwulan (TW1 s.d TW4) unit dengan fitur sortir, filter kategori, serta drag-and-drop reordering. |
| **📅 Kalender & Monitoring** | Kalender kegiatan komprehensif (**FullCalendar**) yang menampilkan agenda ruangan & pejabat secara visual, dilengkapi notifikasi alert bentrok jadwal. |
| **👥 User Directory** | Manajemen user multi-role dengan transisi tampilan Grid/Table serta integrasi relasi penanggung jawab unit (*Supervisor-Subordinate hierarchy*). |
| **📝 Notulensi Rapat** | Form penciptaan rapat modular transaksional dengan input sub-agenda terintegrasi serta pemetaan penugasan *action items* kepada PIC. |

---

## 🛠️ Tech Stack

* **Framework**: [Next.js v16 (App Router)](https://nextjs.org/) & [React v19](https://react.dev/)
* **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
* **Primitives**: [Radix UI](https://www.radix-ui.com/) (Dialog, Dropdown, Select, Tabs, etc.)
* **Animations**: [Motion](https://motion.dev/) (Framer Motion v12) & [Tailwind Animate](https://github.com/jamiebuilds/tailwindcss-animate)
* **Visualization**: [Recharts](https://recharts.org/) & [FullCalendar v6](https://fullcalendar.io/)
* **Form & Validation**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
* **HTTP Client**: [Axios](https://axios-http.com/)

---

## 📥 Installation

Pastikan Anda telah menginstal [Bun](https://bun.sh) sebagai package manager.

1. **Clone Repository**
   ```bash
   git clone https://github.com/ahmadsidikrofi/feb-wa-dashboard.git
   cd feb-wa-dashboard
   ```

2. **Instal Dependensi**
   ```bash
   bun install
   ```

3. **Konfigurasi Environment**
   Buat file `.env` di direktori root dan sesuaikan variabel env (lihat detail di bawah).

---

## 🔑 Environment Variables

Sesuaikan konfigurasi environment aplikasi di file `.env`:

```env
# URL Gateway ke Backend Express.js
NEXT_PUBLIC_API_URL="http://localhost:3001/api"

# Google Client ID untuk login Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
```

---

## 🚀 Running the Project

Menjalankan server development Next.js dengan compiler **Turbopack** (kecepatan build instan):

```bash
bun run dev
```

Aplikasi web dashboard akan aktif dan dapat diakses di `http://localhost:3000`.

---

## 📁 Folder Structure

Proyek ini menerapkan struktur folder Next.js modular yang terorganisir dengan baik di dalam direktori `src/`:

```bash
src/
├── app/                  # Next.js App Router (Layouts, Pages, Global Styles)
│   ├── (auth)/           # Route Group untuk Login & Otentikasi
│   ├── dashboard/        # Halaman-halaman panel dashboard utama
│   └── page.js           # Root Entry Page
├── components/           # UI Components
│   ├── ui/               # Base shadcn/ui primitives (Button, Input, dll)
│   ├── Layout/           # Sidebar, Navbar, dan MainWrapper Dashboard
│   └── [FeatureName]/    # Reusable widgets per fitur (misal: ContractManagement)
├── context/              # React Context (AuthContext untuk session, ThemeContext)
├── hooks/                # Custom React Hooks (useAuth, useClickOutside)
└── lib/                  # Library configuration (Axios client setup, `cn` utils)
```

---

## 🔌 API Integration

Frontend berkomunikasi penuh dengan MIRA FEB Backend API melalui standardisasi pertukaran data JSON:

* **Axios Instance**: Seluruh request dipusatkan di `src/lib/api.js` yang terkonfigurasi dengan `withCredentials: true` untuk memfasilitasi pertukaran otentikasi JWT berbasis cookie HttpOnly secara aman.
* **Service Layer**: Menggunakan pola abstraksi clean code di mana pemanggilan API dipisahkan dari interaksi UI, biasanya dikemas dalam custom hooks atau fungsi utilitas khusus.
* **Ngrok Bypass Warning**: Saat tahap development lokal menggunakan ngrok tunnel, Axios dikonfigurasi mengirim header `ngrok-skip-browser-warning: true` untuk melewati halaman peringatan ngrok.

---

## 🧠 State Management

Pendekatan manajemen state diatur berdasarkan tipe data dan siklus hidup state untuk performa rendering optimal:

1. **Server State**: Manajemen data fetching dari server ditangani dengan efisien melalui kombinasi Axios, custom React Hooks, serta memanfaatkan fitur transisi bawaan React (`useTransition`) untuk menjaga kestabilan transisi UI saat loading.
2. **Global State**: Menggunakan **React Context API** (`AuthContext`) untuk menyimpan informasi user yang sedang login, hak akses *role*, status tautan Google, serta konfigurasi tema global (*Dark Mode* / *Light Mode*).
3. **Form State**: Dikelola secara modular dengan **React Hook Form** untuk performa ketik yang cepat (*uncontrolled inputs*), didekorasi dengan validator schema **Zod** untuk validasi tipe data formulir input.

---

## 🎨 UI Conventions

Guna menjaga konsistensi visual dan pengalaman pengguna, ikuti pedoman UI berikut:

* **shadcn/ui & Tailwind CSS**: Selalu gunakan komponen dasar dari folder `src/components/ui/` dan lakukan kustomisasi tampilan melalui utility classes Tailwind. Hindari penulisan nilai CSS arbitrary langsung jika variabel tema tersedia di konfigurasi Tailwind v4.
* **Responsive Layout**: Desain wajib menganut prinsip *mobile-first* (fleksibel di layar mobile, tablet, hingga resolusi ultra-wide desktop). Gunakan prefix breakpoint standar Tailwind (`sm:`, `md:`, `lg:`, `xl:`).
* **Modal & Drawers (Vaul)**: Untuk form berskala besar atau interaksi detail di mobile, gunakan komponen *bottom-drawer* berbasis **Vaul** untuk interaksi yang lebih ergonomis, dan gunakan *Radix Dialog* standar di layar desktop.
* **Feedback Alerts**: Gunakan toast notifications dari **Sonner** (`toast.success()`, `toast.error()`) untuk memberikan umpan balik instan yang bersih pasca interaksi API.

---

## 📜 Available Scripts

Perintah pengerjaan yang tersedia di proyek `feb-wa-dashboard`:

| Perintah | Deskripsi |
| :--- | :--- |
| `bun run dev` | Menjalankan server development Next.js dengan compiler **Turbopack**. |
| `bun run build` | Melakukan kompilasi optimasi kode untuk rilisan produksi. |
| `bun run start` | Menjalankan aplikasi Next.js produksi yang telah di-build sebelumnya. |
| `bun run lint` | Menjalankan ESLint untuk mengecek standar kebersihan sintaksis kode. |

---

## 🚀 Deployment

Dashboard frontend Next.js ini paling optimal dideploy ke platform **Vercel**:

1. Hubungkan repository GitHub Anda ke dashboard Vercel.
2. Vercel akan otomatis mengenali proyek sebagai Next.js.
3. Masukkan `NEXT_PUBLIC_API_URL` dan `NEXT_PUBLIC_GOOGLE_CLIENT_ID` pada kolom Environment Variables di Vercel.
4. Klik **Deploy** dan verifikasi status build hingga selesai.

---

## 📝 Notes

* **Google Login Whitelist**: Pastikan Anda telah mendaftarkan URL produksi Vercel Anda di dalam tab *Authorized JavaScript Origins* pada **Google Cloud Console** agar Google OAuth login tidak memicu eror asal muasal domain (*CORS origin error*).
* **Turbopack Warning**: Jika terjadi masalah ketidakcocokan library pihak ketiga tertentu saat development, Anda dapat mematikan turbopack sementara dengan mengubah script dev menjadi `next dev`.

---
*Dibuat dengan 💻 dan ☕ oleh tim pengembang MIRA Fakultas Ekonomi & Bisnis Telkom University.*
