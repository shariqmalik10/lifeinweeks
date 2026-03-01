"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { profile, updateProfile, settings, updateSettings, tasks, goals } =
    useAppStore();

  const [firstName, setFirstName] = useState(profile?.first_name || "");
  const [lastName, setLastName] = useState(profile?.last_name || "");
  const [email, setEmail] = useState(profile?.email || "");
  const [birthDate, setBirthDate] = useState(profile?.birth_date || "");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Auto-save profile changes with debounce
  const saveProfile = useCallback(() => {
    setSaveStatus("saving");
    updateProfile({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      birth_date: birthDate || undefined,
    });
    setTimeout(() => setSaveStatus("saved"), 300);
    setTimeout(() => setSaveStatus("idle"), 2000);
  }, [firstName, lastName, birthDate, updateProfile]);

  const handleExportData = () => {
    const data = {
      profile: {
        first_name: firstName,
        last_name: lastName,
        email,
        birth_date: profile?.birth_date,
      },
      tasks: tasks.map((t) => ({
        title: t.title,
        date: t.date,
        time: t.time,
        priority: t.priority,
        completed: t.completed,
      })),
      goals: goals.map((g) => ({
        title: g.title,
        target_date: g.target_date,
        progress: g.progress,
        color: g.color,
      })),
      exported_at: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lifeinweeks-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = () => {
    // In a real app, this would call an API to delete the account
    // For now, clear local storage
    localStorage.removeItem("lifeinweeks-storage");
    window.location.href = "/auth/login";
  };

  const initials =
    firstName && lastName
      ? `${firstName[0]}${lastName[0]}`.toUpperCase()
      : email?.[0]?.toUpperCase() || "U";

  return (
    <div className="mx-auto max-w-2xl p-6">
      {/* Header */}
      <div>
        <h1 className="text-balance text-3xl font-semibold italic text-foreground">
          Settings
        </h1>
        <p className="mt-1 text-pretty text-muted-foreground">
          Manage your preferences and data
        </p>
      </div>

      <div className="mt-8 space-y-8">
        {/* Profile Information */}
        <section className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Profile Information
          </h2>

          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="flex size-20 items-center justify-center rounded-full bg-secondary text-2xl font-semibold text-foreground">
                {initials}
              </div>

              {/* Form */}
              <div className="flex-1 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input
                      id="first-name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      onBlur={saveProfile}
                      placeholder="First name"
                      maxLength={50}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input
                      id="last-name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      onBlur={saveProfile}
                      placeholder="Last name"
                      maxLength={50}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    className="bg-secondary/50"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birth-date">Date of Birth</Label>
                  <Input
                    id="birth-date"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    onBlur={saveProfile}
                    max={new Date().toISOString().slice(0, 10)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Used to calculate your life grid visualization
                  </p>
                </div>

                <AnimatePresence>
                  {saveStatus === "saved" && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="text-sm text-green-600"
                    >
                      Changes saved
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>

        {/* Application Preferences */}
        <section className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Application Preferences
          </h2>

          <div className="rounded-xl border border-border bg-card divide-y divide-border">
            {/* Dark Mode */}
            <div className="flex items-center justify-between p-4">
              <div>
                <div className="font-medium text-foreground">Dark Mode</div>
                <div className="text-sm text-muted-foreground">
                  Switch between light and dark themes
                </div>
              </div>
              <Switch
                checked={settings.dark_mode}
                onCheckedChange={(checked) =>
                  updateSettings({ dark_mode: checked })
                }
                aria-label="Toggle dark mode"
              />
            </div>

            {/* Email Notifications */}
            <div className="flex items-center justify-between p-4">
              <div>
                <div className="font-medium text-foreground">
                  Email Notifications
                </div>
                <div className="text-sm text-muted-foreground">
                  Receive weekly summaries and goal alerts
                </div>
              </div>
              <Switch
                checked={settings.email_notifications}
                onCheckedChange={(checked) =>
                  updateSettings({ email_notifications: checked })
                }
                aria-label="Toggle email notifications"
              />
            </div>
          </div>
        </section>

        {/* Data & Privacy */}
        <section className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Data & Privacy
          </h2>

          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex flex-wrap gap-4">
              <Button variant="outline" onClick={handleExportData}>
                <Download className="mr-2 size-4" />
                Export Data (JSON)
              </Button>

              <Button
                variant="outline"
                className="text-red-500 hover:text-red-600 hover:border-red-300"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="mr-2 size-4" />
                Delete Account
              </Button>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              Your data is stored locally in your browser. Exporting creates a
              backup file you can save.
            </p>
          </div>
        </section>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent onClose={() => setShowDeleteConfirm(false)}>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              This action is permanent and cannot be undone. All your data,
              including tasks and goals, will be deleted.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="delete-confirm">
              Type <strong>DELETE</strong> to confirm
            </Label>
            <Input
              id="delete-confirm"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteConfirm(false);
                setDeleteConfirmText("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteConfirmText !== "DELETE"}
              onClick={handleDeleteAccount}
            >
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
