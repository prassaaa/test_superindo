# Superindo Management System

Sistem manajemen web untuk mengelola kedatangan barang, produksi, dan penjualan di Superindo.

## 🎯 Fitur Utama

### Master Data
- **Customer Management** - Kelola data customer dengan informasi lengkap
- **Material Management** - Kelola bahan baku dengan tracking stok
- **Product Management** - Kelola produk jadi dengan tracking stok

### Transaksi
- **Incoming (Kedatangan Barang)** - Catat kedatangan bahan baku dari customer
- **Production** - Proses produksi dari bahan baku menjadi produk jadi
- **Invoice (Penjualan)** - Buat invoice penjualan produk jadi ke customer

### Fitur Tambahan
- **Dashboard** dengan statistik real-time
- **Stock Management** otomatis
- **PDF Invoice Generation** 
- **Validasi bisnis** (stok, nomor invoice unik)
- **Search & Filter** di semua modul
- **Responsive Design**

## 🛠️ Tech Stack

### Backend
- **Laravel 12** - PHP Framework
- **MySQL** - Database
- **Laravel Inertia** - Server-side rendering
- **DomPDF** - PDF generation

### Frontend
- **React 19** - UI Framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - Component library
- **Lucide React** - Icons
- **Axios** - HTTP client

## 📦 Installation

### Prerequisites
- PHP 8.2+
- Node.js 18+
- MySQL 8.0+
- Composer

### Setup Steps

1. **Clone Repository**
```bash
git clone <repository-url>
cd superindo
```

2. **Install PHP Dependencies**
```bash
composer install
```

3. **Install Node Dependencies**
```bash
npm install
```

4. **Environment Setup**
```bash
cp .env.example .env
php artisan key:generate
```

5. **Database Configuration**
Edit `.env` file:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=superindo
DB_USERNAME=root
DB_PASSWORD=
```

6. **Run Migrations & Seed Data**
```bash
# Run migrations and seed all data (recommended)
php artisan migrate --seed

# Or run migrations and seed separately
php artisan migrate
php artisan db:seed
```

7. **Start Development Servers**

Terminal 1 (Laravel):
```bash
php artisan serve
```

Terminal 2 (Vite):
```bash
npm run dev
```

8. **Access Application**
Open browser: `http://localhost:8000`

## 📊 Database Schema

### Tables
- `customers` - Data customer
- `materials` - Data bahan baku
- `products` - Data produk jadi
- `incoming` - Transaksi kedatangan barang
- `productions` - Transaksi produksi
- `invoices` - Transaksi penjualan

### Relationships
- Customer → Incoming (1:N)
- Customer → Invoice (1:N)
- Material → Incoming (1:N)
- Material → Production (1:N)
- Product → Production (1:N)
- Product → Invoice (1:N)

## 🔄 Business Logic

### Stock Management
1. **Incoming** → Menambah stok bahan baku
2. **Production** → Mengurangi stok bahan baku, menambah stok produk jadi
3. **Invoice** → Mengurangi stok produk jadi

### Validations
- ✅ Tidak bisa produksi jika stok bahan baku tidak cukup
- ✅ Tidak bisa buat invoice jika stok produk jadi tidak cukup
- ✅ Nomor invoice harus unik (auto-generated)
- ✅ Validasi form di client dan server side

## 🎨 UI Features

### Dashboard
- Statistik real-time (customers, materials, products)
- Aktivitas hari ini (incoming, production, invoice)
- Alert stok rendah
- Ringkasan finansial
- Recent activities

### CRUD Operations
- **Create** - Form untuk tambah data baru
- **Read** - List dengan search dan filter
- **Update** - Edit data existing
- **Delete** - Hapus data dengan konfirmasi

### Additional Features
- Search functionality di semua modul
- Status management untuk invoice
- PDF download untuk invoice
- Responsive design untuk mobile
- Loading states dan error handling

## 📱 API Endpoints

### Master Data
```
GET    /api/v1/customers
POST   /api/v1/customers
GET    /api/v1/customers/{id}
PUT    /api/v1/customers/{id}
DELETE /api/v1/customers/{id}

GET    /api/v1/materials
POST   /api/v1/materials
GET    /api/v1/materials/{id}
PUT    /api/v1/materials/{id}
DELETE /api/v1/materials/{id}

GET    /api/v1/products
POST   /api/v1/products
GET    /api/v1/products/{id}
PUT    /api/v1/products/{id}
DELETE /api/v1/products/{id}
```

### Transactions
```
GET    /api/v1/incoming
POST   /api/v1/incoming
GET    /api/v1/incoming/{id}
PUT    /api/v1/incoming/{id}
DELETE /api/v1/incoming/{id}

GET    /api/v1/productions
POST   /api/v1/productions
GET    /api/v1/productions/{id}
PUT    /api/v1/productions/{id}
DELETE /api/v1/productions/{id}

GET    /api/v1/invoices
POST   /api/v1/invoices
GET    /api/v1/invoices/{id}
PUT    /api/v1/invoices/{id}
DELETE /api/v1/invoices/{id}
GET    /api/v1/invoices/{id}/pdf
PATCH  /api/v1/invoices/{id}/status
```

### Dashboard
```
GET /api/v1/dashboard/stats
GET /api/v1/reports/stock
GET /api/v1/activities/recent
```

## 🚀 Production Deployment

1. **Build Assets**
```bash
npm run build
```

2. **Optimize Laravel**
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

3. **Set Production Environment**
```env
APP_ENV=production
APP_DEBUG=false
```

## 📝 Sample Data

Sistem sudah dilengkapi dengan sample data:
- 3 Customers (PT Epindo Jaya, CV Maju Bersama, PT Sukses Mandiri)
- 4 Materials (Tepung Terigu, Gula Pasir, Minyak Kelapa Sawit, Telur Ayam)
- 4 Products (Roti Tawar, Kue Donat, Biskuit Coklat, Kue Kering)
