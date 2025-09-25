"use client";

import * as React from "react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar01FreeIcons, FilterEditFreeIcons, Xml01FreeIcons } from "@hugeicons/core-free-icons";

export interface ParkingFilters {
  searchTerm: string;
  location: string;
  startDate?: string;
  endDate?: string;
  availableOnly: boolean;
  unresolvedIssues: boolean;
}

interface ParkingFiltersProps {
  filters: ParkingFilters;
  onFiltersChange: (filters: ParkingFilters) => void;
  onReset: () => void;
}

export function ParkingFilters({ filters, onFiltersChange, onReset }: ParkingFiltersProps) {
  const handleFilterChange = (key: keyof ParkingFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HugeiconsIcon icon={FilterEditFreeIcons} className="h-5 w-5" />
          Parking Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Term */}
        <div className="space-y-2">
          <Label htmlFor="searchTerm">Search</Label>
          <Input
            id="searchTerm"
            placeholder="Search by name, address..."
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
          />
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="Filter by location..."
            value={filters.location}
            onChange={(e) => handleFilterChange("location", e.target.value)}
          />
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Available From</Label>
            <div className="relative">
              <Input
                id="startDate"
                type="date"
                value={filters.startDate || ""}
                onChange={(e) => handleFilterChange("startDate", e.target.value || undefined)}
              />
              <HugeiconsIcon icon={Calendar01FreeIcons} className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">Available Until</Label>
            <div className="relative">
              <Input
                id="endDate"
                type="date"
                value={filters.endDate || ""}
                onChange={(e) => handleFilterChange("endDate", e.target.value || undefined)}
              />
              <HugeiconsIcon icon={Calendar01FreeIcons} className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Status Filters */}
        <div className="space-y-3">
          <Label>Status</Label>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.availableOnly}
                onChange={(e) => handleFilterChange("availableOnly", e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">Available only</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={filters.unresolvedIssues}
                onChange={(e) => handleFilterChange("unresolvedIssues", e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">Has unresolved issues</span>
            </label>
          </div>
        </div>

        {/* Reset Button */}
        <Button
          variant="outline"
          onClick={onReset}
          className="w-full"
        >
          <HugeiconsIcon icon={Xml01FreeIcons} className="h-5 w-5 mr-2" />
          Clear Filters
        </Button>
      </CardContent>
    </Card>
  );
}