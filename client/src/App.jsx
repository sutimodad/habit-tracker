import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Layout from './components/Layout/Layout'
import Home from './pages/Home'
import Habits from './pages/Habits'
import Stats from './pages/Stats'
import Family from './pages/Family'

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/habits" element={<Habits />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/family" element={<Family />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  )
}
