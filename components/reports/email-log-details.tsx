"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  User,
  CheckCircle,
  XCircle,
  Clock,
  Copy,
  RefreshCw,
  Download,
  ArrowLeft,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useEmailLog, useRetryFailedEmail } from "@/hooks/use-email-logs";
import { useAuthStore } from "@/lib/store/auth";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface EmailLogDetailsProps {
  emailLogId: number;
  onBack?: () => void;
  showBackButton?: boolean;
}

export function EmailLogDetails({
  emailLogId,
  onBack,
  showBackButton = false,
}: EmailLogDetailsProps) {
  const { hasPermission } = useAuthStore();
  const { data: emailLog, isLoading, error, refetch } = useEmailLog(emailLogId);
  const retryMutation = useRetryFailedEmail();

  const handleCopyContent = () => {
    if (emailLog?.content) {
      navigator.clipboard.writeText(emailLog.content);
      toast.success("Email content copied to clipboard");
    }
  };

  const handleRetry = () => {
    if (emailLog && emailLog.status === "failed") {
      retryMutation.mutate(emailLog.id);
    }
  };

  const handleDownloadContent = () => {
    if (emailLog) {
      const blob = new Blob([emailLog.content], { type: "text/html" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `email-${emailLog.id}-content.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Email content downloaded");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return (
          <Badge
            variant="default"
            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          >
            <CheckCircle className="mr-1 h-4 w-4" />
            Successfully Sent
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-4 w-4" />
            Failed to Send
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline">
            <Clock className="mr-1 h-4 w-4" />
            Pending
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !emailLog) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-2">
              Failed to load email log details
            </p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      full: date.toLocaleString(),
      relative: formatDistanceToNow(date, { addSuffix: true }),
    };
  };

  const createdDate = formatDate(emailLog.createdAt);
  const sentDate = emailLog.sentAt ? formatDate(emailLog.sentAt) : null;

  return (
    <div className="space-y-6 w-11/12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBackButton && (
            <Button variant="outline" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h2 className="text-2xl font-bold">Email Log Details</h2>
            <p className="text-muted-foreground">Email ID: {emailLog.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {emailLog.status === "failed" && hasPermission("Admin") && (
            <Button
              variant="outline"
              onClick={handleRetry}
              disabled={retryMutation.isPending}
            >
              {retryMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Retry Send
            </Button>
          )}
          <Button variant="outline" onClick={handleDownloadContent}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Email Information */}
        <div className="lg:col-span-1 space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-center">
                  {getStatusBadge(emailLog.status)}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span title={createdDate.full}>{createdDate.relative}</span>
                  </div>
                  {sentDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Sent:</span>
                      <span title={sentDate.full}>{sentDate.relative}</span>
                    </div>
                  )}
                  {emailLog.status === "pending" && (
                    <div className="text-center text-yellow-600 text-xs">
                      Email is queued for sending
                    </div>
                  )}
                  {emailLog.status === "failed" && (
                    <div className="text-center text-red-600 text-xs">
                      Check logs for error details
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recipients & Sender */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Recipient</span>
                </div>
                <div className="text-sm bg-muted p-2 rounded break-all">
                  {emailLog.recipientEmail}
                </div>
              </div>

              <Separator />

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Sent By</span>
                </div>
                <div className="text-sm">
                  <div className="font-medium">{emailLog.sentBy.username}</div>
                  <div className="text-muted-foreground">
                    {emailLog.sentBy.role}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Email Content */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Email Content</CardTitle>
                <Button variant="outline" size="sm" onClick={handleCopyContent}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy HTML
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Subject */}
                <div>
                  <Label className="text-sm font-medium">Subject</Label>
                  <div className="text-lg font-semibold mt-1 p-3 bg-muted rounded">
                    {emailLog.subject}
                  </div>
                </div>

                <Separator />

                {/* HTML Preview */}
                <div>
                  <Label className="text-sm font-medium">Email Preview</Label>
                  <div className="mt-2 border rounded-lg overflow-hidden">
                    <div className="bg-muted px-4 py-2 border-b">
                      <div className="text-sm text-muted-foreground">
                        Preview (rendered HTML)
                      </div>
                    </div>
                    <div
                      className="p-4 max-h-96 overflow-auto bg-white dark:bg-gray-950"
                      dangerouslySetInnerHTML={{ __html: emailLog.content }}
                    />
                  </div>
                </div>

                {/* Raw HTML */}
                <div>
                  <Label className="text-sm font-medium">Raw HTML Source</Label>
                  <div className="mt-2 border rounded-lg overflow-hidden">
                    <div className="bg-muted px-4 py-2 border-b">
                      <div className="text-sm text-muted-foreground">
                        HTML Source Code
                      </div>
                    </div>
                    <pre className="p-4 text-xs bg-gray-50 dark:bg-gray-900 overflow-auto max-h-64 whitespace-pre-wrap">
                      {emailLog.content}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Label({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`text-sm font-medium ${className}`}>{children}</div>;
}
