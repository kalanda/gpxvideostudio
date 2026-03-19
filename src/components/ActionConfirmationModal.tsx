import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import type { FC } from "react";
import { useTranslation } from "react-i18next";

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
}) => {
  const { t } = useTranslation();

  return (
    <Modal isOpen={isOpen} onClose={onCancel}>
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalBody>
          <p className="text-sm text-foreground/80">{description}</p>
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={onCancel}>
            {t("common.cancel")}
          </Button>
          <Button color="danger" onPress={onConfirm}>
            {t("common.confirm")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
