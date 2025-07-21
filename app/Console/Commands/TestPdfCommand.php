<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Invoice;
use Barryvdh\DomPDF\Facade\Pdf;

class TestPdfCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:pdf';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test PDF generation for invoices';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $invoice = Invoice::with(['customer', 'product'])->first();

        if (!$invoice) {
            $this->error('No invoices found in database');
            return 1;
        }

        $this->info("Testing PDF generation for invoice: {$invoice->invoice_number}");

        try {
            $pdf = Pdf::loadView('invoices.pdf', compact('invoice'));
            $filename = storage_path("app/test-invoice-{$invoice->invoice_number}.pdf");
            $pdf->save($filename);

            $this->info("PDF generated successfully: {$filename}");
            $this->info("File size: " . number_format(filesize($filename) / 1024, 2) . " KB");

            return 0;
        } catch (\Exception $e) {
            $this->error("Failed to generate PDF: " . $e->getMessage());
            return 1;
        }
    }
}
