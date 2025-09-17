
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Upload from './Components/Upload.jsx';
import ClauseByClauseExplanation from './Components/ClauseByClauseExplanation.jsx';
function App() {


  return (
    <>
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Upload/>} />
       <Route path="/ClauseByClauseExplanation/:fileID" element={<ClauseByClauseExplanation />} />
      </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
