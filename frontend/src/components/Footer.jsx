import React from "react";
import Logo from "@/components/Logo";
import { useLang } from "@/contexts/LanguageContext";
import { SOCIAL_URLS } from "@/i18n";

const Footer = () => {
  const { strings } = useLang();
  const cols = strings.footer.cols;
  const newTab = strings.a11y.opens_new_tab;
  return (
    <footer id="footer" className="w-full bg-white axum-border-t" data-testid="footer">
      <div className="grid grid-cols-2 md:grid-cols-4">
        {cols.map((col, i) => (
          <div key={col.title} style={{ "--rd": `${(i % 4) * 0.06}s` }} className={`reveal p-6 md:p-10 axum-border-b ${i % 2 === 0 ? "axum-border-r" : ""} ${i < 2 ? "md:axum-border-r" : ""} ${i === 2 ? "md:axum-border-r" : ""}`}>
            <div className="text-[10px] tracking-[0.4em] uppercase opacity-60 mb-4">{col.title}</div>
            <ul className="space-y-2">
              {col.links.map((l) => {
                const url = SOCIAL_URLS[l];
                return (
                  <li key={l}>
                    {url ? (
                      // Real external link — enriched accessible name + new-tab warning.
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="axum-link"
                        data-testid={`footer-link-${i}-${l}`}
                      >
                        <span className="sr-only">AXUM </span>{l}
                        <span aria-hidden="true"> ↗</span>
                        <span className="sr-only"> {newTab}</span>
                      </a>
                    ) : (
                      // No destination yet — inert text, NOT a misleading href="#" link.
                      <span
                        className="axum-link opacity-40 cursor-default"
                        aria-disabled="true"
                        data-testid={`footer-link-${i}-${l}`}
                      >
                        {l}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 px-6 md:px-10 py-10">
        <Logo tone="black" height={48} alt="AXUM" />
        <div className="text-[11px] tracking-[0.3em] uppercase opacity-70">
          © {new Date().getFullYear()} {strings.footer.copyright}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
