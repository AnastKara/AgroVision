"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Bot, Send, X, MessageSquare, Lightbulb, Sprout, Droplets, Bug, TrendingUp } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const suggestions = [
  { icon: Droplets, text: "When should I irrigate?", color: "text-blue-500" },
  { icon: Bug, text: "What disease is this?", color: "text-red-500" },
  { icon: TrendingUp, text: "How can I improve yield?", color: "text-green-500" },
  { icon: Lightbulb, text: "Estimate my harvest", color: "text-yellow-500" },
];

const aiResponses: Record<string, string> = {
  irrigation: "Based on current soil moisture levels (68%) and the 7-day forecast showing 30% chance of rain, I recommend irrigating North Field and West Pasture tomorrow morning. The south meadow has adequate moisture at 72%. Consider delaying irrigation for Central Valley due to higher moisture content (85%).",
  disease: "To properly diagnose, I would need to analyze photos of the affected plants. However, based on the drone scan data from East Orchard showing a 45% health score and nitrogen levels at 35%, there are signs of nitrogen deficiency. The yellowing patterns suggest potential early blight. I recommend a foliar fungicide application and soil testing.",
  yield: "Here are my recommendations to improve your overall yield:\n\n1. **Optimize Irrigation**: Implement variable-rate irrigation based on soil moisture sensors\n2. **Nitrogen Management**: Apply split nitrogen applications - your current levels are suboptimal in East Orchard (35%)\n3. **Crop Rotation**: Consider rotating soybeans with corn in fields showing declining health\n4. **Precision Spraying**: Use drone-based targeted spraying to reduce chemical waste\n\nExpected improvement: 15-20% yield increase.",
  harvest: "Based on current field data:\n\n🌾 **Wheat (North Field)**: Expected 5,400 kg - Ready in ~2 weeks\n🌽 **Corn (South Meadow)**: Expected 4,200 kg - Ready in ~3 weeks\n🍎 **Apples (East Orchard)**: Expected 2,800 kg - Quality concerns\n🌿 **Soybeans (West Pasture)**: Expected 3,600 kg - Ready in ~4 weeks\n🌾 **Rice (Central Valley)**: Expected 6,200 kg - Ready in ~5 weeks\n\n**Total Estimated Harvest: 22,200 kg**\n**Estimated Revenue: $124,500**",
};

export default function AIPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your AI farming assistant. I can help you with irrigation scheduling, disease detection, yield optimization, and more. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (message?: string) => {
    const text = (message || input).trim();
    if (!text) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const lowerText = text.toLowerCase();
      let response = "";

      if (lowerText.includes("irrigat") || lowerText.includes("water") || lowerText.includes("moisture")) {
        response = aiResponses.irrigation;
      } else if (lowerText.includes("disease") || lowerText.includes("pest") || lowerText.includes("blight") || lowerText.includes("sick")) {
        response = aiResponses.disease;
      } else if (lowerText.includes("yield") || lowerText.includes("improve") || lowerText.includes("better")) {
        response = aiResponses.yield;
      } else if (lowerText.includes("harvest") || lowerText.includes("estimate") || lowerText.includes("revenue") || lowerText.includes("profit")) {
        response = aiResponses.harvest;
      } else {
        response = "I can help you with various farming topics:\n\n🌾 **Crop Management**: Irrigation, fertilization, pest control\n🐄 **Livestock**: Health monitoring, breeding, nutrition\n🚜 **Equipment**: Maintenance schedules, efficiency optimization\n🌤 **Weather**: Forecast analysis, risk assessment\n📊 **Analytics**: Yield prediction, financial planning\n\nWhat specific area would you like to explore?";
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Assistant</h1>
        <p className="text-muted-foreground mt-1">Your intelligent farming companion powered by AI</p>
      </div>

      {/* Suggestions */}
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, i) => (
          <button
            key={i}
            onClick={() => handleSend(suggestion.text)}
            className="glass px-4 py-2 rounded-xl text-sm flex items-center gap-2 hover:bg-muted/80 transition-all"
          >
            <suggestion.icon size={14} className={suggestion.color} />
            {suggestion.text}
          </button>
        ))}
      </div>

      {/* Chat Area */}
      <div className="relative">
        {/* Messages */}
        <Card className="h-[500px] overflow-hidden flex flex-col">
          <CardHeader className="border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Bot size={20} className="text-white" />
              </div>
              <div>
                <CardTitle className="text-base">AgriAI Assistant</CardTitle>
                <p className="text-xs text-muted-foreground">Online · Ready to help</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot size={14} className="text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-sm"
                      : "glass rounded-tl-sm"
                  }`}
                >
                  <p className="text-sm whitespace-pre-line leading-relaxed">{msg.content}</p>
                  <p className={`text-[10px] mt-2 ${msg.role === "user" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                {msg.role === "user" && (
                  <Avatar
                    fallback="AD"
                    size="sm"
                    className="mt-1"
                  />
                )}
              </motion.div>
            ))}

            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Bot size={14} className="text-white" />
                </div>
                <div className="glass rounded-2xl rounded-tl-sm p-4">
                  <div className="flex gap-1">
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      className="w-2 h-2 rounded-full bg-primary"
                    />
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      className="w-2 h-2 rounded-full bg-primary"
                    />
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      className="w-2 h-2 rounded-full bg-primary"
                    />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>
        </Card>

        {/* Input */}
        <div className="mt-4 flex gap-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask me anything about your farm..."
            className="flex-1"
          />
          <Button onClick={() => handleSend()} disabled={!input.trim() || isTyping}>
            <Send size={16} className="mr-1" />
            Send
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

