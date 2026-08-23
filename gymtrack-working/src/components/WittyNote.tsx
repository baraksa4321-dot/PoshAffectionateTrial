type WittyNoteProps = {
  children: string;
};

export function WittyNote({ children }: WittyNoteProps) {
  return (
    <p className="witty-note" role="note">
      {children}
    </p>
  );
}