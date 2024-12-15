import Navbar from "./components/Navbar";

const Layout = ({ children }: { children: any }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <main className="max-w-&x1 mx-auto px-4 py-6">{children}</main>
    </div>
  );
};

export default Layout;