import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { User } from "@/entities/all";
import { 
  User as UserIcon, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Upload,
  BarChart3,
  Package,
  UserCircle,
  Target,
  Activity,
  Timer,
  Moon,
  Sun,
  Cog,
  Play,
  Pause
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { UploadFile } from "@/integrations/Core";
import { AnimatePresence, motion } from "framer-motion";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

import StatusSummary from "./components/dashboard/StatusSummary";
import PomodoroTimer from "./components/pomodoro/PomodoroTimer";
import StatsTab from "./components/gamification/StatsTab";
import InventoryTab from "./components/gamification/InventoryTab";
import CharacterTab from "./components/gamification/CharacterTab";
import GoalsTab from "./components/gamification/GoalsTab";

const racaOptions = ["Human", "Elf", "Dwarf", "Orc", "Halfling"];
const classeOptions = ["Warrior", "Mage", "Rogue", "Paladin", "Archer"];
const moodOptions = ["😊", "😎", "🤔", "😤", "🥳", "😴", "🔥"];

const defaultSidebarIcons = [
  { id: "stats", label: "Stats", icon: BarChart3, modal: false },
  { id: "inventory", label: "Inventory", icon: Package, modal: false },
  { id: "character", label: "Character", icon: UserCircle, modal: false },
  { id: "goals", label: "Goals", icon: Target, modal: false },
  { id: "status", label: "Status", icon: Activity, modal: false },
  { id: "pomodoro", label: "Pomodoro", icon: Timer, modal: false },
  { id: "settings", label: "Settings", icon: Settings, modal: false },
];

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showCharacterSettings, setShowCharacterSettings] = useState(false);
  const [characterData, setCharacterData] = useState({
    character_name: "",
    raca: "",
    idade: 25,
    classe: "",
    mood: "😊",
    profile_picture_url: ""
  });
  const [isUploading, setIsUploading] = useState(false);
  const [activeSidebarView, setActiveSidebarView] = useState(null);
  const [hoveredIcon, setHoveredIcon] = useState(null);
  const [sidebarIcons, setSidebarIcons] = useState(defaultSidebarIcons);

  useEffect(() => {
    loadUserData();
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await User.me();
      if (!currentUser) return;
      setUser(currentUser);
      
      if (currentUser.sidebar_icon_order && currentUser.sidebar_icon_order.length === defaultSidebarIcons.length) {
        const orderedIcons = currentUser.sidebar_icon_order
          .map(id => defaultSidebarIcons.find(icon => icon.id === id))
          .filter(Boolean);
        setSidebarIcons(orderedIcons);
      } else {
        setSidebarIcons(defaultSidebarIcons);
      }
      
      setCharacterData({
        character_name: currentUser.character_name || "Unnamed Hero",
        raca: currentUser.raca || "",
        idade: currentUser.idade || 25,
        classe: currentUser.classe || "",
        mood: currentUser.mood || "😊",
        profile_picture_url: currentUser.profile_picture_url || ""
      });
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const handleUserUpdate = async (updates) => {
    try {
      if(!user) return;
      await User.updateMyUserData(updates);
      setUser(prev => ({ ...prev, ...updates }));
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const handleCharacterUpdate = async (updates) => {
    try {
      if(!user) return;
      await User.updateMyUserData(updates);
      setUser(prev => ({ ...prev, ...updates }));
      setCharacterData(prev => ({ ...prev, ...updates }));
    } catch (error) {
      console.error("Error updating character data:", error);
    }
  };

  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      await handleCharacterUpdate({ profile_picture_url: file_url });
    } catch (error) {
      console.error("Error uploading profile picture:", error);
    }
    setIsUploading(false);
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  
  const handleIconClick = (icon) => {
    setActiveSidebarView(prev => prev === icon.id ? null : icon.id);
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    
    const items = Array.from(sidebarIcons);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setSidebarIcons(items);
    
    const newOrder = items.map(icon => icon.id);
    try {
      await User.updateMyUserData({ sidebar_icon_order: newOrder });
    } catch (error) {
      console.error("Failed to save icon order:", error);
    }
  };

  return (
    <SidebarProvider>
      <div 
        className={`h-screen grid w-full transition-all duration-300 overflow-hidden ${isDarkMode ? 'bg-gray-900' : 'bg-slate-100'}`}
        style={{
          gridTemplateColumns: sidebarCollapsed ? '4rem 1fr' : '12rem 1fr'
        }}
      >
        <Sidebar className={`border-r-2 shadow-xl backdrop-blur-md transition-all duration-300 flex flex-col overflow-visible ${sidebarCollapsed ? 'w-16' : 'w-48'} ${isDarkMode ? 'border-gray-800 bg-gray-900/90' : 'border-slate-200 bg-white/90'}`}>
          <SidebarHeader className={`transition-colors duration-300`}>
              <div 
                className="relative group cursor-pointer w-full aspect-square"
                onClick={() => !sidebarCollapsed && setShowCharacterSettings(true)}
              >
                <div className={`w-full h-full transition-all duration-300 transform scale-110 ${!sidebarCollapsed ? 'group-hover:blur-sm' : ''}`}>
                  {characterData.profile_picture_url ? (
                    <img 
                      src={characterData.profile_picture_url} 
                      alt="Profile"
                      className="w-full h-full object-cover shadow-lg"
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-slate-200'}`}>
                      <UserIcon className={`w-1/2 h-1/2 ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`} />
                    </div>
                  )}
                </div>
                {!sidebarCollapsed && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Settings className="w-6 h-6 text-white drop-shadow-lg" />
                  </div>
                )}
              </div>

            {!sidebarCollapsed && (
              <div className={`text-left space-y-1 mt-4 p-2 border-b-2 ${isDarkMode ? 'border-gray-800' : 'border-slate-200'}`}>
                <div className={`font-bold text-base text-left ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                  {characterData.character_name}
                </div>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <div className={`p-1 rounded-md ${isDarkMode ? 'bg-gray-800' : 'bg-slate-200'}`}>
                    <div className={`${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{characterData.raca || "—"}</div>
                  </div>
                  <div className={`p-1 rounded-md ${isDarkMode ? 'bg-gray-800' : 'bg-slate-200'}`}>
                    <div className={`${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{characterData.idade}</div>
                  </div>
                  <div className={`p-1 rounded-md ${isDarkMode ? 'bg-gray-800' : 'bg-slate-200'}`}>
                    <div className={`${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{characterData.classe || "—"}</div>
                  </div>
                  <div className={`p-1 rounded-md ${isDarkMode ? 'bg-gray-800' : 'bg-slate-200'}`}>
                    <div className="text-md">{characterData.mood}</div>
                  </div>
                </div>
              </div>
            )}
          </SidebarHeader>
          
          <SidebarContent className="p-2 flex-grow flex flex-col">
            <SidebarGroup className="flex-shrink-0">
              <SidebarGroupContent>
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="sidebar-icons" direction={sidebarCollapsed ? "vertical" : "horizontal"}>
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={sidebarCollapsed ? 'flex flex-col gap-1' : 'grid grid-cols-5 gap-1'}
                      >
                        {sidebarIcons.map((item, index) => (
                          <Draggable key={item.id} draggableId={item.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <Button
                                  variant={activeSidebarView === item.id ? "secondary" : "ghost"}
                                  onClick={() => handleIconClick(item)}
                                  onMouseEnter={() => setHoveredIcon(item.label)}
                                  onMouseLeave={() => setHoveredIcon(null)}
                                  className={`p-1 rounded-lg transition-all duration-300 flex items-center justify-center ${sidebarCollapsed ? 'w-full h-10' : 'h-8 w-full'} ${isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-slate-200 text-slate-700'}`}
                                >
                                  <item.icon className={sidebarCollapsed ? "w-4 h-4" : "w-3 h-3"} />
                                </Button>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </SidebarGroupContent>
            </SidebarGroup>

            {!sidebarCollapsed && (
              <div className="flex-shrink-0 h-6 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {hoveredIcon && (
                    <motion.div
                      key={hoveredIcon}
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-slate-700'}`}
                    >
                      {hoveredIcon}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            
            <div className="flex-1 overflow-hidden">
              <AnimatePresence>
                {activeSidebarView && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "100%" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="h-full"
                  >
                    <div className={`rounded-xl border h-full flex flex-col ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200'}`}>
                        {activeSidebarView === 'stats' && user && (
                          <div className="p-2 overflow-y-auto flex-1">
                            <StatsTab user={user} tasks={tasks} />
                          </div>
                        )}
                        {activeSidebarView === 'inventory' && user && (
                          <div className="p-2 overflow-y-auto flex-1">
                            <InventoryTab 
                              user={user} 
                              onUpdateUser={handleUserUpdate}
                            />
                          </div>
                        )}
                        {activeSidebarView === 'character' && user && (
                          <div className="p-2 overflow-y-auto flex-1">
                            <CharacterTab user={user} />
                          </div>
                        )}
                        {activeSidebarView === 'goals' && user && (
                          <div className="p-2 overflow-y-auto flex-1">
                            <GoalsTab 
                              user={user} 
                              tasks={tasks}
                              onUpdateUser={handleUserUpdate}
                            />
                          </div>
                        )}
                        {activeSidebarView === 'status' && user && (
                          <div className="p-2 overflow-y-auto flex-1">
                            <StatusSummary tasks={tasks} user={user} isExpanded={true} />
                          </div>
                        )}
                        {activeSidebarView === 'pomodoro' && user && (
                          <div className="p-2 overflow-y-auto flex-1">
                            <PomodoroTimer user={user} onUpdateUser={handleUserUpdate} onSessionComplete={()=>{}} />
                          </div>
                        )}
                        {activeSidebarView === 'settings' && (
                          <div className="p-2 overflow-y-auto flex-1">
                            <div className={`rounded-lg p-3 transition-all duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-slate-200'}`}>
                              <div className="flex items-center justify-between">
                                <Label className={`font-semibold text-sm flex items-center gap-2 ${isDarkMode ? 'text-gray-200' : 'text-slate-800'}`}>
                                  {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                                  {isDarkMode ? 'Night Mode' : 'Day Mode'}
                                </Label>
                                <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
                              </div>
                            </div>
                          </div>
                        )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </SidebarContent>

          <SidebarFooter className={`border-t-2 p-1 transition-colors duration-300 ${isDarkMode ? 'border-gray-800' : 'border-slate-200'}`}>
            <Button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              variant="ghost"
              className={`w-full p-1 rounded-lg transition-all duration-300 h-8 ${isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-slate-200 text-slate-700'}`}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </Button>
          </SidebarFooter>
        </Sidebar>

        <main className="flex flex-col relative overflow-hidden">
          <header className={`backdrop-blur-md border-b px-4 py-2 shadow-sm md:hidden transition-colors duration-300 ${isDarkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-slate-100/80 border-slate-200'}`}>
            <div className="flex items-center gap-3">
              <SidebarTrigger className={`p-2 rounded-lg transition-all duration-300 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-slate-200'}`} />
              <h1 className={`text-lg font-bold transition-colors duration-300 ${isDarkMode ? 'text-gray-100' : 'text-slate-900'}`}>PERFORMATOR 0.3</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {React.cloneElement(children, { 
              tasks, 
              setTasks, 
              user, 
              setUser, 
              sidebarCollapsed 
            })}
          </div>
        </main>
      </div>

      <Dialog open={showCharacterSettings} onOpenChange={setShowCharacterSettings}>
        <DialogContent className={`${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-slate-200'}`}>
          <DialogHeader>
            <DialogTitle className={`${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Character Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Profile Picture</Label>
              <div className="flex items-center gap-4 mt-2">
                <div className="w-16 h-16 border-2 overflow-hidden bg-slate-200">
                  {characterData.profile_picture_url ? (
                    <img 
                      src={characterData.profile_picture_url} 
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <UserIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <label className="cursor-pointer">
                  <Button variant="outline" disabled={isUploading} asChild>
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      {isUploading ? 'Uploading...' : 'Upload'}
                    </div>
                  </Button>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleProfilePictureUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                </label>
              </div>
            </div>

            <div>
              <Label className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Character Name</Label>
              <Input
                value={characterData.character_name}
                onChange={(e) => setCharacterData(prev => ({ ...prev, character_name: e.target.value }))}
                className="mt-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Raça</Label>
                <Select
                  value={characterData.raca}
                  onValueChange={(value) => setCharacterData(prev => ({ ...prev, raca: value }))}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select race" />
                  </SelectTrigger>
                  <SelectContent className={`${isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'}`}>
                    {racaOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Idade</Label>
                <Input
                    type="number"
                    value={characterData.idade}
                    onChange={(e) => setCharacterData(prev => ({ ...prev, idade: parseInt(e.target.value) || 0 }))}
                    className="mt-2"
                    min="0"
                    max="99"
                />
              </div>

              <div>
                <Label className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Classe</Label>
                <Select
                  value={characterData.classe}
                  onValueChange={(value) => setCharacterData(prev => ({ ...prev, classe: value }))}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent className={`${isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'}`}>
                    {classeOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Mood</Label>
                <Select
                  value={characterData.mood}
                  onValueChange={(value) => setCharacterData(prev => ({ ...prev, mood: value }))}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={`${isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'}`}>
                    {moodOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={() => {
                handleCharacterUpdate(characterData);
                setShowCharacterSettings(false);
              }}
              className="w-full"
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}