"use client";

import { useMemo } from "react";
import type { TreeCategory } from "../types";

interface FilterBarProps {
  keyword: string;
  onKeywordChange: (value: string) => void;
  category: TreeCategory | "all";
  onCategoryChange: (value: TreeCategory | "all") => void;
  careLevel: "all" | "beginner" | "intermediate" | "advanced";
  onCareLevelChange: (value: "all" | "beginner" | "intermediate" | "advanced") => void;
  tags: string[];
  onTagsChange: (value: string[]) => void;
}

const careLevelOptions = [
  { label: "ทั้งหมด", value: "all" },
  { label: "มือใหม่", value: "beginner" },
  { label: "ปานกลาง", value: "intermediate" },
  { label: "มืออาชีพ", value: "advanced" },
];

const categoryOptions: Array<{ value: TreeCategory | "all"; label: string }> = [
  { value: "all", label: "ทุกประเภท" },
  { value: "indoor", label: "ต้นไม้ในบ้าน" },
  { value: "outdoor", label: "ต้นไม้กลางแจ้ง" },
  { value: "bonsai", label: "บอนไซ" },
  { value: "flowering", label: "ไม้ดอก" },
  { value: "succulent", label: "ไม้อวบน้ำ" },
];

export function FilterBar({
  keyword,
  onKeywordChange,
  category,
  onCategoryChange,
  careLevel,
  onCareLevelChange,
  tags,
  onTagsChange,
}: FilterBarProps) {
  const availableTags = useMemo(
    () =>
      ["fast-growing", "air-purifying", "collectible", "low-maintenance", "gift", "shade"].map((tag) => ({
        value: tag,
        label: tag,
      })),
    [],
  );

  const toggleTag = (value: string) => {
    if (tags.includes(value)) {
      onTagsChange(tags.filter((tag) => tag !== value));
    } else {
      onTagsChange([...tags, value]);
    }
  };

  return (
    <div className="rounded-3xl border border-emerald-100 bg-white/80 p-5 shadow-sm backdrop-blur">
      <div className="grid gap-4 md:grid-cols-4">
        <label className="flex flex-col gap-2 text-sm text-emerald-900/80">
          ค้นหา
          <input
            value={keyword}
            onChange={(event) => onKeywordChange(event.target.value)}
            placeholder="ค้นหาต้นไม้ที่ต้องการ..."
            className="rounded-2xl border border-emerald-200 px-4 py-2 text-sm text-emerald-900 focus:border-emerald-400 focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-emerald-900/80">
          ประเภทสินค้า
          <select
            value={category}
            onChange={(event) => onCategoryChange(event.target.value as FilterBarProps["category"])}
            className="rounded-2xl border border-emerald-200 px-4 py-2 text-sm text-emerald-900 focus:border-emerald-400 focus:outline-none"
          >
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm text-emerald-900/80">
          ระดับการดูแล
          <select
            value={careLevel}
            onChange={(event) => onCareLevelChange(event.target.value as FilterBarProps["careLevel"])}
            className="rounded-2xl border border-emerald-200 px-4 py-2 text-sm text-emerald-900 focus:border-emerald-400 focus:outline-none"
          >
            {careLevelOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-col gap-2 text-sm text-emerald-900/80">
          คีย์เวิร์ดที่เกี่ยวข้อง
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => {
              const isActive = tags.includes(tag.value);
              return (
                <button
                  type="button"
                  key={tag.value}
                  className={`rounded-full border px-3 py-1 text-xs transition ${
                    isActive
                      ? "border-emerald-500 bg-emerald-100 text-emerald-700"
                      : "border-emerald-200 bg-white text-emerald-900/70 hover:border-emerald-300"
                  }`}
                  onClick={() => toggleTag(tag.value)}
                >
                  #{tag.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
