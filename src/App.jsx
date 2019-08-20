import React from "react";

import Header from "./sections/Header";
import Navbar from "./sections/Navbar";
import Main from "./sections/Main";
import Sidebar from "./sections/Sidebar";

const App = () => {
  return (
    <div id="wrapper">
      <Header title="File Editor" />
      <Navbar />
      <Main />
      <Sidebar />
    </div>
  );
};

export default App;
