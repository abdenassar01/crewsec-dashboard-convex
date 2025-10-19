"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import type { Doc } from "@convex/_generated/dataModel";
import { AddSquareFreeIcons } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

// Towns components
import { TownsListClient } from "./towns/towns-list-client";
import { TownForm } from "./towns/town-form";

// Violations components
import { ViolationsListClient } from "./violations/violations-list-client";
import { ViolationForm } from "./violations/violation-form";

// Location Violations components
import { LocationViolationsListClient } from "./location-violations/location-violations-list-client";
import { LocationViolationForm } from "./location-violations/location-violation-form";

type Town = Doc<"towns">;
type Violation = Doc<"violations">;
type LocationViolation = Doc<"locationViolations">;

export default function StaticDataPage() {
  const [selectedTab, setSelectedTab] = useState("towns");
  const [editingItem, setEditingItem] = useState<Town | Violation | LocationViolation | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleEdit = (item: Town | Violation | LocationViolation) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const renderForm = () => {
    if (!isFormOpen) return null;

    switch (selectedTab) {
      case "towns":
        return (
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? "Edit Town" : "Create Town"}
                </DialogTitle>
              </DialogHeader>
              <TownForm
                onSubmit={async (data, isEdit) => {
                  setIsPending(true);
                  try {
                    if (isEdit && editingItem) {
                      // Update logic here
                    } else {
                      // Create logic here
                    }
                    setIsFormOpen(false);
                    setEditingItem(null);
                  } catch (error) {
                    console.error("Error saving town:", error);
                  } finally {
                    setIsPending(false);
                  }
                }}
                defaultValues={editingItem as Town | null}
                isPending={isPending}
              />
            </DialogContent>
          </Dialog>
        );
      case "violations":
        return (
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? "Edit Violation" : "Create Violation"}
                </DialogTitle>
              </DialogHeader>
              <ViolationForm
                onSubmit={async (data, isEdit) => {
                  setIsPending(true);
                  try {
                    if (isEdit && editingItem) {
                      // Update logic here
                    } else {
                      // Create logic here
                    }
                    setIsFormOpen(false);
                    setEditingItem(null);
                  } catch (error) {
                    console.error("Error saving violation:", error);
                  } finally {
                    setIsPending(false);
                  }
                }}
                defaultValues={editingItem as Violation | null}
                isPending={isPending}
              />
            </DialogContent>
          </Dialog>
        );
      case "location-violations":
        return (
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? "Edit Location Violation" : "Create Location Violation"}
                </DialogTitle>
              </DialogHeader>
              <LocationViolationForm
                onSubmit={async (data, isEdit) => {
                  setIsPending(true);
                  try {
                    if (isEdit && editingItem) {
                      // Update logic here
                    } else {
                      // Create logic here
                    }
                    setIsFormOpen(false);
                    setEditingItem(null);
                  } catch (error) {
                    console.error("Error saving location violation:", error);
                  } finally {
                    setIsPending(false);
                  }
                }}
                defaultValues={editingItem as LocationViolation | null}
                isPending={isPending}
              />
            </DialogContent>
          </Dialog>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 mt-10">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Static Data Management</h1>
        <Button onClick={handleAdd}>
          <HugeiconsIcon icon={AddSquareFreeIcons} className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="towns">Towns</TabsTrigger>
          <TabsTrigger value="violations">Violations</TabsTrigger>
          <TabsTrigger value="location-violations">Location Violations</TabsTrigger>
        </TabsList>

        <TabsContent value="towns" className="space-y-4">
          <TownsListClient onEdit={handleEdit} onAdd={handleAdd} />
        </TabsContent>

        <TabsContent value="violations" className="space-y-4">
          <ViolationsListClient onEdit={handleEdit} onAdd={handleAdd} />
        </TabsContent>

        <TabsContent value="location-violations" className="space-y-4">
          <LocationViolationsListClient onEdit={handleEdit} onAdd={handleAdd} />
        </TabsContent>
      </Tabs>

      {renderForm()}
    </div>
  );
}