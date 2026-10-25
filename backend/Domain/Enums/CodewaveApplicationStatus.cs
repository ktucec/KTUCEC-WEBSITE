namespace ktucec.Domain.Enums;

// CODEWAVE bilet başvurusunun durumu. Form gönderilip Shopier'e yönlendirilince "Waiting" olarak açılır;
// ileride yönetim panelinden onaylanır ya da reddedilir.
public enum CodewaveApplicationStatus
{
    Waiting = 0,
    Approved = 1,
    Rejected = 2
}
