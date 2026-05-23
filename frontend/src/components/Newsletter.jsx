import React, { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await axios.post(`${API}/newsletter`, { email });
      setDone(true);
      setEmail("");
      toast.success("Subscribed. Check your inbox for the next dispatch.");
    } catch (err) {
      const msg = err?.response?.data?.detail || "Subscription failed.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full bg-white axum-border-t" data-testid="newsletter-section">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-7 p-8 md:p-14 axum-border-b lg:axum-border-b-0 lg:axum-border-r">
          <div className="text-[10px] tracking-[0.4em] uppercase opacity-60 mb-6">N°04 / Dispatch</div>
          <h2 className="font-display uppercase text-5xl md:text-7xl lg:text-8xl leading-[0.88] tracking-tighter" data-testid="newsletter-title">
            Receive<br />the next<br />edition.
          </h2>
          <p className="mt-8 max-w-md text-sm leading-relaxed">
            Four times a year, we send a single image and a sentence. Nothing else.
            No promotions, no noise. Worth opening.
          </p>
        </div>
        <div className="lg:col-span-5 p-8 md:p-14 flex flex-col justify-center">
          {!done ? (
            <form onSubmit={submit} data-testid="newsletter-form">
              <label className="text-[10px] tracking-[0.4em] uppercase opacity-60">Your email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@studio.com"
                className="axum-input mt-3"
                data-testid="newsletter-input"
              />
              <button
                type="submit"
                disabled={loading}
                className="axum-btn mt-8 w-full md:w-auto"
                data-testid="newsletter-submit"
              >
                {loading ? "Sending…" : "Subscribe"} <ArrowRight size={16} strokeWidth={2} />
              </button>
              <p className="mt-6 text-[11px] tracking-[0.25em] uppercase opacity-60">
                By subscribing you accept our archival privacy notice.
              </p>
            </form>
          ) : (
            <div className="text-center py-10" data-testid="newsletter-success">
              <div className="font-display text-3xl uppercase">Welcome to AXUM.</div>
              <p className="mt-3 text-sm opacity-70">Your first dispatch arrives next solstice.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
