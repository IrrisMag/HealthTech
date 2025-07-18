import { View, Text, Dimensions } from "react-native";
import React, { useEffect, useState } from "react";
import { Canvas, Path, Skia } from "@shopify/react-native-skia";

type Props = {};

const wave = (props: Props) => {
  const { width } = Dimensions.get("screen");

  const height = 200;
  const centerY = height / 2;
  const waveCount = 5;

  const [time, setTime] = useState(0);

  useEffect(() => {
    let frameId: number;
    const animate = () => {
      setTime((t) => t + 1);
      frameId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(frameId);
  }, []);

  const generateWavePath = (amp: number, freq: number, phaseShift: number) => {
    const path = Skia.Path.Make();
    path.moveTo(0, centerY);

    for (let x = 0; x <= width; x += 2) {
      // Create envelope that peaks in the middle and tapers at both ends
      const normalizedX = x / width; // 0 to 1
      const envelope = Math.sin(normalizedX * Math.PI); // Bell curve: 0 -> 1 -> 0
      const adjustedAmp = amp * envelope;

      const y =
        centerY +
        adjustedAmp * Math.sin(((freq * x + phaseShift) * Math.PI) / 180);
      path.lineTo(x, y);
    }

    return path;
  };

  const waves = [];
  for (let i = 0; i < waveCount; i++) {
    const amplitude = 10 + i * 5;
    const frequency = 1.5 + i * 0.3;
    const phase = (time * (1 + i * 0.1)) % 360;
    const color = `rgba(0, 173, 255, ${0.1 + 0.15 * (waveCount - i)})`;

    waves.push({
      path: generateWavePath(amplitude, frequency, phase),
      color,
    });
  }

  return (
    <Canvas style={{ width, height, marginHorizontal: "auto" }}>
      {waves.map((wave, index) => (
        <Path
          key={index}
          path={wave.path}
          color={wave.color}
          style="stroke"
          strokeWidth={2}
        />
      ))}
    </Canvas>
  );
};

export default wave;
