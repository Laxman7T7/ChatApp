import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import ChatBox from "@/components/ChatBox";

const App: React.FC = () => {
 return (
  <div className="min-h-screen bg-muted flex items-center justify-center p-6">
    <div className="w-full max-w-4xl"> {/* Controls width */}
      <ChatBox />
    </div>
  </div>
);


};

export default App;
