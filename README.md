# CrowdRadar

CrowdRadar adalah aplikasi crowdsourcing untuk pelaporan **jalan rusak** dan **hotspot kejahatan** di Indonesia. Stack utama:

- **Frontend**: Next.js (App Router) + Tailwind + MapLibre
- **Backend**: Supabase (Postgres, Auth, Storage, Edge Functions)
- **AI Service**: FastAPI + YOLO (validasi foto)
- **Solana**: Anchor program (escrow & distribusi reward)

## Struktur Repo

- `frontend/` — Web app (Next.js)
- `supabase/` — Migrasi SQL + Edge Functions
- `yolo-service/` — FastAPI service untuk validasi AI
- `solana/` — Anchor program (on-chain)

## Prasyarat

- Node.js (disarankan **>= 20.9**)
- Docker (untuk Supabase local)
- Supabase CLI
- Python 3 (untuk `yolo-service/`)
- (Opsional) Rust + Anchor (untuk build/deploy program Solana)

## Setup Cepat (Local)

### 1) Jalankan Supabase (Local)

Di root project:

```bash
supabase start
```

- Studio: http://127.0.0.1:54323
- API: http://127.0.0.1:54321

Jika perlu stop/reset:

```bash
supabase stop
supabase stop --clean
```

### 2) Konfigurasi Frontend Env

Di `frontend/`, salin `.env.example` menjadi `.env.local` (atau pakai `.env` sesuai preferensi):

```bash
cd frontend
cp .env.example .env.local
```

Isi minimal:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<<anon key dari output `supabase status`>>
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_YOLO_SERVICE_URL=http://localhost:8000
```

Ambil `anon key` dari:

```bash
supabase status
```

> Jangan taruh `service_role key` di Frontend.

### 3) Jalankan YOLO Service (Opsional)

Jika ingin validasi AI jalan:

```bash
cd yolo-service
pip install -r requirements.txt
python main.py
```

Service default: http://localhost:8000

### 4) Jalankan Frontend

```bash
cd frontend
npm install
npm run dev
```

Buka: http://localhost:3000

## Scripts (Frontend)

Di `frontend/package.json`:

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Supabase Edge Functions

Folder: `supabase/functions/`

- `get-nonce` — nonce untuk wallet sign-in flow
- `wallet-auth` — verifikasi signature wallet dan issue session Supabase
- `auto-distribute` — distribusi reward (server-side)

Untuk development local, Edge Functions biasanya tersedia lewat Supabase local stack setelah `supabase start`.

## Solana Program

Folder: `solana/`

Berisi Anchor program untuk escrow & distribusi reward. Konfigurasi ada di `solana/Anchor.toml` dan env contoh di `solana/.env.example`.

## Catatan

- Jika marker laporan di map terlihat “hilang” saat zoom out, kemungkinan sedang ter-cluster (jika clustering diaktifkan pada GeoJSON source).
- Beberapa environment file contoh tersedia di:
  - `frontend/.env.example`
  - `supabase/.env.example`
  - `yolo-service/.env.example`
  - `solana/.env.example`

