import { Outlet, Link } from "react-router";

const Layout = () => {
  return (
    <>
      <nav className="m-2">
        <h2>SPINITRON STATS</h2>
      </nav>

      <Outlet />
    </>
  )
};

export default Layout;