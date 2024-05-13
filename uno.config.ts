import { defineConfig, presetUno } from "unocss";
import { presetShadcn } from "./preset.shadcn";

export default defineConfig({
  presets: [presetUno(), presetShadcn()],
  // ...UnoCSS options
  shortcuts: [
    {
      "animate-accordion-up": "accordion-up",
      "animate-accordion-down": "accordion-down",
    },
  ],
  include: [/\.ts/, /\.tsx/],
});
