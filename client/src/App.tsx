import React, { useEffect, useState } from 'react';
import { MainPage } from './components/Pages/MainPage/MainPage.tsx';
import { RegisterPage } from './components/Pages/RegisterPage/RegisterPage.tsx';

export const App: React.FC = () => {
  const [isLogined, setIsLogined] = useState(false);

  useEffect(() => {
    const userLogined = localStorage.getItem('user');

    if(userLogined) {
      setIsLogined(true);
    }
  }, [])

  return (
    !isLogined ? (
      <RegisterPage login={setIsLogined} />
    ) : (
      < MainPage logout={setIsLogined} />
    )
  );
};

// const DataLoader = () => {
//   return (
//     <h1 className="title">Chat application</h1>
//   );
// };

// export function App() {
//   const [messages, setMessages] = useState([]);

//   function saveData(message) {
//     // update messages here
//   }

//   return (
//     <section className="section content">
//       <DataLoader onData={saveData} />

//       <MessageForm />
//       <MessageList messages={messages} />
//     </section>
//   )
// }
