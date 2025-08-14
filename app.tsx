import React from 'https://esm.sh/react@19.1.1';

const App: React.FC = () => {
  return (
    <main className="bg-gray-900 text-white min-h-screen flex items-center justify-center font-sans">
      <div className="text-center p-8 rounded-xl shadow-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700">
        <h1 className="text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-transparent bg-clip-text pb-2">
          Hello World
        </h1>
        <p className="mt-4 text-lg text-gray-300">
          This is your first React app, styled with Tailwind CSS.
        </p>
      </div>
    </main>
  );
};

export default App;