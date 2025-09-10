"use client"

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle } from "lucide-react";

interface AgeVerificationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onDeny: () => void;
}

export function AgeVerificationDialog({ isOpen, onConfirm, onDeny }: AgeVerificationDialogProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  const handleConfirm = () => {
    setIsVisible(false);
    setTimeout(() => onConfirm(), 200); 
  };

  const handleDeny = () => {
    setIsVisible(false);
    setTimeout(() => onDeny(), 200); 
  };

  return (
    <Dialog open={isVisible} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md" 
        showCloseButton={false}
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-xl font-bold">Age Verification Required</DialogTitle>
          <DialogDescription className="text-base">
            You must be 13 years or older to use Yappr. Please confirm your age to continue.
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 rounded-lg bg-muted/50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Important Notice:</p>
              <p>
                By clicking "I am 13 or older", you confirm that you meet the minimum age requirement 
                to use this platform. If you are under 13, please exit this website.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={handleDeny}
            className="w-full sm:w-auto"
          >
            I am under 13
          </Button>
          <Button
            onClick={handleConfirm}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90"
          >
            I am 13 or older
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
