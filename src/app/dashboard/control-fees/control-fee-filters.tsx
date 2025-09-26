"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";

export type ControlFeeFilters = {
  townId: string;
  violationId: string;
};

type ControlFeeFiltersProps = {
  filters: ControlFeeFilters;
  onFiltersChange: (filters: ControlFeeFilters) => void;
  onReset: () => void;
};

export function ControlFeeFilters({ filters, onFiltersChange, onReset }: ControlFeeFiltersProps) {
  const towns = useQuery(api.towns.list);
  const violations = useQuery(api.violations.list);

  return (
    <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex-1 min-w-[200px]">
        <Label htmlFor="town-filter">Town</Label>
        <Select
          value={filters.townId}
          onValueChange={(value) => onFiltersChange({ ...filters, townId: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select town" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Towns</SelectItem>
            {towns?.map((town) => (
              <SelectItem key={town._id} value={town._id}>
                {town.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 min-w-[200px]">
        <Label htmlFor="violation-filter">Violation</Label>
        <Select
          value={filters.violationId}
          onValueChange={(value) => onFiltersChange({ ...filters, violationId: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select violation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Violations</SelectItem>
            {violations?.map((violation) => (
              <SelectItem key={violation._id} value={violation._id}>
                {violation.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-end">
        <Button variant="outline" onClick={onReset}>
          Reset Filters
        </Button>
      </div>
    </div>
  );
}