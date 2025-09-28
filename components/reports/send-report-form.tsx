"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Send,
  Mail,
  Eye,
  Loader2,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import {
  useSendInventoryReport,
  useInventoryReportData,
  useValidateEmails,
} from "@/hooks/use-reports";
import { SendInventoryReport } from "@/types";
import { RecipientSelector } from "./recipient-selector";
import { toast } from "sonner";

interface SendReportFormProps {
  onSuccess?: () => void;
  defaultRecipients?: string[];
  defaultSubject?: string;
  defaultMessage?: string;
}

export function SendReportForm({
  onSuccess,
  defaultRecipients = [],
  defaultSubject = `Inventory Report - ${new Date().toLocaleDateString()}`,
  defaultMessage = "",
}: SendReportFormProps) {
  const [recipients, setRecipients] = useState<string[]>(defaultRecipients);
  const [subject, setSubject] = useState(defaultSubject);
  const [customMessage, setCustomMessage] = useState(defaultMessage);
  const [showPreview, setShowPreview] = useState(false);

  const { data: reportData, isLoading: isLoadingReport } =
    useInventoryReportData();
  const sendReportMutation = useSendInventoryReport();
  const validateEmailsMutation = useValidateEmails();

  const handleValidateEmails = async () => {
    if (recipients.length === 0) {
      toast.error("Please select recipients first");
      return;
    }

    validateEmailsMutation.mutate(recipients);
  };

  const handleSendReport = async () => {
    if (recipients.length === 0) {
      toast.error("Please select recipients");
      return;
    }

    if (!subject.trim()) {
      toast.error("Please enter a subject");
      return;
    }

    // Validate emails first
    const validation = await validateEmailsMutation.mutateAsync(recipients);

    if (validation.invalidCount > 0) {
      const proceed = window.confirm(
        `${validation.invalidCount} invalid email(s) found. Continue with ${validation.validCount} valid emails?`
      );
      if (!proceed) return;
    }

    const data: SendInventoryReport = {
      recipients: validation.validEmails,
      subject: subject.trim(),
      customMessage: customMessage.trim() || undefined,
    };

    sendReportMutation.mutate(data, {
      onSuccess: () => {
        // Reset form
        setRecipients([]);
        setSubject(defaultSubject);
        setCustomMessage("");
        onSuccess?.();
      },
    });
  };

  const isFormValid = recipients.length > 0 && subject.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* Recipients */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Recipients
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RecipientSelector
            selectedEmails={recipients}
            onSelectionChange={setRecipients}
          />

          {recipients.length > 0 && (
            <div className="mt-4 flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="text-sm font-medium">
                  {recipients.length} recipient(s) selected
                </p>
                <p className="text-xs text-muted-foreground">
                  Click validate to check email addresses
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleValidateEmails}
                disabled={validateEmailsMutation.isPending}
              >
                {validateEmailsMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Validate
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Content */}
      <Card>
        <CardHeader>
          <CardTitle>Email Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="message">Custom Message (Optional)</Label>
            <Textarea
              id="message"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Add a custom message that will appear before the inventory table"
              className="mt-2"
              rows={4}
            />
            <p className="text-xs text-muted-foreground mt-1">
              This message will appear at the top of the email before the
              inventory report
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Recipients</span>
            <Badge variant="outline">{recipients.length}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Report Items</span>
            <Badge variant="outline">
              {isLoadingReport ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                reportData?.length || 0
              )}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Subject</span>
            <span className="text-xs text-muted-foreground truncate max-w-32">
              {subject || "No subject"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex-1">
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Email Preview</DialogTitle>
              <DialogDescription>
                This is how your email will appear to recipients
              </DialogDescription>
            </DialogHeader>
            <div className="border rounded-lg p-4 bg-background max-h-96 overflow-y-auto">
              <div className="space-y-2 mb-4 pb-4 border-b">
                <p>
                  <strong>Subject:</strong> {subject}
                </p>
                <p>
                  <strong>To:</strong> {recipients.length} recipient(s)
                </p>
                <p>
                  <strong>From:</strong> Inventory System
                </p>
              </div>

              <div className="space-y-4">
                {customMessage && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded border-l-4 border-blue-500">
                    <p className="text-sm whitespace-pre-wrap">
                      {customMessage}
                    </p>
                  </div>
                )}

                <div>
                  <h2 className="text-lg font-bold text-blue-600 mb-2">
                    📦 Inventory Report
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Generated on {new Date().toLocaleString()}
                  </p>

                  <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">
                        {reportData?.length || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Total Items
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-orange-600">
                        {Array.isArray(reportData)
                          ? reportData.filter((item) => item.quantity < 10)
                              .length
                          : 0}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Low Stock
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-red-600">
                        {Array.isArray(reportData)
                          ? reportData.filter((item) => item.quantity === 0)
                              .length
                          : 0}
                        {Array.isArray(reportData)
                          ? reportData.filter((item) => item.quantity === 0)
                              .length
                          : 0}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Out of Stock
                      </div>
                    </div>
                  </div>

                  <div className="border rounded overflow-hidden">
                    <div className="bg-blue-600 text-white p-2">
                      <div className="grid grid-cols-4 gap-2 text-xs font-bold">
                        <div>Item Name</div>
                        <div className="text-center">Quantity</div>
                        <div>SKU</div>
                        <div className="text-right">Unit Price</div>
                      </div>
                    </div>
                    <div className="max-h-32 overflow-y-auto">
                      {Array.isArray(reportData)
                        ? reportData.slice(0, 5).map((item, index) => (
                            <div
                              key={index}
                              className="grid grid-cols-4 gap-2 p-2 text-xs border-b last:border-0 even:bg-gray-50 dark:even:bg-gray-900"
                            >
                              <div className="font-medium">{item.itemName}</div>
                              <div className="text-center font-bold">
                                {item.quantity}
                              </div>
                              <div className="text-muted-foreground">
                                {item.sku || "N/A"}
                              </div>
                              <div className="text-right">
                                ${item.unitPrice.toFixed(2)}
                              </div>
                            </div>
                          ))
                        : null}
                      {(reportData?.length || 0) > 5 && (
                        <div className="p-2 text-xs text-center text-muted-foreground">
                          ... and {(reportData?.length || 0) - 5} more items
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-center text-muted-foreground pt-4 border-t">
                  This inventory report was automatically generated by the
                  Inventory Management System.
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Button
          onClick={handleSendReport}
          disabled={!isFormValid || sendReportMutation.isPending}
          className="flex-1"
        >
          {sendReportMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}
          Send Report
        </Button>
      </div>

      {!isFormValid && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <AlertTriangle className="h-4 w-4" />
          <span>Please select recipients and enter a subject</span>
        </div>
      )}
    </div>
  );
}
