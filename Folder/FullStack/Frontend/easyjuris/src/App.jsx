
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Upload from './Components/Upload.jsx';
import Chat from './Components/Chat.jsx';

import Login from "./Components/Login.jsx"
// import Dashboard from "../Components/DashBoard";
import LeaderBoardInterface from './Components/LeaderBoardInterface.jsx';
import Register from "./Components/Register"
import Home from "./Components/Home.jsx"
import ClauseByClauseExplanation from './Components/ClauseByClauseExplanation.jsx';
import { useNavigate, useParams } from 'react-router-dom';
import QuestionsList from './Components/QuestionsList.jsx';
import SolveQuestion from './Components/SolveQuestion.jsx';
import LeaderBoard from './Components/LeaderBoard.jsx';
import Enter from './Components/Enter.jsx';
import UploadQueImage from './Components/UploadQueImage.jsx';
import AskAI from './Components/AskAI.jsx';
const QuestionListWrapper = () => {
  const { topicName } = useParams(); // Grabs "Kinematics" from URL
  const navigate = useNavigate();
  
  return (
    <QuestionsList 
      topicName={topicName} 
      onBack={() => navigate('/Practice')} 
    />
  );
};
function App() {


  return (
    <>
      <BrowserRouter>
      <Routes>
        {/* <Route path="/" element={<Upload/>} /> */}
 
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/Practice" element={<LeaderBoardInterface />} />
        <Route path="/LeaderBoard" element={<LeaderBoard />} />
        <Route path="/" element={<Enter />} />
        <Route path="/uploadQueImage" element={<UploadQueImage />} />
      
        <Route path="/solveQuestion/:id" element={<SolveQuestion />} />
        <Route path="/askAI" element={<AskAI />} />
       
        <Route path="/questions/:topicName" element={<QuestionListWrapper />} />
        <Route path="/ChatRoom" element={<Chat userId={localStorage.getItem("username")} />} />
       <Route path="/ClauseByClauseExplanation/:fileID" element={<ClauseByClauseExplanation />} />
      </Routes>
      </BrowserRouter>
      
    </>
  )
}

export default App
