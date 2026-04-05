import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function UserLayout() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f8fafd" }}>
      <Header />
 
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
 
      <Footer />
    </div>
  );
}