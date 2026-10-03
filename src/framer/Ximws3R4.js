var __dai_window=typeof window!=="undefined"?window:undefined;var __dai_navigator=typeof __dai_window!=="undefined"?navigator:undefined;

// http-url:https://framerusercontent.com/modules/Vx5sOuX6IvFC08OMVhh6/NUZy2tcFlF3DxYs7k8LR/xiMws3_R4.js
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { addFonts, addPropertyControls, ControlType, cx, SVG, useActiveVariantCallback, useComponentViewport, useLocaleInfo, useOnVariantChange, useVariantState, withCSS } from "./_framer-runtime.js";
import { LayoutGroup, motion, MotionConfigContext } from "framer-motion";
import * as React from "react";
import { useRef } from "react";
var cycleOrder = ["m0N6NC_dO", "Ot_L4nIkA", "JZI5lpi4p"];
var serializationHash = "framer-wuptK";
var variantClassNames = { JZI5lpi4p: "framer-v-144x2d2", m0N6NC_dO: "framer-v-ww87rz", Ot_L4nIkA: "framer-v-i1o4ob" };
function addPropertyOverrides(overrides, ...variants) {
  const nextOverrides = {};
  variants?.forEach((variant) => variant && Object.assign(nextOverrides, overrides[variant]));
  return nextOverrides;
}
var transition1 = { damping: 60, delay: 0, mass: 1, stiffness: 500, type: "spring" };
var Transition = ({ value, children }) => {
  const config = React.useContext(MotionConfigContext);
  const transition = value ?? config.transition;
  const contextValue = React.useMemo(() => ({ ...config, transition }), [JSON.stringify(transition)]);
  return /* @__PURE__ */ _jsx(MotionConfigContext.Provider, { value: contextValue, children });
};
var humanReadableVariantMap = { "Variant 1": "m0N6NC_dO", "Variant 2": "Ot_L4nIkA", "Variant 3": "JZI5lpi4p" };
var Variants = motion.create(React.Fragment);
var getProps = ({ height, id, width, ...props }) => {
  return { ...props, variant: humanReadableVariantMap[props.variant] ?? props.variant ?? "m0N6NC_dO" };
};
var createLayoutDependency = (props, variants) => {
  if (props.layoutDependency)
    return variants.join("-") + props.layoutDependency;
  return variants.join("-");
};
var Component = /* @__PURE__ */ React.forwardRef(function(props, ref) {
  const fallbackRef = useRef(null);
  const refBinding = ref ?? fallbackRef;
  const defaultLayoutId = React.useId();
  const { activeLocale, setLocale } = useLocaleInfo();
  const componentViewport = useComponentViewport();
  const { style, className, layoutId, variant, ...restProps } = getProps(props);
  const { baseVariant, classNames, clearLoadingGesture, gestureHandlers, gestureVariant, isLoading, setGestureState, setVariant, variants } = useVariantState({ cycleOrder, defaultVariant: "m0N6NC_dO", ref: refBinding, variant, variantClassNames });
  const layoutDependency = createLayoutDependency(props, variants);
  const { activeVariantCallback, delay } = useActiveVariantCallback(baseVariant);
  const onAppear1o82qsx = activeVariantCallback(async (...args) => {
    await delay(() => setVariant("Ot_L4nIkA"), 200);
  });
  const onAppear2ob7g7 = activeVariantCallback(async (...args) => {
    await delay(() => setVariant("JZI5lpi4p"), 200);
  });
  const onAppearslun8g = activeVariantCallback(async (...args) => {
    await delay(() => setVariant("m0N6NC_dO"), 200);
  });
  useOnVariantChange(baseVariant, { default: onAppear1o82qsx, JZI5lpi4p: onAppearslun8g, Ot_L4nIkA: onAppear2ob7g7 });
  const sharedStyleClassNames = [];
  const scopingClassNames = cx(serializationHash, ...sharedStyleClassNames);
  const isDisplayed = () => {
    if (baseVariant === "JZI5lpi4p")
      return true;
    return false;
  };
  const isDisplayed1 = () => {
    if (baseVariant === "Ot_L4nIkA")
      return true;
    return false;
  };
  const isDisplayed2 = () => {
    if (["Ot_L4nIkA", "JZI5lpi4p"].includes(baseVariant))
      return false;
    return true;
  };
  return /* @__PURE__ */ _jsx(LayoutGroup, { id: layoutId ?? defaultLayoutId, children: /* @__PURE__ */ _jsx(Variants, { animate: variants, initial: false, children: /* @__PURE__ */ _jsx(Transition, { value: transition1, children: /* @__PURE__ */ _jsxs(motion.div, { ...restProps, ...gestureHandlers, className: cx(scopingClassNames, "framer-ww87rz", className, classNames), "data-framer-name": "Variant 1", "data-highlight": true, layoutDependency, layoutId: "xiMws3R4__m0N6NC_dO", ref: refBinding, style: { ...style }, ...addPropertyOverrides({ JZI5lpi4p: { "data-framer-name": "Variant 3" }, Ot_L4nIkA: { "data-framer-name": "Variant 2" } }, baseVariant, gestureVariant), children: [isDisplayed() && /* @__PURE__ */ _jsx(SVG, { className: "framer-nlwo2y", "data-framer-name": "graphic", layout: "position", layoutDependency, layoutId: "xiMws3R4__KLj63rFVl", opacity: 1, svg: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 296 300"><path d="M 3.269 61.137 C 8.518 73.79 13.663 107.587 14.769 122.137 M 141.269 2.637 C 120.769 49.637 104.269 101.637 86.269 128.137 M 163.269 159.137 C 185.061 134.995 202.769 114.637 251.939 78.108 M 199.269 218.137 C 252.769 200.768 276.769 200.768 292.706 200.768 M 197.769 276.637 C 224.269 281.637 235.769 286.137 244.84 296.728" fill="transparent" stroke-width="5" stroke="rgb(173, 214, 247)" stroke-linecap="round" stroke-miterlimit="10" stroke-dasharray=""></path></svg>', svgContentId: 11332250271, withExternalLayout: true, ...addPropertyOverrides({ JZI5lpi4p: { svgContentId: 12823092197 } }, baseVariant, gestureVariant) }), isDisplayed1() && /* @__PURE__ */ _jsx(SVG, { className: "framer-irfbdm", "data-framer-name": "graphic", layout: "position", layoutDependency, layoutId: "xiMws3R4__ucjwop75W", opacity: 1, svg: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 294 305"><path d="M 3.268 69.505 C 8 91 13.999 112 17.999 126.5 M 139.678 2.825 C 123 39.5 99 100.5 88.5 131.5 M 171.5 167.5 C 193.292 143.358 232 100.5 253.5 79.5 M 205.5 222.5 C 229 219.5 266.063 210.369 291.5 204.5 M 201.86 283.059 C 211.5 289 239 298.5 247.571 301.591" fill="transparent" stroke-width="5" stroke="rgb(173, 214, 247)" stroke-linecap="round" stroke-miterlimit="10" stroke-dasharray=""></path></svg>', svgContentId: 11792942563, withExternalLayout: true, ...addPropertyOverrides({ Ot_L4nIkA: { svgContentId: 12122145318 } }, baseVariant, gestureVariant) }), isDisplayed2() && /* @__PURE__ */ _jsx(SVG, { className: "framer-yr6x05", "data-framer-name": "graphic", layout: "position", layoutDependency, layoutId: "xiMws3R4__b5vsKgTdl", opacity: 1, svg: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 298 305"><path d="M 3.268 69.504 C 8.518 82.158 19.293 111.102 20.4 125.651 M 139.678 2.825 C 127.698 38.225 101.46 113.657 92.351 132.184 M 167.82 166.174 C 189.611 142.033 237.49 91.594 254.67 82.97 M 205.409 224.481 C 223.147 219.703 265.987 209.242 295.437 205.631 M 201.86 283.058 C 210.617 284.203 232.019 289.511 247.571 301.59" fill="transparent" stroke-width="5" stroke="rgb(173, 214, 247)" stroke-linecap="round" stroke-miterlimit="10" stroke-dasharray=""></path></svg>', svgContentId: 11278405321, withExternalLayout: true })] }) }) }) });
});
var css = ["@supports (aspect-ratio: 1) { body { --framer-aspect-ratio-supported: auto; } }", ".framer-wuptK.framer-dlehz7, .framer-wuptK .framer-dlehz7 { display: block; }", ".framer-wuptK.framer-ww87rz { height: auto; overflow: visible; position: relative; width: 100%; }", ".framer-wuptK .framer-nlwo2y { flex: none; height: 300px; left: calc(53.503184713375816% - 296px / 2); position: absolute; top: calc(50.31645569620255% - 300px / 2); width: 296px; }", ".framer-wuptK .framer-irfbdm { flex: none; height: 305px; left: calc(53.1847133757962% - 294px / 2); position: absolute; top: calc(50.00000000000002% - 305px / 2); width: 294px; }", ".framer-wuptK .framer-yr6x05 { flex: none; height: 305px; left: calc(52.22929936305734% - 298px / 2); position: absolute; top: calc(50.00000000000002% - 305px / 2); width: 298px; }"];
var FramerxiMws3_R4 = withCSS(Component, css, "framer-wuptK");
var xiMws3_R4_default = FramerxiMws3_R4;
FramerxiMws3_R4.displayName = "Accent 1";
FramerxiMws3_R4.defaultProps = { height: 316, width: 314 };
addPropertyControls(FramerxiMws3_R4, { variant: { options: ["m0N6NC_dO", "Ot_L4nIkA", "JZI5lpi4p"], optionTitles: ["Variant 1", "Variant 2", "Variant 3"], title: "Variant", type: ControlType.Enum } });
addFonts(FramerxiMws3_R4, [{ explicitInter: true, fonts: [] }], { supportsExplicitInterCodegen: true });
var __FramerMetadata__ = { "exports": { "Props": { "type": "tsType", "annotations": { "framerContractVersion": "1" } }, "default": { "type": "reactComponent", "name": "FramerxiMws3_R4", "slots": [], "annotations": { "framerContractVersion": "1", "framerColorSyntax": "true", "framerAutoSizeImages": "true", "framerImmutableVariables": "true", "framerIntrinsicHeight": "316", "framerIntrinsicWidth": "314", "framerComponentViewportWidth": "true", "framerDisplayContentsDiv": "false", "framerCanvasComponentVariantDetails": '{"propertyName":"variant","data":{"default":{"layout":["fixed","fixed"]},"Ot_L4nIkA":{"layout":["fixed","fixed"]},"JZI5lpi4p":{"layout":["fixed","fixed"]}}}' } }, "__FramerMetadata__": { "type": "variable" } } };
export {
  __FramerMetadata__,
  xiMws3_R4_default as default
};
