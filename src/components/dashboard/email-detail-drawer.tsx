"use client";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

interface Email {
  id: string;
  fromAddress: string;
  toAddresses: string[];
  cc: string[];
  bcc: string[];
  replyTo: string | null;
  subject: string;
  html: string | null;
  textContent: string | null;
  status: string;
  errorMessage: string | null;
  queuedAt: string;
  sentAt: string | null;
  deliveredAt: string | null;
  failedAt: string | null;
  createdAt: string;
}

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  sent: "default",
  delivered: "default",
  queued: "secondary",
  sending: "secondary",
  failed: "destructive",
  bounced: "destructive",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  if (!children) return null;
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <div className="text-sm">{children}</div>
    </div>
  );
}

function formatDate(date: string | null) {
  if (!date) return null;
  return new Date(date).toLocaleString();
}

export function EmailDetailDrawer({
  email,
  open,
  onOpenChange,
}: {
  email: Email | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!email) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="text-left pr-8">{email.subject}</SheetTitle>
          <SheetDescription className="text-left">
            <span className="font-mono text-xs">{email.id}</span>
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4 pb-6">
          <div className="flex items-center gap-2">
            <Badge variant={statusVariant[email.status] ?? "outline"}>
              {email.status}
            </Badge>
            {email.errorMessage && (
              <span className="text-xs text-destructive">{email.errorMessage}</span>
            )}
          </div>

          <Separator />

          <div className="grid gap-4">
            <Field label="From">
              <span className="font-mono">{email.fromAddress}</span>
            </Field>
            <Field label="To">
              <div className="flex flex-wrap gap-1">
                {email.toAddresses.map((addr) => (
                  <span key={addr} className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs">
                    {addr}
                  </span>
                ))}
              </div>
            </Field>
            {email.cc.length > 0 && (
              <Field label="CC">
                <div className="flex flex-wrap gap-1">
                  {email.cc.map((addr) => (
                    <span key={addr} className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs">
                      {addr}
                    </span>
                  ))}
                </div>
              </Field>
            )}
            {email.bcc.length > 0 && (
              <Field label="BCC">
                <div className="flex flex-wrap gap-1">
                  {email.bcc.map((addr) => (
                    <span key={addr} className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs">
                      {addr}
                    </span>
                  ))}
                </div>
              </Field>
            )}
            {email.replyTo && (
              <Field label="Reply-To">
                <span className="font-mono">{email.replyTo}</span>
              </Field>
            )}
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <Field label="Sent">{formatDate(email.sentAt)}</Field>
            <Field label="Delivered">{formatDate(email.deliveredAt)}</Field>
            <Field label="Failed">{formatDate(email.failedAt)}</Field>
          </div>

          {(email.html || email.textContent) && (
            <>
              <Separator />
              <Field label="Content">
                {email.html ? (
                  <div
                    className="rounded-md border bg-white p-4 text-sm"
                    dangerouslySetInnerHTML={{ __html: email.html }}
                  />
                ) : (
                  <pre className="whitespace-pre-wrap rounded-md border bg-muted p-4 text-sm">
                    {email.textContent}
                  </pre>
                )}
              </Field>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
