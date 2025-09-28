"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Send,
  Users,
  Mail,
  Plus,
  Trash2,
  Eye,
  Loader2,
  CheckCircle,
  AlertTriangle,
  User,
} from "lucide-react";
import {
  useSendInventoryReport,
  useInventoryReportData,
  useValidateEmails,
} from "@/hooks/use-reports";
import { useActiveMerchants } from "@/hooks/use-merchants";
import { toast } from "sonner";

export default function SendReportPage() {
  const router = useRouter();
  const [selectedMerchants, setSelectedMerchants] = useState<number[]>([]);
  const [customEmails, setCustomEmails] = useState<string>("");
  const [subject, setSubject] = useState(
    `Inventory Report - ${new Date().toLocaleDateString()}`
  );
  const [customMessage, setCustomMessage] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const { data: merchants, isLoading: isLoadingMerchants } =
    useActiveMerchants();
  const { data: reportData, isLoading: isLoadingReport } =
    useInventoryReportData();
  const sendReportMutation = useSendInventoryReport();
  const validateEmailsMutation = useValidateEmails();

  // Get all recipient emails
  const getRecipientEmails = () => {
    const merchantEmails =
      merchants
        ?.filter((merchant) => selectedMerchants.includes(merchant.id))
        .map((merchant) => merchant.email) || [];

    const customEmailList = customEmails
      .split(/[,\n]/)
      .map((email) => email.trim())
      .filter((email) => email.length > 0);

    return [...merchantEmails, ...customEmailList];
  };

  const handleMerchantToggle = (merchantId: number) => {
    setSelectedMerchants((prev) =>
      prev.includes(merchantId)
        ? prev.filter((id) => id !== merchantId)
        : [...prev, merchantId]
    );
  };

  const handleSelectAllMerchants = () => {
    if (!merchants) return;

    if (selectedMerchants.length === merchants.length) {
      setSelectedMerchants([]);
    } else {
      setSelectedMerchants(merchants.map((merchant) => merchant.id));
    }
  };

  const handleValidateEmails = async () => {
    const emails = getRecipientEmails();
    if (emails.length === 0) {
      toast.error("Please select recipients or add email addresses");
      return;
    }

    validateEmailsMutation.mutate(emails);
  };

  const handleSendReport = async () => {
    const emails = getRecipientEmails();

    if (emails.length === 0) {
      toast.error("Please select recipients or add email addresses");
      return;
    }

    // Validate emails first
    const validation = await validateEmailsMutation.mutateAsync(emails);

    if (validation.invalidCount > 0) {
      const proceed = window.confirm(
        `${validation.invalidCount} invalid email(s) found. Continue with ${validation.validCount} valid emails?`
      );
      if (!proceed) return;
    }

    sendReportMutation.mutate(
      {
        recipients: validation.validEmails,
        subject: subject.trim() || undefined,
        customMessage: customMessage.trim() || undefined,
      },
      {
        onSuccess: () => {
          router.push("/dashboard/reports");
        },
      }
    );
  };

  const recipientEmails = getRecipientEmails();
  const isFormValid = recipientEmails.length > 0 && subject.trim().length > 0;

  return (
    <div className="space-y-6 max-w-7xll w-full">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/reports">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Send Inventory Report</h1>
          <p className="text-muted-foreground">
            Select recipients and customize your inventory report email
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recipients Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Select Recipients
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Merchants */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>Active Merchants ({merchants?.length || 0})</Label>
                  {merchants && merchants.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAllMerchants}
                    >
                      {selectedMerchants.length === merchants.length
                        ? "Deselect All"
                        : "Select All"}
                    </Button>
                  )}
                </div>

                {isLoadingMerchants ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : merchants && merchants.length > 0 ? (
                  <div className="grid gap-2 max-h-48 overflow-y-auto border rounded-md p-3">
                    {merchants.map((merchant) => (
                      <div
                        key={merchant.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`merchant-${merchant.id}`}
                          checked={selectedMerchants.includes(merchant.id)}
                          onCheckedChange={() =>
                            handleMerchantToggle(merchant.id)
                          }
                        />
                        <Label
                          htmlFor={`merchant-${merchant.id}`}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <span>{merchant.name}</span>
                            <span className="text-sm text-muted-foreground">
                              {merchant.email}
                            </span>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <User className="h-8 w-8 mx-auto mb-2" />
                    <p>No active merchants found</p>
                    <Link
                      href="/dashboard/merchants/new"
                      className="text-primary hover:underline"
                    >
                      Add merchants first
                    </Link>
                  </div>
                )}
              </div>

              <Separator />

              {/* Custom Emails */}
              <div>
                <Label htmlFor="custom-emails">
                  Additional Email Addresses
                </Label>
                <Textarea
                  id="custom-emails"
                  placeholder="Enter email addresses separated by commas or new lines&#10;example1@company.com, example2@company.com&#10;example3@company.com"
                  value={customEmails}
                  onChange={(e) => setCustomEmails(e.target.value)}
                  className="mt-2"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Separate multiple emails with commas or new lines
                </p>
              </div>

              {/* Email Validation */}
              {recipientEmails.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm font-medium">
                      {recipientEmails.length} recipient(s) selected
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
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Content
              </CardTitle>
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
        </div>

        {/* Preview & Actions */}
        <div className="space-y-6">
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Recipients</span>
                <Badge variant="outline">{recipientEmails.length}</Badge>
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
                <span className="text-xs text-muted-foreground truncate max-w-24">
                  {subject || "No subject"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6 space-y-3">
              <Dialog open={showPreview} onOpenChange={setShowPreview}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Eye className="mr-2 h-4 w-4" />
                    Preview Email
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Email Preview</DialogTitle>
                    <DialogDescription>
                      This is how your email will appear to recipients
                    </DialogDescription>
                  </DialogHeader>
                  <div className="border rounded-lg p-4 bg-background">
                    <div className="space-y-2 mb-4">
                      <p>
                        <strong>Subject:</strong> {subject}
                      </p>
                      <p>
                        <strong>Recipients:</strong> {recipientEmails.length}{" "}
                        emails
                      </p>
                    </div>
                    {customMessage && (
                      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950 rounded border-l-4 border-blue-500">
                        <p className="text-sm">{customMessage}</p>
                      </div>
                    )}
                    <div className="text-sm">
                      <p className="font-medium mb-2">📦 Inventory Report</p>
                      <p className="text-muted-foreground mb-2">
                        Generated on {new Date().toLocaleString()}
                      </p>
                      <div className="border rounded p-2 bg-muted/50">
                        <p className="text-xs">
                          [Inventory table with {reportData?.length || 0} items
                          would appear here]
                        </p>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                onClick={handleSendReport}
                disabled={!isFormValid || sendReportMutation.isPending}
                className="w-full"
              >
                {sendReportMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Send Report
              </Button>

              {!isFormValid && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Please select recipients and enter a subject</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Selected Recipients List */}
          {recipientEmails.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Selected Recipients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {recipientEmails.slice(0, 10).map((email, index) => (
                    <div key={index} className="text-xs p-1 bg-muted rounded">
                      {email}
                    </div>
                  ))}
                  {recipientEmails.length > 10 && (
                    <div className="text-xs text-muted-foreground text-center pt-1">
                      +{recipientEmails.length - 10} more recipients
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
