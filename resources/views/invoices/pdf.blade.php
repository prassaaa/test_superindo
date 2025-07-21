<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice {{ $invoice->invoice_number }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #007bff;
            padding-bottom: 20px;
        }
        .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #007bff;
            margin-bottom: 5px;
        }
        .company-info {
            font-size: 12px;
            color: #666;
        }
        .invoice-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
        }
        .invoice-details, .customer-details {
            width: 48%;
        }
        .invoice-details h3, .customer-details h3 {
            margin-top: 0;
            color: #007bff;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
        }
        .info-row {
            margin-bottom: 8px;
        }
        .label {
            font-weight: bold;
            display: inline-block;
            width: 120px;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        .items-table th,
        .items-table td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        .items-table th {
            background-color: #007bff;
            color: white;
            font-weight: bold;
        }
        .items-table tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
        .total-section {
            float: right;
            width: 300px;
            margin-top: 20px;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #ddd;
        }
        .total-row.final {
            font-weight: bold;
            font-size: 18px;
            border-bottom: 2px solid #007bff;
            color: #007bff;
        }
        .notes {
            margin-top: 40px;
            clear: both;
        }
        .notes h4 {
            color: #007bff;
            margin-bottom: 10px;
        }
        .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 20px;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status-draft { background-color: #ffc107; color: #000; }
        .status-sent { background-color: #17a2b8; color: #fff; }
        .status-paid { background-color: #28a745; color: #fff; }
        .status-cancelled { background-color: #dc3545; color: #fff; }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">SUPERINDO</div>
        <div class="company-info">
            Sistem Manajemen Produksi & Penjualan<br>
            Email: info@superindo.com | Phone: (021) 123-4567
        </div>
    </div>

    <div class="invoice-info">
        <div class="invoice-details">
            <h3>Detail Invoice</h3>
            <div class="info-row">
                <span class="label">Nomor Invoice:</span>
                <strong>{{ $invoice->invoice_number }}</strong>
            </div>
            <div class="info-row">
                <span class="label">Tanggal Invoice:</span>
                {{ $invoice->invoice_date->format('d/m/Y') }}
            </div>
            @if($invoice->due_date)
            <div class="info-row">
                <span class="label">Jatuh Tempo:</span>
                {{ $invoice->due_date->format('d/m/Y') }}
            </div>
            @endif
            <div class="info-row">
                <span class="label">Status:</span>
                <span class="status-badge status-{{ $invoice->status }}">{{ ucfirst($invoice->status) }}</span>
            </div>
        </div>

        <div class="customer-details">
            <h3>Detail Customer</h3>
            <div class="info-row">
                <span class="label">Nama:</span>
                {{ $invoice->customer->name }}
            </div>
            @if($invoice->customer->email)
            <div class="info-row">
                <span class="label">Email:</span>
                {{ $invoice->customer->email }}
            </div>
            @endif
            @if($invoice->customer->phone)
            <div class="info-row">
                <span class="label">Telepon:</span>
                {{ $invoice->customer->phone }}
            </div>
            @endif
            @if($invoice->customer->address)
            <div class="info-row">
                <span class="label">Alamat:</span>
                {{ $invoice->customer->address }}
            </div>
            @endif
        </div>
    </div>

    <table class="items-table">
        <thead>
            <tr>
                <th>No</th>
                <th>Produk</th>
                <th>Kode</th>
                <th>Satuan</th>
                <th class="text-right">Qty</th>
                <th class="text-right">Harga Satuan</th>
                <th class="text-right">Total</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td class="text-center">1</td>
                <td>{{ $invoice->product->name }}</td>
                <td>{{ $invoice->product->code }}</td>
                <td>{{ $invoice->product->unit }}</td>
                <td class="text-right">{{ number_format(round($invoice->quantity), 0) }}</td>
                <td class="text-right">Rp {{ number_format(round($invoice->unit_price), 0, ',', '.') }}</td>
                <td class="text-right">Rp {{ number_format(round($invoice->total_price), 0, ',', '.') }}</td>
            </tr>
        </tbody>
    </table>

    <div class="total-section">
        <div class="total-row">
            <span>Subtotal:</span>
            <span>Rp {{ number_format(round($invoice->total_price), 0, ',', '.') }}</span>
        </div>
        <div class="total-row final">
            <span>TOTAL:</span>
            <span>Rp {{ number_format(round($invoice->total_price), 0, ',', '.') }}</span>
        </div>
    </div>

    @if($invoice->notes)
    <div class="notes">
        <h4>Catatan:</h4>
        <p>{{ $invoice->notes }}</p>
    </div>
    @endif

    <div class="footer">
        <p>Terima kasih atas kepercayaan Anda kepada SUPERINDO</p>
        <p>Invoice ini dibuat secara otomatis pada {{ now()->format('d/m/Y H:i:s') }}</p>
    </div>
</body>
</html>
