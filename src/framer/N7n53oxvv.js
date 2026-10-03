var __dai_window=typeof window!=="undefined"?window:undefined;var __dai_navigator=typeof __dai_window!=="undefined"?navigator:undefined;

// http-url:https://framerusercontent.com/modules/UPHkNmBX6RzP6eXbu3CC/dRIW6OvhYrQzsdntmEn0/n7N53OxvV.js
import { jsx as _jsx2, jsxs as _jsxs2 } from "react/jsx-runtime";
import { addFonts, addPropertyControls as addPropertyControls2, ComponentViewportProvider, ControlType as ControlType2, cx, getFonts, SmartComponentScopedContainer, SVG, useComponentViewport, useLocaleInfo, useVariantState, withCSS } from "./_framer-runtime.js";
import { LayoutGroup, motion as motion2, MotionConfigContext } from "framer-motion";
import * as React from "react";
import { useRef } from "react";

// http-url:https://framerusercontent.com/modules/gh5xmpM9GHT9MXnnMpPc/yx3Yu3CvNlklDmNPtEF9/Animator.js
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Children } from "react";
import { addPropertyControls, ControlType, RenderTarget } from "./_framer-runtime.js";
import { motion, useMotionValue, useTransform } from "framer-motion";
function Animator(props) {
  const { pathAnimation, from, to, animate, shouldLoop, loopOptions, slots = [], endCircle } = props;
  const hasChildren = Children.count(slots) > 0;
  let customShape = /* @__PURE__ */ _jsxs("div", { style: placeholderStyles, children: [/* @__PURE__ */ _jsx("div", { style: emojiStyles, children: "\u270D\uFE0F" }), /* @__PURE__ */ _jsx("p", { style: titleStyles, children: "Connect to Graphic" }), /* @__PURE__ */ _jsx("p", { style: subtitleStyles, children: "Animates single or joined paths on Web Pages only." })] });
  if (hasChildren) {
    const firstChild = getFirstChild(slots);
    const svgChild = getFirstChild(firstChild.props.svg);
    const isSpring = pathAnimation.type === "spring";
    const shapeTransition = { pathLength: { ...pathAnimation, repeat: shouldLoop ? Infinity : 0, repeatType: loopOptions, stiffness: isSpring ? pathAnimation.stiffness / 1e3 : pathAnimation.stiffness, damping: isSpring ? pathAnimation.damping / 1e3 : pathAnimation.damping } };
    const pathLength = useMotionValue(0);
    const opacity = useTransform(pathLength, [0, 0.025], [0, 1]);
    const shapeProps = { variants: { start: { pathLength: from / 100 }, end: { pathLength: to / 100 } }, transition: shapeTransition };
    const isCanvas = RenderTarget.current() === RenderTarget.canvas;
    if (isCanvas) {
      customShape = firstChild;
    }
    if (!isCanvas && svgChild) {
      let attributes = svgChild.match(/[\w-]+="[^"]*"/g);
      let pathD;
      let stroke;
      let strokeWidth;
      let strokeLinecap;
      let strokeLinejoin;
      for (const element of attributes) {
        if (element.includes("d=")) {
          pathD = splitAndReplace(element);
        }
        if (element.includes("stroke=")) {
          stroke = splitAndReplace(element);
        }
        if (element.includes("stroke-width=")) {
          strokeWidth = splitAndReplace(element);
        }
        if (element.includes("stroke-linecap=")) {
          strokeLinecap = splitAndReplace(element);
        }
        if (element.includes("stroke-linejoin=")) {
          strokeLinejoin = splitAndReplace(element);
        }
      }
      let svgViewbox;
      svgViewbox = svgChild.split("viewBox=")[1];
      svgViewbox = svgViewbox.split(">")[0];
      svgViewbox = svgViewbox.replace(/^"(.+(?="$))"$/, "$1");
      customShape = /* @__PURE__ */ _jsx(motion.div, { initial: isCanvas || animate === false ? false : "start", animate: isCanvas || animate === false ? false : "end", style: { width: "100%", height: "100%", display: "flex", placeContent: "center", placeItems: "center", backgroundColor: "transparent", overflow: "hidden" }, children: /* @__PURE__ */ _jsx(motion.svg, { xmlns: "http://www.w3.org/2000/svg", width: "100%", height: "100%", viewBox: svgViewbox, children: /* @__PURE__ */ _jsx(motion.path, { ...shapeProps, d: pathD, stroke, strokeWidth, strokeLinejoin, strokeLinecap, fill: "transparent", style: !endCircle && { pathLength, opacity } }) }) });
    }
  }
  return customShape;
}
Animator.defaultProps = { animate: true, shouldLoop: false, loopOptions: "reverse", from: 0, to: 100, pathAnimation: { type: "tween", duration: 2 }, endCircle: true };
addPropertyControls(Animator, { slots: { type: ControlType.ComponentInstance, title: "Children" }, animate: { title: "Animate", type: ControlType.Boolean, defaultValue: Animator.defaultProps.animate, enabledTitle: "True", disabledTitle: "False" }, shouldLoop: { title: "Loop", type: ControlType.Boolean, defaultValue: Animator.defaultProps.shouldLoop, enabledTitle: "True", disabledTitle: "False", hidden(props) {
  return props.animate === false;
} }, loopOptions: { type: ControlType.Enum, title: "Type", defaultValue: Animator.defaultProps.loopOptions, options: ["loop", "reverse", "mirror"], optionTitles: ["Loop", "Reverse", "Mirror"], hidden(props) {
  return props.shouldLoop === false;
} }, endCircle: { title: "End Circle", type: ControlType.Boolean, defaultValue: Animator.defaultProps.endCircle, enabledTitle: "Show", disabledTitle: "Hide", hidden(props) {
  return props.animate === false;
} }, from: { title: "From", type: ControlType.Number, min: 0, max: 100, displayStepper: true, step: 1, defaultValue: Animator.defaultProps.from, unit: "%", hidden(props) {
  return props.animate === false;
} }, to: { title: "To", type: ControlType.Number, min: 0, max: 100, displayStepper: true, step: 1, defaultValue: Animator.defaultProps.to, unit: "%", hidden(props) {
  return props.animate === false;
} }, pathAnimation: { title: " ", type: ControlType.Transition, defaultValue: Animator.defaultProps.pathAnimation, hidden(props) {
  return props.animate === false;
} } });
var splitAndReplace = (string) => {
  return string.split("=")[1].replace(/['"]+/g, "");
};
function getFirstChild(slots) {
  let firstChild;
  Children.map(slots, (child) => {
    if (firstChild === void 0) {
      firstChild = child;
    }
  });
  return firstChild;
}
var placeholderStyles = { display: "flex", width: "100%", height: "100%", placeContent: "center", placeItems: "center", flexDirection: "column", color: "#96F", background: "rgba(136, 85, 255, 0.1)", fontSize: 11, overflow: "hidden" };
var emojiStyles = { fontSize: 32, marginBottom: 10 };
var titleStyles = { margin: 0, marginBottom: 10, fontWeight: 600, textAlign: "center" };
var subtitleStyles = { margin: 0, opacity: 0.7, maxWidth: 150, lineHeight: 1.5, textAlign: "center" };

// http-url:https://framerusercontent.com/modules/UPHkNmBX6RzP6eXbu3CC/dRIW6OvhYrQzsdntmEn0/n7N53OxvV.js
var AnimatorFonts = getFonts(Animator);
var cycleOrder = ["eww0o3Yl7", "PvX7FM6Eh"];
var serializationHash = "framer-0ZpOy";
var variantClassNames = { eww0o3Yl7: "framer-v-b4lp28", PvX7FM6Eh: "framer-v-1ml7hi2" };
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
  return /* @__PURE__ */ _jsx2(MotionConfigContext.Provider, { value: contextValue, children });
};
var humanReadableVariantMap = { Animate: "PvX7FM6Eh", Default: "eww0o3Yl7" };
var Variants = motion2.create(React.Fragment);
var getProps = ({ height, id, width, ...props }) => {
  return { ...props, variant: humanReadableVariantMap[props.variant] ?? props.variant ?? "eww0o3Yl7" };
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
  const { baseVariant, classNames, clearLoadingGesture, gestureHandlers, gestureVariant, isLoading, setGestureState, setVariant, variants } = useVariantState({ cycleOrder, defaultVariant: "eww0o3Yl7", ref: refBinding, variant, variantClassNames });
  const layoutDependency = createLayoutDependency(props, variants);
  const sharedStyleClassNames = [];
  const scopingClassNames = cx(serializationHash, ...sharedStyleClassNames);
  const isDisplayed = () => {
    if (baseVariant === "PvX7FM6Eh")
      return true;
    return false;
  };
  return /* @__PURE__ */ _jsx2(LayoutGroup, { id: layoutId ?? defaultLayoutId, children: /* @__PURE__ */ _jsx2(Variants, { animate: variants, initial: false, children: /* @__PURE__ */ _jsx2(Transition, { value: transition1, children: /* @__PURE__ */ _jsxs2(motion2.div, { ...restProps, ...gestureHandlers, className: cx(scopingClassNames, "framer-b4lp28", className, classNames), "data-framer-name": "Default", layoutDependency, layoutId: "n7N53OxvV__eww0o3Yl7", ref: refBinding, style: { ...style }, ...addPropertyOverrides({ PvX7FM6Eh: { "data-framer-name": "Animate" } }, baseVariant, gestureVariant), children: [isDisplayed() && /* @__PURE__ */ _jsx2(ComponentViewportProvider, { children: /* @__PURE__ */ _jsx2(SmartComponentScopedContainer, { className: "framer-jtt07z-container", "data-framer-name": "Stem", isAuthoredByUser: true, isModuleExternal: true, layoutDependency, layoutId: "n7N53OxvV__msXXhKd1S-container", name: "Stem", nodeId: "msXXhKd1S", rendersWithMotion: true, scopeId: "n7N53OxvV", children: /* @__PURE__ */ _jsx2(Animator, { animate: true, endCircle: false, from: 0, height: "100%", id: "msXXhKd1S", layoutId: "n7N53OxvV__msXXhKd1S", loopOptions: "reverse", name: "Stem", pathAnimation: { delay: 0.1, duration: 1.8, ease: [0.44, 0, 0.56, 1], type: "tween" }, shouldLoop: false, slots: [/* @__PURE__ */ _jsx2(SVG, { className: "framer-1vhirw9", "data-framer-name": "Stem", layout: "position", layoutDependency, layoutId: "n7N53OxvV__qFZK3Y3yY", opacity: 1, svg: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 341 307"><path d="M 3 38.851 C 3 16.973 21.186 3.333 41.506 3.124 C 58.384 2.95 76.49 1.587 89.407 14.504 C 103.013 28.109 123.703 54.188 94.436 63.596 C 78.308 68.78 80.93 44.383 86.099 36.999 C 100.105 16.99 122.143 11.064 145.115 8.152 C 172.18 4.722 193.894 13.179 215.379 29.059 C 236.14 44.404 249.519 69.22 249.519 95.022 C 249.519 106.843 251.465 119.34 243.5 128.5 C 238.899 133.791 233.373 135.602 225.833 136.44 C 209.088 138.3 217.047 113.555 224.708 107.262 C 256.889 80.828 304.604 85.075 326.928 122.281 C 339.183 142.707 339.199 169.339 336.323 192.346 C 334.556 206.481 329.813 227.875 323.5 240.5 C 315.035 257.431 303.944 269.047 288.356 280.738 C 281.145 286.146 273.333 291.626 265.265 295.691 C 252.955 301.894 240.203 302.917 226.627 304.16 C 195.857 306.978 141 286.5 145.115 218.5" fill="transparent" stroke-width="5" stroke="rgb(200, 214, 101)" stroke-linecap="round" stroke-miterlimit="10" stroke-dasharray=""></path></svg>', svgContentId: 10319191482, withExternalLayout: true })], style: { height: "100%", width: "100%" }, to: 100, width: "100%" }) }) }), isDisplayed() && /* @__PURE__ */ _jsx2(ComponentViewportProvider, { children: /* @__PURE__ */ _jsx2(SmartComponentScopedContainer, { className: "framer-1jnut3u-container", "data-framer-name": "Flower", isAuthoredByUser: true, isModuleExternal: true, layoutDependency, layoutId: "n7N53OxvV__A6tOyzqgk-container", name: "Flower", nodeId: "A6tOyzqgk", rendersWithMotion: true, scopeId: "n7N53OxvV", children: /* @__PURE__ */ _jsx2(Animator, { animate: true, endCircle: false, from: 0, height: "100%", id: "A6tOyzqgk", layoutId: "n7N53OxvV__A6tOyzqgk", loopOptions: "reverse", name: "Flower", pathAnimation: { delay: 1.8, duration: 1.5, ease: [0, 0, 1, 1], type: "tween" }, shouldLoop: false, slots: [/* @__PURE__ */ _jsx2(SVG, { className: "framer-1kpm11k", "data-framer-name": "Flower", layout: "position", layoutDependency, layoutId: "n7N53OxvV__iTi08hqcc", opacity: 1, svg: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 77 93"><path d="M 28.006 45.301 C 27.761 43.1 26.661 41.025 26.661 38.726 L 26.661 22.538 C 26.661 17.488 26.428 13.039 28.678 8.366 C 29.32 7.034 31.623 3.528 33.161 3.186 C 36.124 2.527 38.242 3.615 39.886 6.523 C 41.281 8.992 43.312 10.55 44.145 13.373 C 45.085 16.557 45.426 19.477 46.038 22.737 C 46.963 27.672 46.66 33.304 45.141 38.029 C 44.798 39.095 44.412 40.399 44.17 41.491 C 43.68 43.696 45.289 39.536 45.54 38.951 C 47.45 34.492 50.748 30.318 53.41 26.273 C 55.478 23.131 57.825 20.053 61.156 18.179 C 62.636 17.346 66.688 16.866 68.353 17.606 C 73.003 19.673 73.733 27.056 73.733 31.379 C 73.733 39.247 63.996 45.532 57.345 47.194 C 55.815 47.577 54.36 47.896 53.086 48.639 C 51.143 49.772 54.405 49.336 55.352 49.336 C 59.306 49.336 62.092 48.903 64.991 51.802 C 70.463 57.274 74.099 68.527 68.801 75.338 C 65.776 79.228 63.391 80.369 58.491 81.39 C 53.795 82.368 50.201 81.224 47.532 77.181 C 45.644 74.323 44.271 71.128 43.024 67.941 C 42.754 67.25 41.848 64.14 41.355 65.027 C 38.556 70.065 35.448 75.966 31.368 80.045 C 28.051 83.363 24.811 86.627 20.36 88.339 C 17.386 89.483 10.745 91.272 8.53 88.239 C 4.249 82.381 -1.067 65.691 7.832 61.241 C 10.812 59.751 14.888 60.096 18.143 60.096 C 19.609 60.096 20.813 60.383 22.178 60.544 C 23.446 60.694 22.297 61.003 21.281 60.444 C 13.958 56.416 7.832 48.407 7.832 39.947 C 7.832 38.155 7.577 35.969 9.849 35.464 C 12.678 34.835 15.561 34.99 18.492 34.99 C 20.643 34.99 24.182 36.797 25.764 38.154 C 26.843 39.078 28.524 40.032 29.251 41.267 C 29.564 41.799 30.281 42.852 30.696 43.06" fill="transparent" stroke-width="5" stroke="rgb(255, 104, 53)" stroke-linecap="round" stroke-miterlimit="10" stroke-dasharray=""></path></svg>', svgContentId: 12631530374, withExternalLayout: true })], style: { height: "100%", width: "100%" }, to: 100, width: "100%" }) }) }), isDisplayed() && /* @__PURE__ */ _jsx2(ComponentViewportProvider, { children: /* @__PURE__ */ _jsx2(SmartComponentScopedContainer, { className: "framer-1s6qdzm-container", "data-framer-name": "Circle", isAuthoredByUser: true, isModuleExternal: true, layoutDependency, layoutId: "n7N53OxvV__QfvntohVY-container", name: "Circle", nodeId: "QfvntohVY", rendersWithMotion: true, scopeId: "n7N53OxvV", children: /* @__PURE__ */ _jsx2(Animator, { animate: true, endCircle: false, from: 0, height: "100%", id: "QfvntohVY", layoutId: "n7N53OxvV__QfvntohVY", loopOptions: "reverse", name: "Circle", pathAnimation: { delay: 3.4, duration: 0.8, ease: [0, 0, 1, 1], type: "tween" }, shouldLoop: false, slots: [/* @__PURE__ */ _jsx2(SVG, { className: "framer-ciqwso", "data-framer-name": "Circle", layout: "position", layoutDependency, layoutId: "n7N53OxvV__LBmmv0hx9", opacity: 1, svg: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 21 17"><path d="M 10.42 3.095 C 5.944 3.095 3.509 5.818 3.247 10.268 C 3.016 14.203 9.841 13.562 12.662 13.406 C 14.971 13.278 19.625 8.269 17.593 5.984 C 14.956 3.017 11.797 3.543 8.179 3.543" fill="transparent" stroke-width="5" stroke="rgb(255, 104, 53)" stroke-linecap="round" stroke-miterlimit="10" stroke-dasharray=""></path></svg>', svgContentId: 11270497684, withExternalLayout: true })], style: { height: "100%", width: "100%" }, to: 100, width: "100%" }) }) })] }) }) }) });
});
var css = ["@supports (aspect-ratio: 1) { body { --framer-aspect-ratio-supported: auto; } }", ".framer-0ZpOy.framer-x5u3jf, .framer-0ZpOy .framer-x5u3jf { display: block; }", ".framer-0ZpOy.framer-b4lp28 { height: auto; overflow: visible; position: relative; width: 100%; }", ".framer-0ZpOy .framer-jtt07z-container { bottom: 0px; flex: none; left: 0px; position: absolute; right: 0px; top: 0px; }", ".framer-0ZpOy .framer-1vhirw9 { height: 307px; position: relative; width: 341px; }", ".framer-0ZpOy .framer-1jnut3u-container { bottom: 68px; flex: none; height: 93px; left: 105px; position: absolute; width: 82px; }", ".framer-0ZpOy .framer-1kpm11k { height: 93px; position: relative; width: 77px; }", ".framer-0ZpOy .framer-1s6qdzm-container { bottom: 96px; flex: none; height: 20px; left: 133px; position: absolute; width: 21px; }", ".framer-0ZpOy .framer-ciqwso { height: 17px; position: relative; width: 21px; }"];
var Framern7N53OxvV = withCSS(Component, css, "framer-0ZpOy");
var n7N53OxvV_default = Framern7N53OxvV;
Framern7N53OxvV.displayName = "Flower 2";
Framern7N53OxvV.defaultProps = { height: 307, width: 341 };
addPropertyControls2(Framern7N53OxvV, { variant: { options: ["eww0o3Yl7", "PvX7FM6Eh"], optionTitles: ["Default", "Animate"], title: "Variant", type: ControlType2.Enum } });
addFonts(Framern7N53OxvV, [{ explicitInter: true, fonts: [] }, ...AnimatorFonts], { supportsExplicitInterCodegen: true });
var __FramerMetadata__ = { "exports": { "default": { "type": "reactComponent", "name": "Framern7N53OxvV", "slots": [], "annotations": { "framerComponentViewportWidth": "true", "framerDisplayContentsDiv": "false", "framerAutoSizeImages": "true", "framerColorSyntax": "true", "framerIntrinsicWidth": "341", "framerContractVersion": "1", "framerImmutableVariables": "true", "framerIntrinsicHeight": "307", "framerCanvasComponentVariantDetails": '{"propertyName":"variant","data":{"default":{"layout":["fixed","fixed"]},"PvX7FM6Eh":{"layout":["fixed","fixed"]}}}' } }, "Props": { "type": "tsType", "annotations": { "framerContractVersion": "1" } }, "__FramerMetadata__": { "type": "variable" } } };
export {
  __FramerMetadata__,
  n7N53OxvV_default as default
};
