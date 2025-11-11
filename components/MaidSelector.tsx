import { useState } from 'react';
import { Maid } from '@/types/types';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface MaidSelectorProps {
  maids: Maid[];
  selectedMaidId: string;
  onSelectMaid: (maidId: string) => void;
  onAddMaid: (maid: Maid) => void;
  onUpdateMaid: (maid: Maid) => void;
}

const colorOptions = [
  { name: 'Sage', value: '150 25% 55%' },
  { name: 'Lavender', value: '250 35% 65%' },
  { name: 'Peach', value: '20 80% 75%' },
  { name: 'Sky', value: '200 70% 65%' },
  { name: 'Rose', value: '340 60% 70%' },
  { name: 'Mint', value: '160 45% 65%' },
];

export const MaidSelector = ({ maids, selectedMaidId, onSelectMaid, onAddMaid, onUpdateMaid }: MaidSelectorProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newMaidName, setNewMaidName] = useState('');
  const [selectedColor, setSelectedColor] = useState(colorOptions[0].value);
  const [maxLeaves, setMaxLeaves] = useState(4);
  const [editingMaid, setEditingMaid] = useState<Maid | null>(null);

  const handleAddMaid = () => {
    if (!newMaidName.trim()) return;
    
    const newMaid: Maid = {
      id: Date.now().toString(),
      name: newMaidName.trim(),
      color: selectedColor,
      maxLeavesPerMonth: maxLeaves,
    };
    
    onAddMaid(newMaid);
    setNewMaidName('');
    setSelectedColor(colorOptions[0].value);
    setMaxLeaves(4);
    setIsDialogOpen(false);
  };

  const handleEditMaid = (maid: Maid) => {
    setEditingMaid(maid);
    setMaxLeaves(maid.maxLeavesPerMonth);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingMaid) return;
    
    onUpdateMaid({
      ...editingMaid,
      maxLeavesPerMonth: maxLeaves,
    });
    setIsEditDialogOpen(false);
    setEditingMaid(null);
  };

  const selectedMaid = maids.find(m => m.id === selectedMaidId);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-muted-foreground">Tracking:</span>
        
        {maids.map((maid) => (
          <Button
            key={maid.id}
            variant={selectedMaidId === maid.id ? "default" : "outline"}
            onClick={() => onSelectMaid(maid.id)}
            className="rounded-xl"
            style={selectedMaidId === maid.id ? {
              backgroundColor: `hsl(${maid.color})`,
              borderColor: `hsl(${maid.color})`,
            } : undefined}
          >
            {maid.name}
          </Button>
        ))}

        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-xl"
          onClick={() => selectedMaid && handleEditMaid(selectedMaid)}
          disabled={!selectedMaid}
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      </div>

      {selectedMaid && (
        <div className="text-sm text-muted-foreground">
          Max leaves: {selectedMaid.maxLeavesPerMonth} days/month
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" className="rounded-xl">
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Add New Maid</DialogTitle>
            <DialogDescription>
              Add a new household staff member to track their attendance.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newMaidName}
                onChange={(e) => setNewMaidName(e.target.value)}
                placeholder="Enter name"
                className="rounded-xl"
                onKeyPress={(e) => e.key === 'Enter' && handleAddMaid()}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Color Theme</Label>
              <div className="grid grid-cols-3 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setSelectedColor(color.value)}
                    className={cn(
                      "h-12 rounded-xl border-2 transition-all relative",
                      selectedColor === color.value ? "border-foreground scale-105" : "border-border"
                    )}
                    style={{ backgroundColor: `hsl(${color.value})` }}
                  >
                    {selectedColor === color.value && (
                      <Check className="h-5 w-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white drop-shadow-lg" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxLeaves">Max Leaves Per Month</Label>
              <Input
                id="maxLeaves"
                type="number"
                min="0"
                value={maxLeaves}
                onChange={(e) => setMaxLeaves(parseInt(e.target.value) || 0)}
                className="rounded-xl"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)} 
              className="flex-1 rounded-xl"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddMaid} 
              className="flex-1 rounded-xl"
              disabled={!newMaidName.trim()}
            >
              Add
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit Settings</DialogTitle>
            <DialogDescription>
              Update settings for {editingMaid?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editMaxLeaves">Max Leaves Per Month</Label>
              <Input
                id="editMaxLeaves"
                type="number"
                min="0"
                value={maxLeaves}
                onChange={(e) => setMaxLeaves(parseInt(e.target.value) || 0)}
                className="rounded-xl"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)} 
              className="flex-1 rounded-xl"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEdit} 
              className="flex-1 rounded-xl"
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
