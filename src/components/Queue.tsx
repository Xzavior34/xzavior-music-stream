import { useAudio } from '@/contexts/AudioContext';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Music, GripVertical, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface SortableTrackProps {
  track: any;
  index: number;
  isCurrentTrack?: boolean;
  onRemove: (index: number) => void;
}

const SortableTrack = ({ track, index, isCurrentTrack, onRemove }: SortableTrackProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: `${track.id}-${index}` 
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-3 p-3 rounded-lg transition-all",
        isDragging ? "opacity-50 bg-accent" : "hover:bg-accent/50",
        isCurrentTrack && "bg-primary/10"
      )}
    >
      <button
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4" />
      </button>
      
      <div className="w-10 h-10 rounded bg-accent flex items-center justify-center flex-shrink-0">
        <Music className="w-5 h-5 text-muted-foreground" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium truncate text-sm">{track.title}</p>
        <p className="text-xs text-muted-foreground truncate">{track.artist_name}</p>
      </div>

      <span className="text-xs text-muted-foreground">{formatDuration(track.duration)}</span>

      <Button
        variant="ghost"
        size="icon"
        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(index);
        }}
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
};

export const Queue = () => {
  const { currentTrack, queue, clearQueue, reorderQueue, removeFromQueue } = useAudio();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = queue.findIndex((_, i) => `${queue[i].id}-${i}` === active.id);
      const newIndex = queue.findIndex((_, i) => `${queue[i].id}-${i}` === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderQueue(oldIndex, newIndex);
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Queue</h2>
          {queue.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearQueue}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {currentTrack && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Now Playing
              </h3>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                <div className="w-12 h-12 rounded bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Music className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{currentTrack.title}</p>
                  <p className="text-sm text-muted-foreground truncate">{currentTrack.artist_name}</p>
                </div>
              </div>
            </div>
          )}

          {queue.length > 0 ? (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Next Up ({queue.length})
              </h3>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={queue.map((track, i) => `${track.id}-${i}`)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-1">
                    {queue.map((track, index) => (
                      <SortableTrack
                        key={`${track.id}-${index}`}
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
            <div className="text-center py-12">
              <Music className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No tracks in queue</p>
              <p className="text-sm text-muted-foreground mt-2">
                Add songs to see them here
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
