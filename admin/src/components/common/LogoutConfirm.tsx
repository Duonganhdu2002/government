import React from "react";
import { Button, Prompt } from "@medusajs/ui";

type LogoutConfirmProps = {
  onCancel: () => void;
  onConfirm: () => void;
};

const LogoutConfirm: React.FC<LogoutConfirmProps> = ({ onCancel, onConfirm }) => {
  return (
    <Prompt open>
      <Prompt.Content>
        <Prompt.Header>
          <Prompt.Title>Đăng xuất</Prompt.Title>
          <Prompt.Description>
            Bạn chắc chắn muốn đăng xuất?
          </Prompt.Description>
        </Prompt.Header>
        <Prompt.Footer>
          <Prompt.Cancel onClick={onCancel}>Hủy</Prompt.Cancel>
          <Prompt.Action onClick={onConfirm}>Đăng xuất</Prompt.Action>
        </Prompt.Footer>
      </Prompt.Content>
    </Prompt>
  );
};

export default LogoutConfirm;
