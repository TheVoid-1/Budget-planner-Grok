import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";

type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  children: ReactNode;
  initialFocusId?: string;
};

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  initialFocusId,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay fixed inset-0 z-50 bg-fg/40" />
        <Dialog.Content
          className="modal-panel fixed top-1/2 right-4 left-4 z-50 mx-auto max-w-md -translate-y-1/2 rounded-xl bg-surface p-4 shadow-card outline-none"
          onOpenAutoFocus={(event) => {
            if (!initialFocusId) return;
            event.preventDefault();
            document.getElementById(initialFocusId)?.focus();
          }}
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Dialog.Title className="font-display text-2xl leading-tight tracking-tight text-fg">
                {title}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-pretty text-muted">
                {description}
              </Dialog.Description>
            </div>
            <Dialog.Close
              className="pressable inline-flex size-11 shrink-0 items-center justify-center rounded-sm text-muted hover:bg-inset hover:text-fg"
              aria-label="Close"
            >
              <X className="size-5" aria-hidden="true" />
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
