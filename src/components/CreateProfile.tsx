import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useUser } from "../context/AuthContext"; // Import useUser
import { useNavigate } from "react-router-dom"; // Import useNavigate

const CreateProfile: React.FC = () => {
  const [name, setName] = useState("");
  const { setUserName } = useUser();
  const navigate = useNavigate(); // Get navigate function

  const handleSubmit = () => {
    if (name.trim()) {
      setUserName(name); // Store username in context
      navigate("/chat-dashboard"); // Redirect to ChatAppDashboard
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="p-6 rounded-2xl shadow-lg w-80 text-center border border-gray-300">
        <h1 className="text-xl font-semibold mb-4">Username should be unique</h1>
        <Input
          type="text"
          placeholder="Add unique username"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button
          onClick={handleSubmit}
          className="mt-4 w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
        >
          Submit
        </Button>
      </div>
    </div>
  );
};

export default CreateProfile;