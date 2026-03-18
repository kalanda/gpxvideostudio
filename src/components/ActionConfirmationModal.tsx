import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import type { FC } from "react";

export type ActionConfirmationModalProps = {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export const ActionConfirmationModal: FC<ActionConfirmationModalProps> = ({
  isOpen,
  title,
  description,
  onConfirm,
  onCancel,
}) => (
  <Modal isOpen={isOpen} onClose={onCancel}>
    <ModalContent>
      <ModalHeader>{title}</ModalHeader>
      <ModalBody>
        <p className="text-sm text-foreground/80">{description}</p>
      </ModalBody>
      <ModalFooter>
        <Button variant="flat" onPress={onCancel}>
          Cancel
        </Button>
        <Button color="danger" onPress={onConfirm}>
          Confirm
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
);
