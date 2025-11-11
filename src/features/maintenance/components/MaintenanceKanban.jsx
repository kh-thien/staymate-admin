import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
} from "@dnd-kit/core";
import { KanbanColumn } from "./KanbanColumn";
import { MaintenanceCard } from "./MaintenanceCard";

const COLUMNS = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

export const MaintenanceKanban = ({
  maintenanceRequests,
  onCardClick,
  onStatusChange,
}) => {
  const [activeId, setActiveId] = useState(null);
  const [overId, setOverId] = useState(null);

  // Improved sensors - easier to drag
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // Reduced from 8 to make dragging easier
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragOver = (event) => {
    const { over } = event;
    // Track which column we're over for visual feedback
    if (over) {
      // Check if over a column or an item in a column
      if (COLUMNS.includes(over.id)) {
        setOverId(over.id);
      } else if (over.data?.current?.type === 'column') {
        setOverId(over.data.current.status);
      } else if (over.data?.current?.type === 'item') {
        setOverId(over.data.current.status);
      } else {
        // Find the item and get its status
        const overItem = maintenanceRequests.find((item) => item.id === over.id);
        if (overItem) {
          setOverId(overItem.status);
        }
      }
    } else {
      setOverId(null);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    // Reset over state
    setOverId(null);

    if (!over) {
      setActiveId(null);
      return;
    }

    const activeItem = maintenanceRequests.find(
      (item) => item.id === active.id
    );

    if (!activeItem) {
      setActiveId(null);
      return;
    }

    // Determine the target status
    let newStatus = null;

    // Priority 1: Check if over.id is a valid column status (dropped directly on column)
    if (COLUMNS.includes(over.id)) {
      newStatus = over.id;
    }
    // Priority 2: Check over.data.current for column data
    else if (over.data?.current?.type === 'column' && over.data?.current?.status) {
      newStatus = over.data.current.status;
    }
    // Priority 3: Check over.data.current for item data (dropped on an item)
    else if (over.data?.current?.type === 'item' && over.data?.current?.status) {
      newStatus = over.data.current.status;
    }
    // Priority 4: Fallback - find the item that was dropped on
    else {
      const overItem = maintenanceRequests.find((item) => item.id === over.id);
      if (overItem) {
        newStatus = overItem.status;
      }
    }

    // Only update if we have a valid new status that's different from current
    if (newStatus && COLUMNS.includes(newStatus) && activeItem.status !== newStatus) {
      onStatusChange(activeItem.id, newStatus);
    }

    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
    setOverId(null);
  };

  // Group maintenance requests by status
  const groupedByStatus = COLUMNS.reduce((acc, status) => {
    acc[status] = maintenanceRequests.filter((item) => item.status === status);
    return acc;
  }, {});

  const activeItem = activeId
    ? maintenanceRequests.find((item) => item.id === activeId)
    : null;

  // Improved collision detection - uses pointerWithin first, then rectIntersection
  // This makes it much easier to drop items
  const collisionDetectionAlgorithm = (args) => {
    // First, try pointerWithin (most accurate for mouse/touch)
    const pointerCollisions = pointerWithin(args);
    
    if (pointerCollisions.length > 0) {
      return pointerCollisions;
    }
    
    // Fallback to rectIntersection (for keyboard navigation)
    return rectIntersection(args);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetectionAlgorithm}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            maintenanceItems={groupedByStatus[status]}
            onCardClick={onCardClick}
            isOver={overId === status && activeId !== null}
            isDragging={activeId !== null}
          />
        ))}
      </div>

      <DragOverlay>
        {activeItem ? (
          <div className="opacity-95 transform rotate-2 shadow-2xl scale-105">
            <MaintenanceCard maintenance={activeItem} onClick={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
