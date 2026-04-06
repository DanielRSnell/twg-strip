<?php

namespace App\Console\Commands;

use App\Models\Applicant;
use Carbon\Carbon;
use Illuminate\Console\Command;

class ImportAttendedApplicants extends Command
{
    protected $signature = 'applicants:import-attended {file : Path to the CSV file}';
    protected $description = 'Import attended interview applicants from CSV without triggering emails';

    public function handle(): int
    {
        $file = $this->argument('file');

        if (!file_exists($file)) {
            $this->error("File not found: {$file}");
            return 1;
        }

        $handle = fopen($file, 'r');
        $header = fgetcsv($handle);

        $imported = 0;
        $skipped = 0;
        $updated = 0;

        while (($row = fgetcsv($handle)) !== false) {
            $data = array_combine($header, $row);

            $email = strtolower(trim($data['email']));
            $firstName = trim($data['first_name']);
            $attendedDate = Carbon::parse($data['Attended Date']);

            $existing = Applicant::where('email', $email)
                ->where('client', 'watts-for-workers')
                ->first();

            if ($existing && $existing->status === 'completed') {
                $skipped++;
                continue;
            }

            if ($existing) {
                $existing->update([
                    'first_name' => $existing->first_name ?: $firstName,
                    'status' => 'completed',
                    'completed_at' => $attendedDate,
                ]);
                $updated++;
            } else {
                Applicant::create([
                    'client' => 'watts-for-workers',
                    'email' => $email,
                    'first_name' => $firstName,
                    'status' => 'completed',
                    'completed_at' => $attendedDate,
                ]);
                $imported++;
            }
        }

        fclose($handle);

        $this->info("Done. Imported: {$imported}, Updated: {$updated}, Skipped (already completed): {$skipped}");

        return 0;
    }
}
