import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import HomePage from "@/pages/HomePage";
import StoryDetailPage from "@/pages/StoryDetailPage";
import StoryCreatePage from "@/pages/StoryCreatePage";
import StoryListPage from "@/pages/StoryListPage";

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/stories" element={<StoryListPage />} />
          <Route path="/stories/:id" element={<StoryDetailPage />} />
          <Route path="/create" element={<StoryCreatePage />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;
