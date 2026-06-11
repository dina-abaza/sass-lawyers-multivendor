<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Models\TenantSubscription;
use Carbon\Carbon;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');


Schedule::call(function () {
    // تحديث كل الاشتراكات اللي حالتها Active وتاريخ انتهائها أصغر من "الآن"
    TenantSubscription::withoutTenancy()
        ->where('status', 'active')
        ->where('expires_at', '<', Carbon::now())
        ->update(['status' => 'expired']);

    // تسجيل في الـ Log عشان تتأكدي إن العملية تمت بنجاح
    info('Cron Job: تم تحديث حالات الاشتراكات المنتهية إلى expired بنجاح.');

})->daily(); // يتنفذ مرة كل يوم تلقائياً


Schedule::command('cases:send-reminders')->dailyAt('08:00');
