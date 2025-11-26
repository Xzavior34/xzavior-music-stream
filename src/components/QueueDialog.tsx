import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAudio } from "@/contexts/AudioContext";
import { Play, X, GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface QueueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SortableTrackProps {
  track: any;
  index: number;
  onRemove: (index: number) => void;
}

const SortableTrack = ({ track, index, onRemove }: SortableTrackProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: track.id + index });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="w-4 h-4" />
      </div>
      
      <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
        {track.image_url ? (
          <img 
            src={track.image_url} 
            alt={track.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/40 to-primary/10" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm truncate">{track.title}</div>
        <div className="text-xs text-muted-foreground truncate">{track.artist_name}</div>
      </div>
      
      <div className="text-xs text-muted-foreground">{formatTime(track.duration)}</div>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onRemove(index)}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
};

export const QueueDialog = ({ open, onOpenChange }: QueueDialogProps) => {
  const { currentTrack, queue, reorderQueue, removeFromQueue, clearQueue } = useAudio();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = queue.findIndex((_, idx) => (queue[idx].id + idx) === active.id);
      const newIndex = queue.findIndex((_, idx) => (queue[idx].id + idx) === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        reorderQueue(oldIndex, newIndex);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">Queue</DialogTitle>
            {queue.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearQueue}
                className="text-red-500 hover:text-red-600"
              >
                Clear All
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {queue.length} {queue.length === 1 ? 'track' : 'tracks'} in queue
          </p>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 pb-6">
          {/* Now Playing */}
          {currentTrack && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <Play className="w-4 h-4 text-primary" fill="currentColor" />
                Now Playing
              </h3>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                <div className="w-14 h-14 rounded overflow-hidden flex-shrink-0">
                  {currentTrack.image_url ? (
                    <img 
                      src={currentTrack.image_url} 
                      alt={currentTrack.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/40 to-primary/10" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate">{currentTrack.title}</div>
                  <div className="text-sm text-muted-foreground truncate">{currentTrack.artist_name}</div>
                </div>
              </div>
            </div>
          )}

          {/* Queue */}
          {queue.length > 0 ? (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">Next Up</h3>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={queue.map((track, idx) => track.id + idx)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-1">
                    {queue.map((track, index) => (
                      <SortableTrack
                        key={track.id + index}
                        track={track}
                        index={index}
                        onRemove={removeFromQueue}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Your queue is empty</p>
              <p className="text-sm mt-2">Songs you add will appear here</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};