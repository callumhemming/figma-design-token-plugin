import { token } from "./tokens/global/primitives/color.js";

figma.showUI(__html__, { width: 240, height: 160 });

figma.ui.onmessage = async (msg) => {
  if (msg.type === "create") {
    const collection =
      figma.variables.createVariableCollection("Test Collection");
    const variable = figma.variables.createVariable(
      "status",
      collection,
      "STRING",
    );

    variable.setValueForMode(collection.modes[0].modeId, "working");

    figma.notify(`Variable set to: working ✅ (${token})`);
  }
};
