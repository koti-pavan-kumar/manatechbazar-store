"use client";

import { StoreLayout } from "@/components/layout/store-layout";
import { ArrowLeft, MessageCircle, Mail, Phone, MapPin, Send, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Open WhatsApp with pre-filled message
    const text = `Hi, I have a query:\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`;
    window.open(`https://wa.me/919999999999?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <StoreLayout>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Store
        </Link>

        <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">Contact Us</h1>
        <p className="text-muted-foreground mb-8">We&apos;d love to hear from you. Reach out anytime!</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info Cards */}
          <div className="space-y-4">
            <a
              href="https://wa.me/919999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-100 dark:border-green-900/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/20">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-bold">WhatsApp</p>
                <p className="text-sm text-muted-foreground">+91 99999 99999</p>
                <p className="text-xs text-green-600 dark:text-green-400 font-medium">Usually replies in minutes</p>
              </div>
            </a>

            <a
              href="mailto:support@manatechbazar.in"
              className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-100 dark:border-blue-900/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-bold">Email</p>
                <p className="text-sm text-muted-foreground">support@manatechbazar.in</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Response within 24 hours</p>
              </div>
            </a>

            <div className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border border-orange-100 dark:border-orange-900/30">
              <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-bold">Business Hours</p>
                <p className="text-sm text-muted-foreground">Mon - Sat: 10 AM - 8 PM</p>
                <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">Sunday: 11 AM - 6 PM</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30 border border-pink-100 dark:border-pink-900/30">
              <div className="w-12 h-12 rounded-xl bg-pink-500 flex items-center justify-center shadow-lg shadow-pink-500/20">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-bold">Location</p>
                <p className="text-sm text-muted-foreground">Andhra Pradesh, India</p>
                <p className="text-xs text-pink-600 dark:text-pink-400 font-medium">Shippan all over India 🇮🇳</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/50 dark:to-slate-900/50 border border-gray-100 dark:border-gray-800 shadow-sm">
              <h2 className="text-xl font-bold mb-6">Send Us a Message</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Your Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Pavan Kumar"
                    className="w-full h-12 px-4 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full h-12 px-4 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    required
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="text-sm font-medium mb-1.5 block">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Order inquiry, return request, etc."
                  className="w-full h-12 px-4 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="text-sm font-medium mb-1.5 block">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us how we can help..."
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                  required
                />
              </div>
              <Button type="submit" size="lg" className="w-full h-12 rounded-xl font-semibold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg shadow-green-500/20">
                <Send className="h-4 w-4 mr-2" /> Send on WhatsApp
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-3">
                Your message will be sent via WhatsApp for instant response
              </p>
            </form>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
