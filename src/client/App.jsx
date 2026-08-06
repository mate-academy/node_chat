// #region imports
import './App.scss';
import { MessageForm } from './components/MessageForm';
// #endregion

const DataLoader = () => {
  return <h1 className="title">Chat application</h1>;
};

export function App() {
  return (
    <section className="section content">
      <DataLoader />
      <MessageForm />
    </section>
  );
}
