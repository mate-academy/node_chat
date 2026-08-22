interface Props {
  username: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const Entrance: React.FC<Props> = ({ username, onChange, onSubmit }) => {
  return (
    <form
      className="flex flex-col gap-2 py-3 px-3 bg-slate-900 rounded-2xl"
      onSubmit={onSubmit}
    >
      <label htmlFor="username">Enter your username</label>
      <input
        autoFocus
        type="text"
        name="username"
        placeholder="John"
        id="username"
        value={username}
        onChange={onChange}
        className="bg-slate rounded-md max-w-max px-2 py-1 focus:outline-slate-600"
      />
      <button type="submit" className="cursor-pointer">Submit</button>
    </form>
  );
};
