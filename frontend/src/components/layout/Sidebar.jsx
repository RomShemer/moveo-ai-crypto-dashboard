export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">Moveo</div>

      <nav className="sidebar-nav">
        <a className="active">Dashboard</a>
        <a>Markets</a>
        <a>AI Insights</a>
        <a>Settings</a>
      </nav>
    </aside>
  );
}
