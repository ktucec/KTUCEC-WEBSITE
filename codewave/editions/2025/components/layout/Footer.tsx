'use client';
import { Globe2, ExternalLink, Mail } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="footer-minimal section">
            <div className="footer-bottom">
                <span className="copyright">© 2026 KTUCEC</span>
                <span className="slogan">BUILT WITH PASSION FOR TECH VISIONARIES</span>
                <div className="social-links">
                    <a href="#" aria-label="Website"><Globe2 size={16} /></a>
                    <a href="#" aria-label="External"><ExternalLink size={16} /></a>
                    <a href="#" aria-label="Mail"><Mail size={16} /></a>
                </div>
            </div>
        </footer>
    );
}