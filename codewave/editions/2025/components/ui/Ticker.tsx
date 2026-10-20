// Hero ile hakkında bölümü arasındaki kayan bant (saf CSS animasyonu: GPU'da, scroll'u etkilemez).
const ITEMS = ['KTUCEC', 'CODEWAVE 2025', 'FIRST WAVE', 'TRABZON', 'YAZILIM', 'GİRİŞİMCİLİK', 'YAPAY ZEKÂ', 'SİBER GÜVENLİK'];

export default function Ticker() {
    const row = ITEMS.map((t, i) => (
        <span key={i} className={i % 2 ? 'tk-out' : 'tk-fill'}>
            {t}
            <i aria-hidden="true">✦</i>
        </span>
    ));
    return (
        <div className="ticker" aria-hidden="true">
            <div className="ticker-track">
                <div>{row}</div>
                <div>{row}</div>
            </div>
        </div>
    );
}
