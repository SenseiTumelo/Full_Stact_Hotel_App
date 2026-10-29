export default function Navbar() {
  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <a href="/" className="brand">STAY.</a>

        <nav className="nav-links" aria-label="Main">
          <a href="/" aria-current="page">Explore</a>
          <a href="#">My trips</a>
          <a href="#">About</a>
        </nav>

        <div className="nav-right">
          <a href="#">Help</a>
          <span className="avatar" aria-label="Account">T</span>
        </div>
      </div>
    </header>
  );
}