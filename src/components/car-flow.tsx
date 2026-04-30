"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CarSelector } from "@/components/car-selector";
import { UsageForm } from "@/components/usage-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { SelectedCar } from "@/types";

export function CarFlow() {
  const [brandCode, setBrandCode] = useState<string | null>(null);
  const [modelCode, setModelCode] = useState<number | null>(null);
  const [yearCode, setYearCode] = useState<string | null>(null);
  const [selectedCar, setSelectedCar] = useState<SelectedCar | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const handleBrandChange = (code: string) => {
    setBrandCode(code);
    setModelCode(null);
    setYearCode(null);
    setSelectedCar(null);
  };

  const handleModelChange = (code: number) => {
    setModelCode(code);
    setYearCode(null);
    setSelectedCar(null);
  };

  const handleYearChange = (code: string) => {
    setYearCode(code);
    setSelectedCar(null);
  };

  return (
    <>
      <Card className="border-border/50 shadow-sm">
        <CardContent className="pt-6 pb-5 space-y-5">
          <CarSelector
            brandCode={brandCode}
            modelCode={modelCode}
            yearCode={yearCode}
            onBrandChange={handleBrandChange}
            onModelChange={handleModelChange}
            onYearChange={handleYearChange}
            onCarReady={setSelectedCar}
          />

          <AnimatePresence>
            {selectedCar && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  className="w-full font-semibold text-sm"
                  size="lg"
                  onClick={() => setFormOpen(true)}
                >
                  Calcular custo real →
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      <UsageForm car={selectedCar} open={formOpen} onOpenChange={setFormOpen} />
    </>
  );
}
