import { Routes, Route, Link } from 'react-router-dom'

function App() {
  return (
    <div>
      <nav className="p-4 bg-gray-100 border-b">
        <Link to="/" className="mr-4">Home</Link>
        <Link to="/members" className="mr-4">Members</Link>
        <Link to="/reports">Reports</Link>
      </nav>
      <main className="p-4">
        <Routes>
          <Route path="/" element={<div>Home Page</div>} />
          <Route path="/members" element={<div>Members Page</div>} />
          <Route path="/reports" element={<div>Reports Page</div>} />
        </Routes>
      </main>
    </div>
  )
}

export default App
