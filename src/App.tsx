import './App.css';
import{ Route, Routes} from 'react-router-dom';
import CreateProfile from './components/CreateProfile';
import ChatAppDashBoard from './components/ChatAppDashBoard';


function App() {
  return (
   
  <Routes>
      <Route path="/" element={<CreateProfile/>} />
      <Route path="/chat-dashboard" element={<ChatAppDashBoard/>} />
    </Routes>
  )};

export default App
