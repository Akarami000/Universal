import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { collection, query, orderBy, onSnapshot, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { useUser } from "./AuthContext"; // Import User Context

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: any;
}

interface FirestoreContextType {
  messages: Message[];
  sendMessage: (groupId: string, message: string) => Promise<void>;
}

const FirestoreContext = createContext<FirestoreContextType | undefined>(undefined);

export const FirestoreProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const { userName } = useUser(); // Get username from context
  const selectedGroup = "Group1";

  useEffect(() => {
    if (!selectedGroup) return;

    const messagesQuery = query(
      collection(db, "groups", selectedGroup, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const messagesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        text: doc.data().text,
        sender: doc.data().sender,
        timestamp: doc.data().timestamp,
      }));
      setMessages(messagesData);
    });

    return () => unsubscribe();
  }, [selectedGroup]);

  const sendMessage = async (groupId: string, message: string) => {
    if (!message.trim() || !userName) return;

    try {
      await addDoc(collection(db, "groups", groupId, "messages"), {
        text: message,
        sender: userName, // Use the username from context
        timestamp: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <FirestoreContext.Provider value={{ messages, sendMessage }}>
      {children}
    </FirestoreContext.Provider>
  );
};

// Custom Hook to use FirestoreContext
export const useFirestore = () => {
  const context = useContext(FirestoreContext);
  if (!context) throw new Error("useFirestore must be used within a FirestoreProvider");
  return context;
};