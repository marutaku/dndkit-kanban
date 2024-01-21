import { useState } from "react";
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Column as ColumnType } from "./types/types";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Column } from "./components/column";

const DEFAULT_COLUMNS: ColumnType[] = [
  {
    id: "column-1",
    title: "To do",
    items: [
      { id: "item-1", title: "Item 1" },
      { id: "item-2", title: "Item 2" },
    ],
  },
  {
    id: "column-2",
    title: "In progress",
    items: [
      { id: "item-3", title: "Item 3" },
      { id: "item-4", title: "Item 4" },
    ],
  },
  {
    id: "column-3",
    title: "Done",
    items: [
      { id: "item-5", title: "Item 5" },
      { id: "item-6", title: "Item 6" },
    ],
  },
];

function App() {
  const [columns, setColumns] = useState(DEFAULT_COLUMNS);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const findColumn = (unique: string | null) => {
    if (!unique) {
      return null;
    }
    // overの対象がcolumnの場合があるためそのままidを返す
    if (columns.some((c) => c.id === unique)) {
      return columns.find((c) => c.id === unique) ?? null;
    }
    const id = String(unique);
    const itemWithColumnId = columns.flatMap((c) => {
      const columnId = c.id;
      return c.items.map((i) => ({ itemId: i.id, columnId: columnId }));
    });
    const columnId = itemWithColumnId.find((i) => i.itemId === id)?.columnId;
    return columns.find((c) => c.id === columnId) ?? null;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    // 同一カラム内でソートするときの処理
    const { active, over } = event;
    const activeId = String(active.id);
    const overId = over ? String(over.id) : null;
    const activeColumn = findColumn(activeId);
    const overColumn = findColumn(overId);
    if (!activeColumn || !overColumn || activeColumn !== overColumn) {
      return null;
    }
    const activeIndex = activeColumn.items.findIndex((i) => i.id === activeId);
    const overIndex = overColumn.items.findIndex((i) => i.id === overId);
    if (activeIndex !== overIndex) {
      setColumns((prevState) => {
        return prevState.map((column) => {
          if (column.id === activeColumn.id) {
            column.items = arrayMove(overColumn.items, activeIndex, overIndex);
            return column;
          } else {
            return column;
          }
        });
      });
    }
  };
  const handleDragOver = (event: DragOverEvent) => {
    // カラムの移動が発生したときの処理
    const { active, over, delta } = event;
    const activeId = String(active.id);
    const overId = over ? String(over.id) : null;
    const activeColumn = findColumn(activeId);
    const overColumn = findColumn(overId);
    if (!activeColumn || !overColumn || activeColumn === overColumn) {
      return null;
    }
    const activeItems = activeColumn.items;
    const overItems = overColumn.items;
    const activeIndex = activeItems.findIndex((i) => i.id === activeId);
    const overIndex = overItems.findIndex((i) => i.id === overId);
    const newIndex = () => {
      const putOnBelowLastItem =
        overIndex === overItems.length - 1 && delta.y > 0;
      const modifier = putOnBelowLastItem ? 1 : 0;
      return overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
    };
    setColumns((prevState) => {
      return prevState.map((c) => {
        if (c.id === activeColumn.id) {
          // 元のカラムからドラッグしているアイテムを削除する
          c.items = activeItems.filter((i) => i.id !== activeId);
          return c;
        } else if (c.id === overColumn.id) {
          // 対象のカラムにドラッグしているアイテムを挿入する
          c.items = [
            ...overItems.slice(0, newIndex()),
            activeItems[activeIndex],
            ...overItems.slice(newIndex(), overItems.length),
          ];
          return c;
        } else {
          return c;
        }
      });
    });
  };
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <h1 className="text-3xl m-4 font-bold underline">
        dnd-kit Kanban sample
      </h1>
      <div className="p-8 bg-gray-100 h-full">
        <div className="flex justify-center gap-12">
          {columns.map((column) => (
            <div className="col-span-1" key={column.id}>
              <Column key={column.id} {...column} />
            </div>
          ))}
        </div>
      </div>
    </DndContext>
  );
}

export default App;
