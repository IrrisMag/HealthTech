import { View, Dimensions } from "react-native";
import React, { useEffect, useState } from "react";
import { Canvas, Path, Skia } from "@shopify/react-native-skia";

interface WaveProps {
  isActive?: boolean;
  height?: number;
  waveCount?: number;
}

const Wave = ({ isActive = true, height = 120, waveCount = 4 }: WaveProps) => {
  const { width } = Dimensions.get("screen");
  const centerY = height / 2;
  const [time, setTime] = useState(0);

  useEffect(() => {
    if (!isActive) return;
    
    let frameId: number;
    const animate = () => {
      setTime((t) => t + 2);
      frameId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(frameId);
  }, [isActive]);

  const generateWavePath = (amp: number, freq: number, phaseShift: number) => {
    const path = Skia.Path.Make();
    path.moveTo(0, centerY);

    for (let x = 0; x <= width - 32; x += 2) {
      const normalizedX = x / (width - 32);
      const envelope = Math.sin(normalizedX * Math.PI);
      const adjustedAmp = amp * envelope * (isActive ? 1 : 0.3);

      const y = centerY + adjustedAmp * Math.sin(((freq * x + phaseShift) * Math.PI) / 180);
      path.lineTo(x, y);
    }

    return path;
  };

  const waves = [];
  for (let i = 0; i < waveCount; i++) {
    const amplitude = 8 + i * 4;
    const frequency = 1.2 + i * 0.2;
    const phase = (time * (0.8 + i * 0.1)) % 360;
    const opacity = isActive ? 0.15 + 0.2 * (waveCount - i) : 0.05;
    const color = `rgba(59, 130, 246, ${opacity})`;

    waves.push({
      path: generateWavePath(amplitude, frequency, phase),
      color,
    });
  }

  return (
    <View className="items-center">
      <Canvas style={{ width: width - 32, height }}>
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
    </View>
  );
};

export default Wave;
