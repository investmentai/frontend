// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './app.module.css';
import { Route, Routes } from 'react-router-dom';
import { Chat } from '@investai/prompt';

// import NxWelcome from './nx-welcome';

function Home() {
  return <h1>Home</h1>;
}

export function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/chat" element={<Chat />}></Route>
      </Routes>
      {/* <NxWelcome title="investai" /> */}
    </div>
  );
}

export default App;
