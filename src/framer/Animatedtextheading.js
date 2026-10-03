var __dai_window=typeof window!=="undefined"?window:undefined;var __dai_navigator=typeof __dai_window!=="undefined"?navigator:undefined;

// http-url:https://framerusercontent.com/modules/eqmdfPKOuvHSdTMqEoRR/ZOQmCvd6jdJR7rpQk9uJ/AnimatedTextHeading.js
import { jsx as _jsx } from "react/jsx-runtime";
import { motion } from "framer-motion";
import { useState, startTransition } from "react";
import { addPropertyControls, ControlType } from "./_framer-runtime.js";
function MotionColourText(props) {
  const { text = "Hover Me", defaultColor = "#000000", font, moveDistance = 20, rotationAngle = 15, wrapText = false, textAlign = "left", padding = "20px", blendMode = "normal", colorMode = "pastel", textTransform = "none" } = props;
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [colors, setColors] = useState({});
  const getRandomColor = () => {
    const hue = Math.floor(Math.random() * 360);
    if (colorMode === "pastel") {
      return `hsl(${hue}, 75%, 75%)`;
    } else {
      return `hsl(${hue}, 90%, 50%)`;
    }
  };
  const handleMouseEnter = (index) => {
    startTransition(() => {
      setHoveredIndex(index);
      setColors((prev) => ({ ...prev, [index]: getRandomColor() }));
    });
  };
  const handleMouseLeave = () => {
    startTransition(() => {
      setHoveredIndex(null);
    });
  };
  const isFixedWidth = props?.style && props.style.width === "100%";
  const alignmentMap = { left: "flex-start", center: "center", right: "flex-end" };
  return /* @__PURE__ */ _jsx("div", { style: { ...props.style, position: "relative", display: "inline-flex", flexWrap: wrapText ? "wrap" : "nowrap", justifyContent: alignmentMap[textAlign], ...isFixedWidth ? {} : { width: "max-content" }, padding, mixBlendMode: blendMode, textTransform, ...font }, children: text.split(" ").map((word, wordIndex) => /* @__PURE__ */ _jsx("span", { style: { display: "inline-flex", marginRight: "0.3em" }, children: word.split("").map((char, charIndex) => {
    const index = text.substring(0, text.split(" ").slice(0, wordIndex).join(" ").length + (wordIndex > 0 ? 1 : 0)).length + charIndex;
    const isHovered = hoveredIndex === index;
    const randomY = Math.random() > 0.5 ? -moveDistance : moveDistance;
    const randomRotation = Math.random() > 0.5 ? -rotationAngle : rotationAngle;
    return /* @__PURE__ */ _jsx(motion.span, { onMouseEnter: () => handleMouseEnter(index), onMouseLeave: handleMouseLeave, animate: { y: isHovered ? randomY : 0, rotate: isHovered ? randomRotation : 0, color: isHovered ? colors[index] : defaultColor }, transition: { type: "spring", stiffness: isHovered ? 300 : 100, damping: isHovered ? 20 : 30, mass: 1 }, style: { display: "inline-block", cursor: "pointer", color: defaultColor, ...font, fontWeight: 400 }, children: char }, charIndex);
  }) }, wordIndex)) });
}
addPropertyControls(MotionColourText, { text: { type: ControlType.String, title: "Text", defaultValue: "Hover Me" }, defaultColor: { type: ControlType.Color, title: "Default Color", defaultValue: "#000000" }, font: { type: ControlType.Font, title: "Font", defaultValue: { fontSize: "64px", variant: "Regular", letterSpacing: "-0.04em", lineHeight: "1em" }, controls: "extended", defaultFontType: "sans-serif" }, colorMode: { type: ControlType.Enum, title: "Color Mode", options: ["pastel", "vibrant"], optionTitles: ["Pastel", "Vibrant"], defaultValue: "pastel", displaySegmentedControl: true }, textTransform: { type: ControlType.Enum, title: "Text Transform", options: ["none", "uppercase", "lowercase", "capitalize"], optionTitles: ["None", "Uppercase", "Lowercase", "Capitalize"], defaultValue: "none" }, textAlign: { type: ControlType.Enum, title: "Text Align", options: ["left", "center", "right"], optionTitles: ["Left", "Center", "Right"], defaultValue: "left", displaySegmentedControl: true }, wrapText: { type: ControlType.Boolean, title: "Wrap Text", defaultValue: false, enabledTitle: "On", disabledTitle: "Off" }, padding: { type: ControlType.Padding, title: "Padding", defaultValue: "20px" }, blendMode: { type: ControlType.Enum, title: "Blend Mode", options: ["normal", "multiply", "screen", "overlay", "darken", "lighten", "color-dodge", "color-burn", "hard-light", "soft-light", "difference", "exclusion", "hue", "saturation", "color", "luminosity"], optionTitles: ["Normal", "Multiply", "Screen", "Overlay", "Darken", "Lighten", "Color Dodge", "Color Burn", "Hard Light", "Soft Light", "Difference", "Exclusion", "Hue", "Saturation", "Color", "Luminosity"], defaultValue: "normal" }, moveDistance: { type: ControlType.Number, title: "Move Distance", defaultValue: 20, min: 0, max: 50, step: 1, unit: "px" }, rotationAngle: { type: ControlType.Number, title: "Rotation Angle", defaultValue: 15, min: 0, max: 45, step: 1, unit: "deg" } });
var __FramerMetadata__ = { "exports": { "default": { "type": "reactComponent", "name": "MotionColourText", "slots": [], "annotations": { "framerContractVersion": "1", "framerSupportedLayoutWidth": "any", "framerSupportedLayoutHeight": "any" } }, "__FramerMetadata__": { "type": "variable" } } };
export {
  __FramerMetadata__,
  MotionColourText as default
};
