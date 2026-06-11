<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;

class StaffGeneralMessage extends Mailable
{
    use Queueable, SerializesModels;

    public $subject;
    public $content;
    public $senderName;

   
    public function __construct($subject, $content, $senderName)
    {
        $this->subject = $subject;
        $this->content = $content;
        $this->senderName = $senderName;
    }

  
    public function build()
    {
        return $this->subject($this->subject) // تحديد عنوان الرسالة الذي سيظهر للمستلم
                    ->view('emails.staff_message'); // تحديد ملف التصميم في resources/views/emails/
    }
}