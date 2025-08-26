import React from 'react';
import {
  HomeIcon, BookOpenIcon, BeakerIcon, BuildingLibraryIcon,
  CurrencyDollarIcon, TruckIcon, DocumentTextIcon, CheckCircleIcon,
  QuestionMarkCircleIcon, EnvelopeIcon, UserGroupIcon, ShieldCheckIcon,
  GlobeAltIcon, BoltIcon, ArrowPathIcon, ScaleIcon, BanknotesIcon,
  ClipboardDocumentListIcon, InboxIcon, WrenchScrewdriverIcon, ChartBarIcon, TagIcon
} from '@heroicons/react/24/outline';

type IconComponent = (props: React.ComponentProps<'svg'>) => React.ReactNode;

export const ICON_MAP: Record<string, IconComponent> = {
  HomeIcon,
  BookOpenIcon,
  BeakerIcon,
  BuildingLibraryIcon,
  CurrencyDollarIcon,
  TruckIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  QuestionMarkCircleIcon,
  EnvelopeIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  BoltIcon,
  ArrowPathIcon,
  ScaleIcon,
  BanknotesIcon,
  ClipboardDocumentListIcon,
  InboxIcon,
  WrenchScrewdriverIcon,
  ChartBarIcon,
  TagIcon,
};

export const AVAILABLE_ICONS = Object.keys(ICON_MAP);

export const getIconComponent = (iconName: string): IconComponent => {
    return ICON_MAP[iconName] || TagIcon; // Fallback to a default icon
};