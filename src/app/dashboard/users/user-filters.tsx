"use client";

import * as React from "react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { FilterEditFreeIcons, Xml01FreeIcons } from "@hugeicons/core-free-icons";

export interface UserFilters {
  searchTerm: string;
  role: string;
  enabled: boolean | null;
}

interface UserFiltersProps {
  filters: UserFilters;
  onFiltersChange: (filters: UserFilters) => void;
  onReset: () => void;
}

export function UserFilters({ filters, onFiltersChange, onReset }: UserFiltersProps) {
  const handleFilterChange = (key: keyof UserFilters, value: any) => {
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
          User Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Term */}
        <div className="space-y-2">
          <Label htmlFor="searchTerm">Search</Label>
          <Input
            id="searchTerm"
            placeholder="Search by name or email..."
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
          />
        </div>

        {/* Role Filter */}
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <select
            id="role"
            value={filters.role}
            onChange={(e) => handleFilterChange("role", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">All Roles</option>
            <option value="CLIENT">Client</option>
            <option value="EMPLOYEE">Employee</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="space-y-3">
          <Label>Status</Label>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="status"
                checked={filters.enabled === null}
                onChange={() => handleFilterChange("enabled", null)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">All Users</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="status"
                checked={filters.enabled === true}
                onChange={() => handleFilterChange("enabled", true)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">Enabled only</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="status"
                checked={filters.enabled === false}
                onChange={() => handleFilterChange("enabled", false)}
                className="rounded border-gray-300"
              />
              <span className="text-sm">Disabled only</span>
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