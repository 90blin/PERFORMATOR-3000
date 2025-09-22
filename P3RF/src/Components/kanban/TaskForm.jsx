import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Task } from "@/entities/all";
import {
  Plus,
  X,
  Save,
  Zap,
  Tag as TagIcon,
  Calendar,
  CheckSquare,
  Timer,
  Link2,
  Image,
  Target
} from "lucide-react";

const colorOptions = [
  { name: 'gray', bg: 'bg-gray-400' },
  { name: 'red', bg: 'bg-red-500' },
  { name: 'orange', bg: 'bg-orange-500' },
  { name: 'yellow', bg: 'bg-yellow-400' },
  { name: 'green', bg: 'bg-green-500' },
  { name: 'blue', bg: 'bg-blue-500' },
  { name: 'purple', bg: 'bg-purple-500' }
];

export default function TaskForm({ task, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: task?.title || "",
    description: task?.description || "",
    status: task?.status || "todo",
    color: task?.color || "gray",
    tags: task?.tags || [],
    due_date: task?.due_date || "",
    priority: task?.priority || "medium",
    estimated_pomodoros: task?.estimated_pomodoros || 1,
    exp_value: task?.exp_value || 25,
    checklist_items: task?.checklist_items || [],
    estimated_time: task?.estimated_time || 25,
    image_url: task?.image_url || "",
    master_card_id: task?.master_card_id || "",
    is_complete: task?.is_complete || false,
    ...(task?.id && { id: task.id })
  });
  
  const [newTag, setNewTag] = useState("");
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [masterCards, setMasterCards] = useState([]);
  const [activeSections, setActiveSections] = useState([]);
  
  useEffect(() => {
    if(formData.status !== 'master') {
      const fetchMasterCards = async () => {
        try {
          const cards = await Task.filter({ status: 'master' });
          setMasterCards(cards);
        } catch (error) {
          console.error("Failed to fetch master cards", error);
        }
      };
      fetchMasterCards();
    }
  }, [formData.status]);

  const calculateExpValue = (pomodoros) => {
    return pomodoros * 25;
  };

  const calculateEstimatedTime = (pomodoros) => {
    return pomodoros * 25;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanedData = {
      ...formData,
      tags: formData.tags || [],
      checklist_items: formData.checklist_items || [],
      master_card_id: formData.master_card_id === "" ? null : formData.master_card_id,
      due_date: formData.due_date === "" ? null : formData.due_date,
      image_url: formData.image_url === "" ? null : formData.image_url
    };
    
    Object.keys(cleanedData).forEach(key => {
      if (typeof cleanedData[key] === 'string' && cleanedData[key].trim() === "") {
        cleanedData[key] = null;
      }
    });
    
    onSubmit(cleanedData);
  };

  const handlePomodoroChange = (pomodoros) => {
    const newPomodoros = Math.max(1, parseInt(pomodoros) || 1);
    setFormData(prev => ({
      ...prev,
      estimated_pomodoros: newPomodoros,
      exp_value: calculateExpValue(newPomodoros),
      estimated_time: calculateEstimatedTime(newPomodoros)
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !(formData.tags || []).includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(tag => tag !== tagToRemove)
    }));
  };

  const addChecklistItem = () => {
    if (newChecklistItem.trim()) {
      const checklistId = `cl-${Date.now()}`;
      const newItem = { id: checklistId, text: newChecklistItem.trim(), completed: false };

      setFormData(prev => ({
        ...prev,
        checklist_items: [...(prev.checklist_items || []), newItem]
      }));
      setNewChecklistItem("");
    }
  };

  const removeChecklistItem = (index) => {
    setFormData(prev => ({
      ...prev,
      checklist_items: (prev.checklist_items || []).filter((_, i) => i !== index)
    }));
  };

  const updateChecklistItem = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      checklist_items: (prev.checklist_items || []).map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleImageUrlChange = (e) => {
    setFormData(prev => ({ ...prev, image_url: e.target.value }));
  };

  const clearImageUrl = () => {
    setFormData(prev => ({ ...prev, image_url: "" }));
  };

  const sectionIcons = [
    { id: "priority", icon: Target, label: "Priority" },
    { id: "tags", icon: TagIcon, label: "Tags" },
    { id: "checklist", icon: CheckSquare, label: "Checklist" },
    { id: "schedule", icon: Calendar, label: "Schedule" },
    { id: "pomodoro", icon: Timer, label: "Pomodoro" },
    { id: "image", icon: Image, label: "Image" },
    { id: "link", icon: Link2, label: "Link Master" }
  ];

  const toggleSection = (sectionId) => {
    setActiveSections(prev => 
        prev.includes(sectionId) 
            ? prev.filter(id => id !== sectionId)
            : [...prev, sectionId]
    );
  };

  return (
    <Card className="w-full max-w-7xl max-h-[90vh] mx-auto shadow-2xl rounded-2xl border-0 bg-slate-50 dark:bg-gray-900 relative overflow-hidden flex flex-col">
       <Button 
          variant="ghost" 
          size="icon" 
          onClick={onCancel} 
          className="absolute text-white bg-red-500 hover:bg-red-600 rounded-full z-10 w-8 h-8"
          style={{ top: '-10px', right: '-10px' }}
        >
          <X className="w-5 h-5" />
        </Button>

      <CardHeader className="bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-t-2xl py-2 flex-shrink-0">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          Card Settings
          <Zap className="w-4 h-4" />
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0 flex-grow overflow-hidden">
        <form onSubmit={handleSubmit} className="h-full flex flex-col">
          <div className="grid grid-cols-12 flex-grow min-h-0">
            
            {/* Left Side: Description Only */}
            <div className="col-span-12 lg:col-span-5 flex flex-col border-r border-gray-200 dark:border-gray-800">
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Add details about this quest..."
                  className="flex-grow w-full h-full p-6 resize-none border-0 rounded-none bg-slate-50 dark:bg-gray-900 focus-visible:ring-0"
                />
            </div>

            {/* Right Side: All other fields */}
            <div className="col-span-12 lg:col-span-7 p-6 space-y-4 overflow-y-auto">
              {/* Title */}
              <div>
                <Label htmlFor="title" className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Quest Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="What quest awaits?"
                  className="mt-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-lg"
                  required
                />
              </div>
              
              {/* Master Card Color Selection */}
              {formData.status === 'master' && (
                <div>
                  <Label className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Master Card Color</Label>
                  <div className="flex gap-2 mt-2">
                    {colorOptions.map((opt) => (
                      <button
                        key={opt.name}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, color: opt.name }))}
                        className={`w-6 h-6 rounded-full ${opt.bg} transition-transform duration-200 hover:scale-110 ${
                          formData.color === opt.name ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-gray-900' : ''
                        }`}
                        aria-label={`Select color ${opt.name}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Section Icons */}
              <div>
                <Label className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Card Features</Label>
                <div className="flex gap-2 mt-2">
                  {sectionIcons.map((section) => (
                    <Button
                      key={section.id}
                      type="button"
                      variant={activeSections.includes(section.id) ? "default" : "outline"}
                      onClick={() => toggleSection(section.id)}
                      className={`p-3 rounded-lg transition-all duration-200 ${
                        activeSections.includes(section.id) 
                          ? 'bg-purple-500 text-white hover:bg-purple-600'
                          : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <section.icon className="w-5 h-5" />
                    </Button>
                  ))}
                </div>
              </div>

              {/* Active Section Panel */}
              <div className="space-y-4">
                {activeSections.includes('priority') && (
                  <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <CardContent className="p-4">
                        <Label className="font-semibold text-gray-700 dark:text-gray-300 text-sm">Priority</Label>
                        <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                          <SelectTrigger className="mt-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low Priority</SelectItem>
                            <SelectItem value="medium">Medium Priority</SelectItem>
                            <SelectItem value="high">High Priority</SelectItem>
                            <SelectItem value="critical">Critical Priority</SelectItem>
                          </SelectContent>
                        </Select>
                    </CardContent>
                  </Card>
                )}

                {activeSections.includes('tags') && (
                  <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Input
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            placeholder="Add tag..."
                            className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                          />
                          <Button type="button" onClick={addTag} className="px-4 bg-purple-500 hover:bg-purple-600 text-white">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(formData.tags || []).map((tag, index) => (
                            <Badge key={index} className="bg-purple-200 text-purple-800 dark:bg-purple-700 dark:text-purple-200 rounded-full px-3 py-1">
                              {tag}
                              <button type="button" onClick={() => removeTag(tag)} className="ml-2 hover:text-red-600">
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeSections.includes('checklist') && (
                  <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Input
                            value={newChecklistItem}
                            onChange={(e) => setNewChecklistItem(e.target.value)}
                            placeholder="Add checklist item..."
                            className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addChecklistItem())}
                          />
                          <Button type="button" onClick={addChecklistItem} className="px-4 bg-green-500 hover:bg-green-600 text-white">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {(formData.checklist_items || []).map((item, index) => (
                            <div key={item.id || index} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <Checkbox
                                checked={item.completed}
                                onCheckedChange={(checked) => updateChecklistItem(index, 'completed', checked)}
                                className="flex-shrink-0"
                              />
                              <Input
                                value={item.text}
                                onChange={(e) => updateChecklistItem(index, 'text', e.target.value)}
                                className="flex-1 border-0 bg-transparent focus:bg-white dark:focus:bg-gray-600 rounded text-sm"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeChecklistItem(index)}
                                className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded w-8 h-8 flex-shrink-0"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeSections.includes('schedule') && (
                  <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <CardContent className="p-4">
                      <div>
                        <Label className="font-medium text-gray-700 dark:text-gray-300 text-sm">Due Date</Label>
                        <Input
                          type="datetime-local"
                          value={formData.due_date}
                          onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                          className="mt-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeSections.includes('pomodoro') && (
                  <Card className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label className="font-medium text-gray-700 dark:text-gray-400 text-xs">Pomodoros 🍅</Label>
                          <Input
                            type="number"
                            value={formData.estimated_pomodoros}
                            onChange={(e) => handlePomodoroChange(e.target.value)}
                            className="mt-1 rounded-lg border bg-white dark:bg-gray-800 text-sm"
                            min="1"
                            max="20"
                          />
                        </div>
                        <div>
                          <Label className="font-medium text-gray-700 dark:text-gray-400 text-xs">Time</Label>
                          <Input
                            value={`${formData.estimated_time}m`}
                            disabled
                            className="mt-1 rounded-lg border bg-gray-100 dark:bg-gray-700 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="font-medium text-gray-700 dark:text-gray-400 text-xs">XP</Label>
                          <Input
                            value={`${formData.exp_value}`}
                            disabled
                            className="mt-1 rounded-lg border bg-gray-100 dark:bg-gray-700 text-sm"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeSections.includes('image') && (
                  <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Input
                            type="url"
                            value={formData.image_url}
                            onChange={handleImageUrlChange}
                            placeholder="Paste image URL..."
                            className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                          />
                          {formData.image_url && (
                            <Button type="button" onClick={clearImageUrl} variant="ghost" size="icon" className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg h-10">
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        {formData.image_url && (
                          <div className="mt-2 h-24 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden">
                            <img 
                              src={formData.image_url} 
                              alt="Quest Thumbnail" 
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeSections.includes('link') && formData.status !== 'master' && masterCards.length > 0 && (
                  <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <CardContent className="p-4">
                      <div>
                        <Label className="font-medium text-gray-700 dark:text-gray-300 text-sm">Link to Master Card</Label>
                        <Select value={formData.master_card_id || ""} onValueChange={(value) => setFormData(prev => ({ ...prev, master_card_id: value === "null" ? null : value }))}>
                          <SelectTrigger className="mt-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800">
                            <SelectValue placeholder="Select a master card..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="null">None</SelectItem>
                            {masterCards.map(mc => (
                              <SelectItem key={mc.id} value={mc.id}>{mc.title}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-800 flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-bold shadow-lg"
            >
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}