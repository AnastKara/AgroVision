"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "./theme-provider";
import {
  Search,
  Moon,
  Sun,
  Bell,
  MessageSquare,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { Avatar } from "./ui/avatar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export default function TopNav() {
  const { theme, toggleTheme } = useTheme();
  const [fullscreen, setFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-30 glass border-b border-border h-16 flex items-center justify-between px-4 lg:px-6 gap-4"
    >
      {/* Search */}
      <div className="flex-1 max-w-md hidden sm:block">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search fields, tasks, machinery..."
            className="pl-9 h-9 bg-muted/50 border-none rounded-xl text-sm"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* AI Assistant Quick Button */}
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-xl"
        >
          <MessageSquare size={18} />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full" />
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-xl"
        >
          <Bell size={18} />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full text-[10px] text-white flex items-center justify-center font-bold">
            3
          </span>
        </Button>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-xl"
        >
          {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </Button>

        {/* Fullscreen */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleFullscreen}
          className="rounded-xl hidden md:flex"
        >
          {fullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </Button>

        {/* Profile */}
        <div className="flex items-center gap-2 ml-2 pl-2 border-l border-border">
          <Avatar
            fallback="AD"
            size="sm"
            className="ring-2 ring-primary/20"
          />
          <div className="hidden lg:block">
            <p className="text-sm font-medium leading-none">Alex Driver</p>
            <p className="text-xs text-muted-foreground mt-0.5">Farm Manager</p>
          </div>
        </div>
      </div>
    </motion.header>
  );
}

