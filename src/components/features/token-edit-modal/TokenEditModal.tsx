import { useImperativeHandle, useRef } from "react";
import { FlatToken, PRIMITIVE_TOKEN_TYPES } from "../tokens/utils/flatten";

export type TokenEditModalHandle = {
  open: (token: FlatToken) => void;
  close: () => void;
};

export const TokenEditModal = ({
  ref,
}: {
  ref: React.Ref<TokenEditModalHandle>;
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useImperativeHandle(ref, () => ({
    open: (token) => {
      dialogRef.current?.showModal();
    },
    close: () => dialogRef.current?.close(),
  }));

  return (
    <dialog ref={dialogRef}>
      <h1>Token edit modal</h1>
      {PRIMITIVE_TOKEN_TYPES.map((type) => (
        <h2>{type}</h2>
      ))}
      <button onClick={() => dialogRef.current?.close()}>Close</button>
    </dialog>
  );
};
