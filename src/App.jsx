import { useState } from "react";
import "./App.css";
import Header from "./components/header/Header";
import PackageForm from "./components/packageform/PackageForm";

function App() {
  return (
    <>
      <Header />
      <PackageForm />
    </>
  );
}

export default App;
