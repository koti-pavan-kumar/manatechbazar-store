"use client";

import { useState, useEffect } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => { setSettings(data.settings); setLoading(false); });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) alert("Settings saved!");
    } catch {
      alert("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Store Settings</h1>

      <Card>
        <CardHeader><CardTitle>Store Info</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Store Name</Label>
            <Input value={settings.storeName} onChange={(e) => setSettings({ ...settings, storeName: e.target.value })} />
          </div>
          <div>
            <Label>Store Description</Label>
            <Textarea value={settings.storeDescription || ""} onChange={(e) => setSettings({ ...settings, storeDescription: e.target.value })} />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={settings.email || ""} onChange={(e) => setSettings({ ...settings, email: e.target.value })} />
          </div>
          <div>
            <Label>Phone</Label>
            <Input type="tel" value={settings.phone || ""} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Announcement Banner</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center gap-2 min-h-[44px]">
            <Checkbox checked={settings.announcementActive} onCheckedChange={(c) => setSettings({ ...settings, announcementActive: c })} />
            <span className="text-sm">Show announcement banner</span>
          </label>
          <div>
            <Label>Announcement Text</Label>
            <Input value={settings.announcementText || ""} onChange={(e) => setSettings({ ...settings, announcementText: e.target.value })} placeholder="e.g. FLAT 20% OFF on all orders!" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Social & Contact</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>WhatsApp Number (with country code)</Label>
            <Input value={settings.whatsappNumber || ""} onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })} placeholder="917893653255" />
          </div>
          <div>
            <Label>Instagram Handle</Label>
            <Input value={settings.instagramHandle || ""} onChange={(e) => setSettings({ ...settings, instagramHandle: e.target.value })} placeholder="@mohanstore" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Shipping</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Free Shipping Threshold (₹)</Label>
            <Input type="number" value={settings.freeShippingThreshold ? settings.freeShippingThreshold / 100 : 499} onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) * 100 })} />
          </div>
        </CardContent>
      </Card>

      <Button size="lg" onClick={handleSave} disabled={saving}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
        Save Settings
      </Button>
    </div>
  );
}
