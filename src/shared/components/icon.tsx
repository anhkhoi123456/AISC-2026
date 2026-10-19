import type { CSSProperties } from "react";
import {
  Search,
  Heart,
  MapPin,
  ArrowRight,
  House,
  MessageCircle,
  Check,
  X,
  Users,
  ShieldCheck,
  Plus,
  SlidersHorizontal,
  Sun,
  Leaf,
  Bell,
  LayoutGrid,
  LogOut,
  Flag,
  Copy,
  Send,
  Menu,
  Bed,
  Scan,
  ChevronRight,
  FileText,
  type LucideIcon,
} from "lucide-react";
const icons: Record<string, LucideIcon> = {
  search: Search,
  heart: Heart,
  pin: MapPin,
  arrow: ArrowRight,
  home: House,
  chat: MessageCircle,
  check: Check,
  close: X,
  users: Users,
  shield: ShieldCheck,
  plus: Plus,
  sliders: SlidersHorizontal,
  sun: Sun,
  leaf: Leaf,
  bell: Bell,
  grid: LayoutGrid,
  logout: LogOut,
  flag: Flag,
  copy: Copy,
  send: Send,
  menu: Menu,
  bed: Bed,
  area: Scan,
  chevron: ChevronRight,
  contract: FileText,
};
export function Icon({
  name,
  size = 20,
  style,
}: {
  name: string;
  size?: number;
  style?: CSSProperties;
}) {
  const Component = icons[name] ?? House;
  return (
    <Component size={size} strokeWidth={1.7} style={style} aria-hidden="true" />
  );
}
