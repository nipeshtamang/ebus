import * as React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchableComboboxProps {
  label?: string;
  value: string;
  options: string[];
  placeholder?: string;
  onChange: (value: string) => void;
  maxVisible?: number;
}

export function SearchableCombobox({
  label,
  value,
  options,
  placeholder = "Select...",
  onChange,
  maxVisible = 4,
}: SearchableComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const filtered = options
    .filter((opt) => opt.toLowerCase().includes(search.toLowerCase()))
    .slice(0, maxVisible);

  return (
    <div>
      {label && (
        <label className="block mb-1 text-sm font-medium">{label}</label>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "w-full border rounded-md px-3 py-2 text-left bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500",
              !value && "text-gray-400"
            )}
          >
            {value || <span>{placeholder}</span>}
          </button>
        </PopoverTrigger>
        <PopoverContent className="p-2 w-64">
          <Input
            autoFocus
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-2"
          />
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 && (
              <div className="text-gray-400 text-sm px-2 py-1">No results</div>
            )}
            {filtered.map((opt) => (
              <div
                key={opt}
                className={cn(
                  "px-3 py-2 rounded cursor-pointer hover:bg-teal-100",
                  value === opt && "bg-teal-600 text-white"
                )}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                  setSearch("");
                }}
              >
                {opt}
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
