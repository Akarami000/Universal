import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { collection, addDoc, Timestamp, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebaseConfig"; 
import { useUser } from "../context/AuthContext";
import Popup from "../common/errorPop";
import { Input } from "./ui/input";

const ChatAppDashboard = () => {
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState<{ id: string; text: string; sender: string; timestamp: any }[]>([]);
    const {userName} = useUser();
    const [showPopup, setShowPopup] = useState(false);
    const [showGroupPopup, setShowGroupPopup] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [groups, setGroups] = useState<{ id: string; name: string }[]>([]);


  
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "groups"), (snapshot) => {
            const groupList = snapshot.docs.map(doc => ({
                id: doc.id,
                name: doc.data().name,
            }));
            setGroups(groupList);
        });

        return () => unsubscribe();
    }, []);
  
    // Fetch Messages in Real-time
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

        return () => unsubscribe(); // Cleanup listener on unmount
    }, [selectedGroup]);

    const handleCreateGroup = async () => {
        if (!groupName.trim()) return;

        try {
            await addDoc(collection(db, "groups"), {
                name: groupName,
                createdAt: Timestamp.now(),
            });
            setGroupName("");
            setShowGroupPopup(false);
        } catch (error) {
            console.error("Error creating group:", error);
        }
    };

    
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            handleSendMessage();
        }
      };
    const handleSendMessage = async () => {
        console.log("handleSendMessage called");
        console.log("Firestore DB:", db);
        if (!message.trim() || !selectedGroup) {
            console.warn("Message or selected group is missing!", { message, selectedGroup });
            return;
        }
    
        try {
    
           if(userName){
             const docRef = await addDoc(collection(db, "groups", selectedGroup, "messages"), {
                text: message,
                sender:userName,
                timestamp: Timestamp.now(),
            });
          
    
            console.log("Message sent successfully! Document ID:", docRef.id);
            setMessage("");} // Clear input
            else if(!userName){
                setShowPopup(true);
            }
        } catch (error) {
            console.error("Error sending message:", error);
            // Handle the error appropriately (e.g., display an error message to the user)
        }
    };
    

    return   (
        <div className="h-screen flex flex-col md:flex-row">
            {/* Sidebar - Show Groups List */}
            <div className={`w-full md:w-1/4 p-4 border-b md:border-r border-gray-300 bg-gray-100 ${selectedGroup ? 'hidden md:block' : ''}`}>
            <Button
                disabled={!userName}
                className={`w-full mb-4 p-2 rounded-lg ${
                    !userName
                    ? "bg-gray-400 text-gray-700 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
                onClick={() => setShowGroupPopup(true)}
                >
                + Create Group
            </Button>
                <input
                    type="text"
                    placeholder="Search Groups..."
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="mt-4 p-2 bg-white rounded-lg shadow">
                    {groups.map((group, index) => (
                        <p
                            key={index}
                            className="text-gray-600 mb-3 text-left rtl:text-right border-b-[0.5px] border-gray-300 cursor-pointer p-2 hover:bg-gray-200"
                            onClick={() => {
                                console.log("Selected group:", group);
                                setSelectedGroup(group.name);
                            }}
                        >
                            {group.name}
                        </p>
                    ))}
                </div>
            </div>

            {/* Chat Panel - Display Only When Group is Selected */}
            {selectedGroup && (
                <div className="w-full md:w-3/4 flex flex-col">
                    {/* Chat Header */}
                    <div className="p-4 border-b border-gray-300 bg-white flex justify-between items-center">
                        <h2 className="text-xl font-semibold">{selectedGroup}</h2>
                        <Button className="md:hidden" onClick={() => setSelectedGroup(null)}>Back</Button>
                    </div>

                    {/* Chat Messages Section */}
                    <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col md:min-h-[60vh] min-h-[80vh]">                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`mb-4 p-3 shadow rounded-lg max-w-sm ${
                                    msg.sender === userName ? "self-end bg-blue-100" : "self-start bg-white"
                                }`}
                            >
                                <p><strong>{msg.sender}:</strong> {msg.text}</p>
                                <p className="text-xs text-gray-500">
                                    {msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleTimeString() : "Invalid timestamp"}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-t border-gray-300 bg-white flex items-center">
                        <Input
                            type="text"
                            placeholder="Type a message..."
                            value={message}
                            onKeyDown={handleKeyDown}
                            onChange={(e) => setMessage(e.target.value)}
                            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <Button  onClick={handleSendMessage} className="ml-2 bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600">
                            Send
                        </Button>
                    </div>
                </div>
            )}
           <Popup isOpen={showPopup} onClose={() => setShowPopup(false)} />
           {showGroupPopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-semibold mb-4">Create a New Group</h2>
                        <Input
                            type="text"
                            placeholder="Enter group name"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex justify-end mt-4">
                            <Button 
                                className="mr-2 bg-gray-300 text-gray-700 p-2 rounded-lg"
                                onClick={() => setShowGroupPopup(false)}
                            >
                                Cancel
                            </Button>
                            <Button 
                                className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600"
                                onClick={handleCreateGroup}
                            >
                                Create
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>)
   
};

export default ChatAppDashboard;