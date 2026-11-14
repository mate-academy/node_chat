interface HeaderProps {
  username: string;
}

const Header = ({ username }: HeaderProps) => {
  return (
    <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
      <h1 className="text-2xl font-semibold">Chat</h1>

      <span className="font-medium text-gray-700">{username}</span>
    </header>
  );
};

export default Header;
