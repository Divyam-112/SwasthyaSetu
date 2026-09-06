import React from "react";
import { LogOut } from "lucide-react";
import { Modal, Button } from "@/components/ui";

interface ExitInterviewModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ExitInterviewModal({ open, onCancel, onConfirm }: ExitInterviewModalProps) {
  return (
    <Modal open={open} onClose={onCancel} title="Exit the interview?">
      <div className="flex flex-col gap-4">
        <p className="text-base text-ink-muted">
          If you exit now, your answers won't be saved and you'll need to start
          this interview again from the beginning.
        </p>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onCancel}>
            Stay in the interview
          </Button>
          <Button
            variant="danger"
            icon={<LogOut className="h-5 w-5" aria-hidden="true" />}
            onClick={onConfirm}
          >
            Exit anyway
          </Button>
        </div>
      </div>
    </Modal>
  );
}
