import { redirect } from 'next/navigation';

// GEÇİCİ: CODEWAVE 2026 sitesi hazır olunca bu dosya o sayfayla değişecek.
// O zamana kadar ziyaretçiler mevcut siteyi görmeye devam etsin diye 2025'e yönlendiriyoruz.
export default function Page() {
  redirect('/2025');
}
