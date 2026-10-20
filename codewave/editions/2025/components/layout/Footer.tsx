'use client';
import { Mail } from 'lucide-react';
import { SOCIALS } from '@/editions/2025/data';

function Ig() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="20" x="2" y="2" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" />
        </svg>
    );
}
function Li() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" />
        </svg>
    );
}

export default function Footer() {
    return (
        <footer className="footer-minimal section">
            <div className="footer-word" aria-hidden="true">CODEWAVE</div>
            <div className="footer-bottom">
                <span className="copyright">© 2025 KTUCEC · CODEWAVE</span>
                <span className="slogan">BUILT WITH PASSION FOR TECH VISIONARIES</span>
                <div className="social-links">
                    <a href={SOCIALS.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Ig /></a>
                    <a href={SOCIALS.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><Li /></a>
                    <a href={SOCIALS.mail} aria-label="Mail"><Mail size={16} /></a>
                </div>
            </div>
        </footer>
    );
}
