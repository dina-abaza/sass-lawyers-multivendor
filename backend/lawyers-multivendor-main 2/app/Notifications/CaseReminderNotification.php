<?php

namespace App\Notifications;

use App\Models\LegalCase;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class CaseReminderNotification extends Notification
{
    use Queueable;

    public function __construct(public LegalCase $case) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('تذكير: موعد قضية غداً - ' . $this->case->case_number)
            ->greeting('مرحباً ' . $notifiable->name)
            ->line('تذكير بأن لديك قضية موعدها غداً.')
            ->line('**رقم القضية:** ' . $this->case->case_number)
            ->line('**الموضوع:** ' . ($this->case->subject ?? 'غير محدد'))
            ->line('**الجهة:** ' . ($this->case->agency ?? 'غير محدد'))
            ->line('**الدائرة:** ' . ($this->case->office ?? 'غير محدد'))
            ->line('**اسم الخصم:** ' . ($this->case->opponent_name ?? 'غير محدد'))
            ->line('**التاريخ:** ' . $this->case->date)
            ->line('**الملاحظات:** ' . ($this->case->notes ?? 'لا يوجد'))
            ->salutation('مع التحية، منظومة إدارة القضايا');
    }
}
