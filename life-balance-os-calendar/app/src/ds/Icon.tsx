import type { CSSProperties } from 'react';
import {
  ArrowRight, Briefcase, Calendar, Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, ExternalLink, RefreshCw, Circle, CircleCheck,
  CircleDashed, ClockAlert, CupSoda, Heart, Hourglass, House, Inbox, ListTree, Moon,
  NotebookPen, PenLine, PersonStanding, Plus, Repeat, Replace, Send, Settings, Shuffle, Sun,
  Target, Timer, TriangleAlert, User, Users, Wallet, X, type LucideIcon,
} from 'lucide-react';

/** Lucide icons used by the app, keyed by their kebab-case Lucide name (same names as the design). */
const ICONS = {
  'arrow-right': ArrowRight, briefcase: Briefcase, calendar: Calendar, check: Check,
  'chevron-down': ChevronDown, 'chevron-left': ChevronLeft, 'chevron-right': ChevronRight, 'chevron-up': ChevronUp,
  'external-link': ExternalLink, 'refresh-cw': RefreshCw, circle: Circle, 'circle-check': CircleCheck,
  'circle-dashed': CircleDashed, 'clock-alert': ClockAlert, 'cup-soda': CupSoda, heart: Heart,
  hourglass: Hourglass, house: House, inbox: Inbox, 'list-tree': ListTree, moon: Moon,
  'notebook-pen': NotebookPen, 'pen-line': PenLine, 'person-standing': PersonStanding,
  plus: Plus, repeat: Repeat, replace: Replace, send: Send, settings: Settings, shuffle: Shuffle, sun: Sun,
  target: Target, timer: Timer, 'triangle-alert': TriangleAlert, user: User, users: Users,
  wallet: Wallet, x: X,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: CSSProperties;
}

export function Icon({ name, size = 20, color = 'currentColor', style }: IconProps) {
  const C = ICONS[name];
  return <C aria-hidden size={size} color={color} strokeWidth={2} style={{ flex: 'none', display: 'inline-block', ...style }} />;
}
