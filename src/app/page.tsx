import Navbar from '@/components/Navbar';
import Profile from '@/components/Profile';

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <Profile />
    </main>
  );
}
