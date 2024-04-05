import React, { useState, useEffect } from "react";
import { API_URL } from "./api/api-client";
import "./App.css";

function App() {
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState("");

  const fetchData = async () => {
    try {
      const response = await fetch(API_URL);

      const data = await response.blob();

      const url = URL.createObjectURL(data);

      setImageUrl(url);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <h1 className='App'>Loading...</h1>;

  return (
    <div className='App'>
      <img
        src={imageUrl}
        alt='earth-map'
        style={{ width: "100%", height: "auto" }}
      />
    </div>
  );
}

export default App;

