import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { Column as ColumnType } from "../types/types";
import Item from "./item";

export const Column: React.FC<ColumnType> = ({ id, title, items }) => {
  const { setNodeRef } = useDroppable({ id: id.toString() });
  return (
    <SortableContext id={id} items={items} strategy={rectSortingStrategy}>
      <h1 className="text-3xl text-center font-bold my-4">{title}</h1>
      <div
        className="flex flex-col items-center bg-gray-100 w-full  gap-4 p-8"
        ref={setNodeRef}
      >
        {/* <div className="flex flex-col items-center justify-center w-52 h-24 bg-white gap-2 w-full"> */}
        {items.map((item) => (
          <Item key={item.id} {...item} />
        ))}
        {/* </div> */}
      </div>
    </SortableContext>
  );
};
