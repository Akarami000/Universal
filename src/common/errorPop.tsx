import React from "react";
import { Button } from "../components/ui/button";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const Popup: React.FC<PopupProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
        <h2 className="text-lg font-semibold mb-3">You need a username to participate</h2>
        <p className="text-sm text-gray-600 mb-4">
          Please enter a username or{" "}
          <Link to="/" className="text-blue-500 underline">
            Sign in
          </Link>{" "}
          to continue.
        </p>
        <Button onClick={onClose} className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">
          Okay
        </Button>
      </div>
    </div>,
    document.body
  );
};

export default Popup;