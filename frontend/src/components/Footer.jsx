import React from "react";
import { useLang } from "@/contexts/LanguageContext";

const Footer = () => {
  const { strings } = useLang();
  const cols = strings.footer.cols;
  return (
    <footer id="footer" className="w-full bg-white axum-border-t" data-testid="footer">
      <div className="grid grid-cols-2 md:grid-cols-4">
        {cols.map((col, i) => (
          <div key={col.title} className={`p-6 md:p-10 axum-border-b ${i % 2 === 0 ? "axum-border-r" : ""} ${i < 2 ? "md:axum-border-r" : ""} ${i === 2 ? "md:axum-border-r" : ""}`}>
            <div className="text-[10px] tracking-[0.4em] uppercase opacity-60 mb-4">{col.title}</div>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l}>
                  <a href="#" className="axum-link" data-testid={`footer-link-${i}-${l}`}>{l}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 px-6 md:px-10 py-6">
        <div className="font-display text-5xl md:text-7xl lg:text-[10rem] leading-none uppercase tracking-tighter">
          AXUM
        </div>
        <div className="text-[11px] tracking-[0.3em] uppercase opacity-70">
          © {new Date().getFullYear()} {strings.footer.copyright}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
