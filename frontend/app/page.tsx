import { Header } from "@/components/Header";
import { Map } from "@/components/Map";

export default function Home() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <main className="flex-1 mt-16 relative">
        <Map />
      </main>
    </div>
  );
}
