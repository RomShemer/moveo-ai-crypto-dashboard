export default function Sidebar() {
  function scrollTo(id) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">Crypto advisor </div>

      <nav className="sidebar-nav">
        <a className="active">Dashboard</a>
        <button onClick={() => scrollTo("assets")}>Assets</button>
        <button onClick={() => scrollTo("news")}>Market News</button>
        <button onClick={() => scrollTo("ai-insight")}>AI Insights</button>
        <button onClick={() => scrollTo("meme")}>Fun</button>
      </nav>
    </aside>
  );
}
