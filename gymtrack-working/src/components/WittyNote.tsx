import { useEffect, useState } from "react";

type WittyNoteProps = {
  children: string;
};

export function WittyNote({ children }: WittyNoteProps) {
  const [variant, setVariant] = useState(0);

  useEffect(() => {
    setVariant(Math.floor(Math.random() * 6));
  }, []);

  return (
    <p className={`witty-note witty-note--${variant}`} role="note">
      {children}
    </p>
  );
}