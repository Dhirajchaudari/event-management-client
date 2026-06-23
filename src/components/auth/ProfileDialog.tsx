"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { gqlRequest, UnauthorizedError } from "@/lib/graphql";
import type { ActiveUserRole } from "@/lib/types";
import { pushToast } from "@/store/toast.store";

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  role: ActiveUserRole;
}

export function ProfileDialog({
  open,
  onOpenChange,
  email,
  role
}: ProfileDialogProps): React.JSX.Element {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleChangePassword(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      pushToast("New passwords do not match", "error");
      return;
    }

    setSaving(true);
    try {
      await gqlRequest<{ changePassword: boolean }>(
        `mutation ChangePassword($input: ChangePasswordInput!) {
          changePassword(input: $input)
        }`,
        {
          input: {
            email,
            currentPassword,
            newPassword
          }
        }
      );

      pushToast("Password updated successfully", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      if (error instanceof UnauthorizedError) return;
      pushToast(error instanceof Error ? error.message : "Failed to update password", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Your profile</DialogTitle>
          <DialogDescription>Account details and password settings.</DialogDescription>
        </DialogHeader>

        <div className="rounded-2xl border border-border/70 bg-background/40 p-4">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">Signed in as</p>
          <p className="mt-2 text-sm font-medium text-foreground">{email}</p>
          <Badge variant={role === "admin" ? "admin" : "muted"} className="mt-3 capitalize">
            {role}
          </Badge>
        </div>

        <form className="space-y-4" onSubmit={(event) => void handleChangePassword(event)}>
          <div>
            <p className="text-sm font-medium text-foreground">Change password</p>
            <p className="mt-1 text-xs text-muted">Update your password while staying signed in.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-current-password">Current password</Label>
            <Input
              id="profile-current-password"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-new-password">New password</Label>
            <Input
              id="profile-new-password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-confirm-password">Confirm new password</Label>
            <Input
              id="profile-confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? "Updating..." : "Update password"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
