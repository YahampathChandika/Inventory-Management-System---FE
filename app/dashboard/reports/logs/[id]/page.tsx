"use client";

import { useRouter } from "next/navigation";
import { EmailLogDetails } from "@/components/reports/email-log-details";
import { useAuthStore } from "@/lib/store/auth";
import { AlertTriangle } from "lucide-react";

interface EmailLogDetailsPageProps {
  params: {
    id: string;
  };
}

export default function EmailLogDetailsPage({
  params,
}: EmailLogDetailsPageProps) {
  const router = useRouter();
  const { hasPermission } = useAuthStore();

  const emailLogId = parseInt(params.id);

  // Check permissions
  if (!hasPermission("Manager")) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">
            You don't have permission to view email logs
          </p>
        </div>
      </div>
    );
  }

  // Validate ID parameter
  if (isNaN(emailLogId) || emailLogId <= 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p className="text-muted-foreground">Invalid email log ID</p>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    router.push("/dashboard/reports/logs");
  };

  return (
    <EmailLogDetails
      emailLogId={emailLogId}
      onBack={handleBack}
      showBackButton={true}
    />
  );
}
