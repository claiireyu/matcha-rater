// App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Header from './Header';
import Camera from './Camera';
import Gallery from './Gallery';

const AppLayout = () => (
  <>
    <Header />
    <main>
      <Outlet />
    </main>
  </>
);

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Camera />} />
          <Route path="/gallery" element={<Gallery />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
