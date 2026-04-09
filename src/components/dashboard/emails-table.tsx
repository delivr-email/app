"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmailDetailDrawer } from "./email-detail-drawer";

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

export function EmailsTable({ emails }: { emails: Email[] }) {
  const [selected, setSelected] = useState<Email | null>(null);

  if (emails.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">
          No emails yet. Send your first email using the API.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>To</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {emails.map((email) => (
              <TableRow
                key={email.id}
                className="cursor-pointer"
                onClick={() => setSelected(email)}
              >
                <TableCell className="font-mono text-sm">
                  {email.toAddresses[0]}
                  {email.toAddresses.length > 1 && (
                    <span className="text-muted-foreground">
                      {" "}+{email.toAddresses.length - 1}
                    </span>
                  )}
                </TableCell>
                <TableCell className="max-w-[300px] truncate">
                  {email.subject}
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant[email.status] ?? "outline"}>
                    {email.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(email.createdAt).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <EmailDetailDrawer
        email={selected}
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      />
    </>
  );
}
