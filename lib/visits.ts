"use client";

const STORAGE_KEY = "philately_visits";

export interface Visit {
  sno: number;
  visitedAt: string; // ISO date string
  notes: string;
}

export function getVisits(): Record<number, Visit> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveVisit(visit: Visit): void {
  const visits = getVisits();
  visits[visit.sno] = visit;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(visits));
}

export function removeVisit(sno: number): void {
  const visits = getVisits();
  delete visits[sno];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(visits));
}

export function isVisited(sno: number): boolean {
  return sno in getVisits();
}

export function getVisitCount(): number {
  return Object.keys(getVisits()).length;
}
