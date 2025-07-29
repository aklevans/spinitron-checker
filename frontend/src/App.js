import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Routes, Route} from 'react-router'
import Home from "./pages/Home";
import Layout from "./components/Layout";
import NoPage from "./pages/NoPage";
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="*" element={<NoPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
  );
}

export default App;
