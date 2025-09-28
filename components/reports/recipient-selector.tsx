"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Users,
  User,
  Plus,
  Loader2,
  Search,
  X,
  Mail,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useActiveMerchants } from "@/hooks/use-merchants";

interface RecipientSelectorProps {
  selectedEmails: string[];
  onSelectionChange: (emails: string[]) => void;
  maxRecipients?: number;
}

export function RecipientSelector({
  selectedEmails,
  onSelectionChange,
  maxRecipients = 1000,
}: RecipientSelectorProps) {
  const [customEmails, setCustomEmails] = useState("");
  const [merchantSearch, setMerchantSearch] = useState("");

  const { data: merchants, isLoading: isLoadingMerchants } =
    useActiveMerchants();

  // Get selected merchant IDs from emails
  const selectedMerchantIds =
    merchants
      ?.filter((merchant) => selectedEmails.includes(merchant.email))
      .map((merchant) => merchant.id) || [];

  // Filter merchants based on search
  const filteredMerchants =
    merchants?.filter(
      (merchant) =>
        merchant.name.toLowerCase().includes(merchantSearch.toLowerCase()) ||
        merchant.email.toLowerCase().includes(merchantSearch.toLowerCase())
    ) || [];

  // Parse custom emails
  const customEmailList = customEmails
    .split(/[,\n]/)
    .map((email) => email.trim())
    .filter((email) => email.length > 0);

  const handleMerchantToggle = (merchantId: number, merchantEmail: string) => {
    const isSelected = selectedEmails.includes(merchantEmail);

    if (isSelected) {
      onSelectionChange(
        selectedEmails.filter((email) => email !== merchantEmail)
      );
    } else {
      if (selectedEmails.length >= maxRecipients) {
        return;
      }
      onSelectionChange([...selectedEmails, merchantEmail]);
    }
  };

  const handleSelectAllMerchants = () => {
    if (!merchants) return;

    const allMerchantEmails = merchants.map((merchant) => merchant.email);
    const nonMerchantEmails = selectedEmails.filter(
      (email) => !allMerchantEmails.includes(email)
    );

    if (selectedMerchantIds.length === merchants.length) {
      // Deselect all merchants, keep custom emails
      onSelectionChange(nonMerchantEmails);
    } else {
      // Select all merchants, add to existing custom emails
      const newEmails = [...nonMerchantEmails, ...allMerchantEmails].slice(
        0,
        maxRecipients
      );
      onSelectionChange(newEmails);
    }
  };

  const handleCustomEmailsChange = (value: string) => {
    setCustomEmails(value);

    // Parse and update selected emails
    const newCustomEmails = value
      .split(/[,\n]/)
      .map((email) => email.trim())
      .filter((email) => email.length > 0);

    const merchantEmails = merchants?.map((m) => m.email) || [];
    const selectedMerchantEmails = selectedEmails.filter((email) =>
      merchantEmails.includes(email)
    );

    const allEmails = [...selectedMerchantEmails, ...newCustomEmails].slice(
      0,
      maxRecipients
    );

    onSelectionChange(allEmails);
  };

  const removeEmail = (emailToRemove: string) => {
    onSelectionChange(
      selectedEmails.filter((email) => email !== emailToRemove)
    );

    // Also remove from custom emails if it's there
    if (!merchants?.some((m) => m.email === emailToRemove)) {
      const updatedCustomEmails = customEmailList
        .filter((email) => email !== emailToRemove)
        .join("\n");
      setCustomEmails(updatedCustomEmails);
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <div className="space-y-6">
      {/* Merchants Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Label className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Active Merchants ({merchants?.length || 0})
          </Label>
          {merchants && merchants.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAllMerchants}
              disabled={selectedEmails.length >= maxRecipients}
            >
              {selectedMerchantIds.length === merchants.length
                ? "Deselect All"
                : "Select All"}
            </Button>
          )}
        </div>

        {/* Search */}
        {merchants && merchants.length > 5 && (
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search merchants..."
              value={merchantSearch}
              onChange={(e) => setMerchantSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        )}

        {isLoadingMerchants ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : filteredMerchants.length > 0 ? (
          <div className="grid gap-2 max-h-48 overflow-y-auto border rounded-md p-3">
            {filteredMerchants.map((merchant) => {
              const isSelected = selectedEmails.includes(merchant.email);
              const isDisabled =
                !isSelected && selectedEmails.length >= maxRecipients;

              return (
                <div key={merchant.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`merchant-${merchant.id}`}
                    checked={isSelected}
                    disabled={isDisabled}
                    onCheckedChange={() =>
                      handleMerchantToggle(merchant.id, merchant.email)
                    }
                  />
                  <Label
                    htmlFor={`merchant-${merchant.id}`}
                    className={`flex-1 cursor-pointer ${
                      isDisabled ? "opacity-50" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{merchant.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {merchant.email}
                      </span>
                    </div>
                  </Label>
                </div>
              );
            })}
          </div>
        ) : merchants && merchants.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border rounded-md">
            <User className="h-8 w-8 mx-auto mb-2" />
            <p className="mb-2">No active merchants found</p>
            <Link href="/dashboard/merchants/new">
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Merchants
              </Button>
            </Link>
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground border rounded-md">
            <p>No merchants match your search</p>
          </div>
        )}
      </div>

      <Separator />

      {/* Custom Emails Section */}
      <div>
        <Label htmlFor="custom-emails" className="flex items-center gap-2">
          <Mail className="h-4 w-4" />
          Additional Email Addresses
        </Label>
        <Textarea
          id="custom-emails"
          placeholder="Enter email addresses separated by commas or new lines&#10;example1@company.com, example2@company.com&#10;example3@company.com"
          value={customEmails}
          onChange={(e) => handleCustomEmailsChange(e.target.value)}
          className="mt-2"
          rows={4}
          disabled={selectedEmails.length >= maxRecipients}
        />
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-muted-foreground">
            Separate multiple emails with commas or new lines
          </p>
          {selectedEmails.length >= maxRecipients && (
            <p className="text-xs text-orange-600">
              Maximum {maxRecipients} recipients reached
            </p>
          )}
        </div>
      </div>

      {/* Selected Recipients Summary */}
      {selectedEmails.length > 0 && (
        <div>
          <Label className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Selected Recipients ({selectedEmails.length})
            </span>
            <Badge variant="outline">
              {selectedEmails.length}/{maxRecipients}
            </Badge>
          </Label>

          <div className="space-y-1 max-h-32 overflow-y-auto border rounded-md p-3">
            {selectedEmails.map((email, index) => {
              const isValid = validateEmail(email);
              const merchant = merchants?.find((m) => m.email === email);

              return (
                <div
                  key={index}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {isValid ? (
                      <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-3 w-3 text-red-600 flex-shrink-0" />
                    )}
                    <span className="truncate">
                      {merchant ? `${merchant.name} (${email})` : email}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeEmail(email)}
                    className="h-6 w-6 p-0 flex-shrink-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Validation Summary */}
          {selectedEmails.length > 0 && (
            <div className="mt-2 flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  {selectedEmails.filter(validateEmail).length} valid
                </span>
                {selectedEmails.filter((email) => !validateEmail(email))
                  .length > 0 && (
                  <span className="flex items-center gap-1 text-red-600">
                    <AlertCircle className="h-3 w-3" />
                    {
                      selectedEmails.filter((email) => !validateEmail(email))
                        .length
                    }{" "}
                    invalid
                  </span>
                )}
              </div>
              {selectedEmails.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onSelectionChange([]);
                    setCustomEmails("");
                  }}
                  className="text-xs h-6"
                >
                  Clear All
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
