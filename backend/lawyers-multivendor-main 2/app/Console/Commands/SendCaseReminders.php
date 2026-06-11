<?php

namespace App\Console\Commands;

use App\Models\LegalCase;
use App\Models\CourtSession;
use App\Notifications\CaseReminderNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class SendCaseReminders extends Command
{
    protected $signature   = 'cases:send-reminders';
    protected $description = 'يبعت إيميل للمحامي قبل ميعاد القضية والجلسة بيوم';

    public function handle(): void
    {
        $tomorrow = now()->addDay()->toDateString();

        // ======= تذكير القضايا =======
        $cases = LegalCase::with('lawyer')
            ->whereDate('date', $tomorrow)
            ->get();

        if ($cases->isEmpty()) {
            $this->info('مفيش قضايا بكره.');
        } else {
            foreach ($cases as $case) {
                $lawyer = $case->lawyer;
                if ($lawyer && $lawyer->email) {
                    $lawyer->notify(new CaseReminderNotification($case));
                    $this->info("✅ قضية - المحامي: {$lawyer->name} - قضية: {$case->case_number}");
                } else {
                    $this->warn("⚠️ القضية {$case->case_number} مفيش محامي أو إيميل.");
                }
            }
        }

        // ======= تذكير الجلسات =======
        $sessions = CourtSession::with(['lawyer', 'legalCase'])
            ->whereDate('date', $tomorrow)
            ->get();

        if ($sessions->isEmpty()) {
            $this->info('مفيش جلسات بكره.');
        } else {
            foreach ($sessions as $session) {
                if ($session->lawyer?->email) {
                    Mail::send([], [], function ($message) use ($session) {
                        $message->to($session->lawyer->email)
                            ->subject('تذكير: جلسة غداً - ' . $session->legalCase?->case_number)
                            ->html("
                                <h2>مرحباً {$session->lawyer->name}</h2>
                                <p>تذكير بأن لديك جلسة غداً</p>
                                <ul>
                                    <li><b>رقم الجلسة:</b> {$session->session_number}</li>
                                    <li><b>القضية:</b> {$session->legalCase?->case_number}</li>
                                    <li><b>الجهة:</b> {$session->agency}</li>
                                    <li><b>وقت الجلسة:</b> {$session->session_time}</li>
                                    <li><b>التاريخ:</b> {$session->date}</li>
                                    <li><b>ملاحظات:</b> {$session->notes}</li>
                                </ul>
                            ");
                    });
                    $this->info("✅ جلسة - المحامي: {$session->lawyer->name} - جلسة: {$session->session_number}");
                } else {
                    $this->warn("⚠️ الجلسة {$session->session_number} مفيش محامي أو إيميل.");
                }
            }
        }

        $this->info('تم الانتهاء من إرسال كل التذكيرات.');
    }
}
