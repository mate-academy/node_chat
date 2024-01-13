export function NameChooser({ name, setName }) {
  return (
    <form
      className="field is-horizontal"
      onSubmit={async event => {
        event.preventDefault();

        localStorage.setItem('userName', event.target.name.value);
      }}
    >
      <input
        type="text"
        className="input"
        placeholder="Enter your name"
        value={name}
        name="name"
        onChange={event => setName(event.target.value)}
      />
      <button className="button">Set</button>
    </form>
  );
}
