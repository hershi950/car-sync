import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, ChevronDown } from "lucide-react";
import { teamMemberService } from "@/services/teamMemberService";
import { useToast } from "@/hooks/use-toast";

interface TeamMember {
  id: string;
  name: string;
  created_at: string;
}

interface NameSelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onValidationChange?: (isValid: boolean) => void;
}

export function NameSelector({ value, onChange, placeholder = "Select or type a name", onValidationChange }: NameSelectorProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [suggestions, setSuggestions] = useState<TeamMember[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newName, setNewName] = useState("");
  const [selectedForDeletion, setSelectedForDeletion] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadTeamMembers();
  }, []);

  useEffect(() => {
    if (value) {
      // Exact sequence filtering - name must start with the typed value
      const filtered = teamMembers.filter(member =>
        member.name.toLowerCase().startsWith(value.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions(teamMembers); // Show all when empty
    }
  }, [value, teamMembers]);

  // Validation effect
  useEffect(() => {
    const isValid = value === "" || teamMembers.some(member => 
      member.name.toLowerCase() === value.toLowerCase()
    );
    onValidationChange?.(isValid);
  }, [value, teamMembers, onValidationChange]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadTeamMembers = async () => {
    try {
      const members = await teamMemberService.list();
      setTeamMembers(members);
    } catch (error) {
      console.error("Failed to load team members:", error);
      toast({
        title: "Error",
        description: "Failed to load team members",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (name: string) => {
    onChange(name);
    setShowSuggestions(false);
  };

  const handleAddName = async () => {
    if (!newName.trim()) return;

    const existingMember = teamMembers.find(
      member => member.name.toLowerCase() === newName.toLowerCase()
    );

    if (existingMember) {
      toast({
        title: "Duplicate Name",
        description: "This name already exists in the team members list",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await teamMemberService.create({ name: newName.trim() });
      await loadTeamMembers();
      setNewName("");
      setShowAddDialog(false);
      toast({
        title: "Success",
        description: "Team member added successfully",
      });
    } catch (error) {
      console.error("Failed to add team member:", error);
      toast({
        title: "Error",
        description: "Failed to add team member",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMembers = async () => {
    if (selectedForDeletion.length === 0) return;

    setLoading(true);
    try {
      await Promise.all(
        selectedForDeletion.map(id => teamMemberService.delete(id))
      );
      await loadTeamMembers();
      setSelectedForDeletion([]);
      setShowDeleteDialog(false);
      toast({
        title: "Success",
        description: `${selectedForDeletion.length} team member(s) deleted successfully`,
      });
    } catch (error) {
      console.error("Failed to delete team members:", error);
      toast({
        title: "Error",
        description: "Failed to delete team members",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            value={value}
            onChange={handleInputChange}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder}
            className="pr-8"
          />
          <button
            type="button"
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setShowAddDialog(true)}
          title="Add new team member"
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setShowDeleteDialog(true)}
          title="Delete team members"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-48 overflow-y-auto"
        >
          {suggestions.map((member) => (
            <div
              key={member.id}
              className="px-3 py-2 hover:bg-accent cursor-pointer text-sm"
              onClick={() => handleSuggestionClick(member.name)}
            >
              {member.name}
            </div>
          ))}
        </div>
      )}

      {/* Add New Member Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Team Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newName">Name</Label>
              <Input
                id="newName"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter team member name"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddName();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddName} disabled={loading || !newName.trim()}>
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Members Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Team Members</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Select team members to delete:
            </p>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={member.id}
                    checked={selectedForDeletion.includes(member.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedForDeletion([...selectedForDeletion, member.id]);
                      } else {
                        setSelectedForDeletion(selectedForDeletion.filter(id => id !== member.id));
                      }
                    }}
                  />
                  <Label htmlFor={member.id} className="text-sm">
                    {member.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteMembers}
              disabled={loading || selectedForDeletion.length === 0}
            >
              Delete Selected
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}