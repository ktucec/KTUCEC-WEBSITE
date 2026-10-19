// Etrafında yazı dönen yuvarlak rozet; ortada kulüp logosu
export default function RotatingBadge({ text = "KTUCEC ✦ BİLGİSAYAR KULÜBÜ ✦ TRABZON ✦ ", size = 132, className = "" }) {
    return (
        <div className={`relative grid place-items-center rounded-full bg-card shadow-xl border border-line ${className}`} style={{ width: size, height: size }} aria-hidden="true">
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full animate-[spin_16s_linear_infinite] motion-reduce:animate-none">
                <defs>
                    <path id="badge-circle" d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0" />
                </defs>
                <text className="fill-ink" style={{ fontSize: "8.4px", fontWeight: 700, letterSpacing: "0.9px", fontFamily: "var(--font-montserrat)" }}>
                    <textPath href="#badge-circle">{text}</textPath>
                </text>
            </svg>
            <img src="/logo.png" alt="" className="w-[38%] h-[38%] rounded-full" />
        </div>
    );
}
