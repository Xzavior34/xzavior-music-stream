import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Play, GripVertical } from 'lucide-react';
import { Button } from './ui/button';

interface Track {
  id: number;
  title: string;
  artist: { name: string };
  duration: number;
}

interface PlaylistTracksListProps {
  tracks: Track[];
  onReorder: (tracks: Track[]) => void;
  onPlayTrack: (track: Track) => void;
  formatDuration: (seconds: number) => string;
  canReorder?: boolean;
}

const SortableTrack = ({ track, index, onPlayTrack, formatDuration, canReorder }: {
  track: Track;
  index: number;
  onPlayTrack: (track: Track) => void;
  formatDuration: (seconds: number) => string;
  canReorder: boolean;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: track.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 sm:gap-4 p-2 sm:p-3 rounded-lg hover:bg-card transition-colors group cursor-pointer"
      onClick={() => onPlayTrack(track)}
    >
      {canReorder && (
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>
      )}
      <div className="w-6 sm:w-8 text-center text-xs sm:text-sm text-muted-foreground group-hover:hidden flex-shrink-0">
        {index + 1}
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="w-6 h-6 sm:w-8 sm:h-8 p-0 hidden group-hover:flex items-center justify-center flex-shrink-0"
      >
        <Play className="w-3 h-3 sm:w-4 sm:h-4 ml-0.5" fill="currentColor" />
      </Button>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm sm:text-base truncate">{track.title}</div>
        <div className="text-xs sm:text-sm text-muted-foreground truncate">{track.artist.name}</div>
      </div>
      <div className="text-xs sm:text-sm text-muted-foreground flex-shrink-0">
        {formatDuration(track.duration)}
      </div>
    </div>
  );
};

export const PlaylistTracksList = ({ tracks, onReorder, onPlayTrack, formatDuration, canReorder = false }: PlaylistTracksListProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = tracks.findIndex((t) => t.id === active.id);
      const newIndex = tracks.findIndex((t) => t.id === over.id);
      const newTracks = arrayMove(tracks, oldIndex, newIndex);
      onReorder(newTracks);
    }
  };

  if (!canReorder) {
    return (
      <div className="space-y-1">
        {tracks.map((track, index) => (
          <SortableTrack
            key={track.id}
            track={track}
            index={index}
            onPlayTrack={onPlayTrack}
            formatDuration={formatDuration}
            canReorder={false}
          />
        ))}
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={tracks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-1">
          {tracks.map((track, index) => (
            <SortableTrack
              key={track.id}
              track={track}
              index={index}
              onPlayTrack={onPlayTrack}
              formatDuration={formatDuration}
              canReorder={true}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};