import { Plus, PlusCircle } from "lucide-react";

interface HeaderBarProps {
  handleFileUpload: () => void;
}
export default function HeaderBar({ handleFileUpload }: HeaderBarProps) {
  return (
    <div className="text-white  flex items-center justify-between p-2">
      Route Planner
      <input type="file" accept=".csv" onChange={handleFileUpload} />
    </div>
  );
}
