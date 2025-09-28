"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { useBulkImportMerchants } from "@/hooks/use-merchants";
import { BulkImportRequest } from "@/hooks/use-merchants";
import { Loader2, Upload, FileText, AlertCircle } from "lucide-react";

const bulkImportSchema = z.object({
  emails: z
    .string()
    .min(1, "Please enter at least one email address")
    .refine((value) => {
      // Basic validation to ensure we have email-like strings
      const emails = value
        .split(/[,\n\r]+/)
        .map((e) => e.trim())
        .filter((e) => e);
      return emails.length > 0 && emails.every((email) => email.includes("@"));
    }, "Please enter valid email addresses separated by commas or new lines"),
  defaultName: z.string().optional(),
});

type BulkImportFormData = z.infer<typeof bulkImportSchema>;

interface BulkImportProps {
  children: React.ReactNode;
}

export function BulkImport({ children }: BulkImportProps) {
  const [open, setOpen] = useState(false);
  const bulkImportMutation = useBulkImportMerchants();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<BulkImportFormData>({
    resolver: zodResolver(bulkImportSchema),
    defaultValues: {
      emails: "",
      defaultName: "",
    },
  });

  const watchedEmails = watch("emails");

  // Parse and preview emails
  const parseEmails = (emailString: string) => {
    return emailString
      .split(/[,\n\r]+/)
      .map((e) => e.trim())
      .filter((e) => e && e.includes("@"));
  };

  const previewEmails = parseEmails(watchedEmails);

  const handleFormSubmit = (data: BulkImportFormData) => {
    const submitData: BulkImportRequest = {
      emails: data.emails,
      defaultName: data.defaultName || undefined,
    };

    bulkImportMutation.mutate(submitData, {
      onSuccess: () => {
        setOpen(false);
        reset();
      },
    });
  };

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      reset();
    }
  };

  const handleSampleData = () => {
    const sampleEmails = [
      "john.doe@example.com",
      "jane.smith@company.com",
      "merchant1@business.org",
      "contact@store.net",
    ].join("\n");

    setValue("emails", sampleEmails);
    setValue("defaultName", "Merchant");
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Bulk Import Merchants
          </DialogTitle>
          <DialogDescription>
            Import multiple merchants by entering their email addresses
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="space-y-4">
            {/* Email Addresses */}
            <div className="space-y-2">
              <Label htmlFor="emails">Email Addresses *</Label>
              <textarea
                id="emails"
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm resize-vertical min-h-[120px] disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Enter email addresses separated by commas or new lines:&#10;john@example.com,&#10;jane@company.com&#10;merchant@business.org"
                rows={6}
                {...register("emails")}
                disabled={bulkImportMutation.isPending}
              />
              {errors.emails && (
                <p className="text-sm text-destructive">
                  {errors.emails.message}
                </p>
              )}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <FileText className="h-3 w-3" />
                Separate with commas, spaces, or new lines
              </div>
            </div>

            {/* Default Name */}
            <div className="space-y-2">
              <Label htmlFor="defaultName">Default Name (Optional)</Label>
              <Input
                id="defaultName"
                placeholder="e.g., Merchant, Partner, Client"
                {...register("defaultName")}
                disabled={bulkImportMutation.isPending}
              />
              <p className="text-xs text-muted-foreground">
                Used as prefix for auto-generated names (e.g., &quot;Merchant 1&quot;,
                &quot;Merchant 2&quot;)
              </p>
            </div>

            {/* Preview */}
            {previewEmails.length > 0 && (
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">
                      Preview ({previewEmails.length} emails)
                    </span>
                  </div>
                  <div className="max-h-24 overflow-y-auto text-xs text-muted-foreground">
                    {previewEmails.slice(0, 10).map((email, index) => (
                      <div key={index} className="truncate">
                        {email}
                      </div>
                    ))}
                    {previewEmails.length > 10 && (
                      <div className="text-xs text-muted-foreground italic">
                        ... and {previewEmails.length - 10} more
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sample Data Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSampleData}
              disabled={bulkImportMutation.isPending}
              className="w-full"
            >
              <FileText className="mr-2 h-4 w-4" />
              Load Sample Data
            </Button>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={bulkImportMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                bulkImportMutation.isPending || previewEmails.length === 0
              }
            >
              {bulkImportMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Import {previewEmails.length} Merchants
                </>
              )}
            </Button>
          </DialogFooter>
        </form>

        {/* Instructions */}
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
            Import Instructions
          </h4>
          <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <li>
              • Paste email addresses separated by commas, spaces, or new lines
            </li>
            <li>• Duplicate emails will be automatically skipped</li>
            <li>• Invalid email formats will be rejected</li>
            <li>• Names will be auto-generated from email addresses</li>
            <li>• All imported merchants will be set as active by default</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
