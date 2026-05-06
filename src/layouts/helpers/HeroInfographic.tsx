import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const BRAND = "#24ab9d";

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const fadeLine = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 1.2, ease: "easeOut" },
  },
};

const rightLabels = [
  { text: "Orchestration", sub: "Compute & GPU Clusters", y: 180 },
  { text: "Sovereign Blueprint", sub: "Deployment Framework", y: 310 },
  { text: "ADCAP", sub: "Data Center Acceleration", y: 440 },
];

const leftLabels = [
  { text: "Infrastructure", sub: "Networking & Storage", y: 210 },
  { text: "AI4JOBS", sub: "Workforce Development", y: 350 },
];

const HeroInfographic = () => {
  const [svgContent, setSvgContent] = useState<string>("");

  useEffect(() => {
    fetch("/images/infrastructure/cloud-hero-dark.svg")
      .then((r) => r.text())
      .then((text) => {
        const inner = text
          .replace(/<svg[^>]*>/, "")
          .replace(/<\/svg>/, "");
        setSvgContent(inner);
      });
  }, []);

  const diagramLeft = 0;
  const diagramRight = 468;
  const labelPadding = 40;
  const rightLineStart = diagramRight + 10;
  const rightTextX = diagramRight + labelPadding + 20;
  const leftLineEnd = diagramLeft - 10;
  const leftTextX = diagramLeft - labelPadding - 20;
  const bracketLeft = diagramLeft - 20;
  const bracketRight = diagramRight + 20;

  return (
    <motion.div
      className="relative w-full max-w-[480px] mx-auto"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-brand/10 blur-3xl pointer-events-none" />

      <motion.div
        variants={fadeUp}
        animate={{ y: [0, -5, 0] }}
        transition={{
          y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        <svg
          viewBox="-160 -70 790 800"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          {/* AMALGAMY.AI title */}
          <motion.g variants={fadeUp}>
            <motion.text
              x={diagramRight / 2}
              y="-45"
              textAnchor="middle"
              fill="white"
              fontSize="15"
              fontWeight="700"
              fontFamily="Inter, system-ui, sans-serif"
              letterSpacing="0.25em"
              opacity="0.9"
            >
              AMALGAMY.AI
            </motion.text>
          </motion.g>

          {/* Bracket: horizontal line under title */}
          <motion.line
            x1={bracketLeft}
            y1="-28"
            x2={bracketRight}
            y2="-28"
            stroke={BRAND}
            strokeWidth="1"
            opacity="0.4"
            variants={fadeLine}
          />
          {/* Bracket: left vertical */}
          <motion.line
            x1={bracketLeft}
            y1="-28"
            x2={bracketLeft}
            y2="10"
            stroke={BRAND}
            strokeWidth="1"
            opacity="0.3"
            variants={fadeLine}
          />
          {/* Bracket: right vertical */}
          <motion.line
            x1={bracketRight}
            y1="-28"
            x2={bracketRight}
            y2="10"
            stroke={BRAND}
            strokeWidth="1"
            opacity="0.3"
            variants={fadeLine}
          />

          {/* Original SVG structure */}
          <g dangerouslySetInnerHTML={{ __html: svgContent }} />

          {/* Right-side labels */}
          {rightLabels.map((label, i) => (
            <motion.g key={label.text} variants={fadeUp}>
              <motion.line
                x1={rightLineStart}
                y1={label.y}
                x2={rightTextX - 8}
                y2={label.y}
                stroke="white"
                strokeWidth="0.5"
                strokeDasharray="3 3"
                opacity="0.2"
                variants={fadeLine}
              />
              <motion.circle
                cx={rightLineStart}
                cy={label.y}
                r="2"
                fill={BRAND}
                opacity="0.6"
              />
              <motion.text
                x={rightTextX}
                y={label.y - 4}
                textAnchor="start"
                fill="white"
                fontSize="11"
                fontWeight="600"
                fontFamily="Inter, system-ui, sans-serif"
                letterSpacing="0.06em"
                opacity="0.85"
              >
                {label.text}
              </motion.text>
              <motion.text
                x={rightTextX}
                y={label.y + 10}
                textAnchor="start"
                fill="white"
                fontSize="8"
                fontWeight="400"
                fontFamily="Inter, system-ui, sans-serif"
                opacity="0.45"
              >
                {label.sub}
              </motion.text>
            </motion.g>
          ))}

          {/* Left-side labels */}
          {leftLabels.map((label, i) => (
            <motion.g key={label.text} variants={fadeUp}>
              <motion.line
                x1={leftLineEnd}
                y1={label.y}
                x2={leftTextX + 8}
                y2={label.y}
                stroke="white"
                strokeWidth="0.5"
                strokeDasharray="3 3"
                opacity="0.2"
                variants={fadeLine}
              />
              <motion.circle
                cx={leftLineEnd}
                cy={label.y}
                r="2"
                fill={BRAND}
                opacity="0.6"
              />
              <motion.text
                x={leftTextX}
                y={label.y - 4}
                textAnchor="end"
                fill="white"
                fontSize="11"
                fontWeight="600"
                fontFamily="Inter, system-ui, sans-serif"
                letterSpacing="0.06em"
                opacity="0.85"
              >
                {label.text}
              </motion.text>
              <motion.text
                x={leftTextX}
                y={label.y + 10}
                textAnchor="end"
                fill="white"
                fontSize="8"
                fontWeight="400"
                fontFamily="Inter, system-ui, sans-serif"
                opacity="0.45"
              >
                {label.sub}
              </motion.text>
            </motion.g>
          ))}
        </svg>
      </motion.div>
    </motion.div>
  );
};

export default HeroInfographic;
