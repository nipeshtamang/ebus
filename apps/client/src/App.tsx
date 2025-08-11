import { Routes, Route, Router, BrowserRouter } from "react-router-dom";
import "./styles/index.css";
import routeconfig from "./Routes/routeconfig";
import Navigationbar from "./pages/Navbar/Navigationbar";
import Footer from "./pages/Footer";

function App() {
  return (
    <BrowserRouter>
      <Navigationbar />
      <div>
        <main className="min-h-screen">
          <Routes>
            {routeconfig.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={<route.Component />}
              />
            ))}
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
