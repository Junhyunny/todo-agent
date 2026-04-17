import { CirclePlus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";

export const TodoRegistrationDialog = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button aria-label="TODO 등록">
            <CirclePlus />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>TODO 등록</DialogTitle>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
