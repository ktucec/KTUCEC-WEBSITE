import QRCode from 'qrcode';
import { EVENT } from '@/editions/2026/event';
import { TICKET_CODE_RE } from '@/editions/2026/lib/ticket';

export const runtime = 'nodejs';

// QR görseli: bilet sayfasının bağlantısını kodlar (https://codewave.ktucec.com/bilet/<kod>). E-postadaki <img> bunu kullanır.
// Görsel yalnızca koddan türetilir; bilet bilgisi içermez, bu yüzden backend'e sorulmaz.
export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
    const { code } = await params;
    const clean = code.toUpperCase();
    if (!TICKET_CODE_RE.test(clean)) return new Response('Not found', { status: 404 });

    const png = await QRCode.toBuffer(`${EVENT.siteUrl}/bilet/${clean}`, {
        type: 'png',
        width: 560,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: { dark: '#050a15', light: '#ffffff' },
    });

    return new Response(new Uint8Array(png), {
        headers: {
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=31536000, immutable',
            'X-Robots-Tag': 'noindex',
        },
    });
}
