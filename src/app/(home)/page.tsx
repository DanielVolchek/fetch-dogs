import { Login } from "./components/login";

// Server rendered home page component
export default function Home() {
  return (
    <>
      <main className="relative h-[80vh] w-screen">
        {/* Background image layer */}
        <div className="bg-hero absolute inset-0 bg-cover bg-center bg-no-repeat" />
        {/* Overlay filter layer */}
        <div className="absolute inset-0 bg-blue-600 opacity-20" />
        {/* Content layer */}
        <div className="relative z-10 flex justify-between">
          <h1 className="inline-block text-6xl text-white">
            Help us find homes for amazing dogs
          </h1>
          <Login />
        </div>
      </main>
    </>
  );
}
