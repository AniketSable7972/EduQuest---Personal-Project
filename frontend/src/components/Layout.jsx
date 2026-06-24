import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <>
      <Navbar />
      <main style={{ padding: '2rem 0', minHeight: 'calc(100vh - 64px)' }}>
        <div className="container">{children}</div>
      </main>
    </>
  );
}
