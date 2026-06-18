import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, {
  Defs, LinearGradient, Stop, Filter, FeGaussianBlur,
  FeMerge, FeMergeNode, Polygon, Line, Circle,
  FeSpecularLighting, FePointLight, FeComposite, FeBlend,
} from 'react-native-svg';
import { useOxoStore } from '../../../core/loop/oxoCoreLoop';
import type { AvatarState } from '../../../domain/entities';

const GLOW_COLORS: Record<AvatarState, string> = {
  ONLINE:      'rgba(0,200,180,0.7)',
  PROCESSANDO: 'rgba(80,100,255,0.7)',
  VENDA:       'rgba(100,255,100,0.9)',
  ALERTA:      'rgba(255,170,0,0.8)',
  PAUSADO:     'rgba(255,60,60,0.7)',
};

interface Props {
  size?: number;
}

// Duração do "respiro" por estado — mais rápido = mais alerta/ativo
const BREATHE_MS: Record<AvatarState, number> = {
  ONLINE:      2000,
  PROCESSANDO: 650,
  VENDA:       450,
  ALERTA:      550,
  PAUSADO:     3200,
};

export function CrystalX({ size = 200 }: Props) {
  const avatarState = useOxoStore((s) => s.avatarState);
  const breathe = useRef(new Animated.Value(0)).current;
  const spin    = useRef(new Animated.Value(0)).current;
  const burst   = useRef(new Animated.Value(1)).current;
  const breatheLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 8000, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, []);

  // Reinicia o loop de respiração com duração própria do estado atual
  useEffect(() => {
    breatheLoopRef.current?.stop();
    const dur = BREATHE_MS[avatarState] ?? 2000;
    breatheLoopRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1, duration: dur, easing: Easing.inOut(Easing.sine), useNativeDriver: true }),
        Animated.timing(breathe, { toValue: 0, duration: dur, easing: Easing.inOut(Easing.sine), useNativeDriver: true }),
      ])
    );
    breatheLoopRef.current.start();
  }, [avatarState]);

  // Burst de escala ao detectar venda — feedback visual imediato
  useEffect(() => {
    if (avatarState === 'VENDA') {
      burst.setValue(1);
      Animated.sequence([
        Animated.timing(burst, { toValue: 1.18, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.spring(burst, { toValue: 1, friction: 4, tension: 80, useNativeDriver: true }),
      ]).start();
    }
  }, [avatarState]);

  const glowOpacity = breathe.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });
  const ringRotate  = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const glowColor = GLOW_COLORS[avatarState];
  const w = size;
  const h = size * (290 / 280);
  const cx = w / 2;
  const cy = h / 2;

  return (
    <View style={[styles.wrap, { width: w, height: h }]}>
      {/* anel orbital — gira continuamente, cor reflete o estado do avatar */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { transform: [{ rotate: ringRotate }] },
        ]}
      >
        <Svg width={w} height={h} viewBox="0 0 280 290">
          <Circle
            cx={140} cy={145} r={128}
            fill="none"
            stroke={glowColor}
            strokeWidth={1.5}
            strokeDasharray="4 14"
            opacity={0.55}
          />
        </Svg>
      </Animated.View>

      <Animated.View style={[StyleSheet.absoluteFill, { opacity: glowOpacity, transform: [{ scale: burst }] }]}>
        <Svg width={w} height={h} viewBox="0 0 280 290">
          <Defs>
            <LinearGradient id="xg1" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%"   stopColor="#e8fffc" />
              <Stop offset="20%"  stopColor="#b0f0e8" />
              <Stop offset="50%"  stopColor="#50c0b0" />
              <Stop offset="80%"  stopColor="#1e6868" />
              <Stop offset="100%" stopColor="#0a3030" />
            </LinearGradient>
            <LinearGradient id="xg2" x1="100%" y1="0%" x2="0%" y2="100%">
              <Stop offset="0%"   stopColor="#e8fffc" />
              <Stop offset="20%"  stopColor="#b0f0e8" />
              <Stop offset="50%"  stopColor="#50c0b0" />
              <Stop offset="80%"  stopColor="#1e6868" />
              <Stop offset="100%" stopColor="#0a3030" />
            </LinearGradient>
            <LinearGradient id="hi1" x1="30%" y1="0%" x2="70%" y2="100%">
              <Stop offset="0%"   stopColor="rgba(255,255,255,0.55)" />
              <Stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </LinearGradient>
            <Filter id="glow" x="-25%" y="-25%" width="150%" height="150%">
              <FeGaussianBlur in="SourceGraphic" stdDeviation="10" result="b" />
              <FeMerge><FeMergeNode in="b" /><FeMergeNode in="b" /><FeMergeNode in="SourceGraphic" /></FeMerge>
            </Filter>
            <Filter id="cg" x="-80%" y="-80%" width="260%" height="260%">
              <FeGaussianBlur stdDeviation="9" />
            </Filter>
          </Defs>

          {/* outer glow */}
          <Polygon points="36,0 78,0 244,290 202,290" fill="#00c0b0" opacity={0.3} filter="url(#glow)" />
          <Polygon points="202,0 244,0 78,290 36,290"  fill="#00c0b0" opacity={0.3} filter="url(#glow)" />

          {/* bar / */}
          <Polygon points="202,0 244,0 78,290 36,290"  fill="url(#xg2)" opacity={0.88} />
          <Polygon points="202,0 220,0 84,290 66,290"  fill="url(#hi1)" opacity={0.5} />

          {/* bar \ */}
          <Polygon points="36,0 78,0 244,290 202,290"  fill="url(#xg1)" opacity={0.94} />
          <Polygon points="36,0 54,0 220,290 202,290"  fill="url(#hi1)" opacity={0.5} />

          {/* edge lines */}
          <Line x1="36"  y1="0"   x2="202" y2="290" stroke="rgba(220,255,252,0.95)" strokeWidth={2.5} />
          <Line x1="78"  y1="0"   x2="244" y2="290" stroke="rgba(220,255,252,0.6)"  strokeWidth={1.5} />
          <Line x1="244" y1="0"   x2="78"  y2="290" stroke="rgba(220,255,252,0.95)" strokeWidth={2.5} />
          <Line x1="202" y1="0"   x2="36"  y2="290" stroke="rgba(220,255,252,0.6)"  strokeWidth={1.5} />

          {/* center glow */}
          <Circle cx={140} cy={145} r={35} fill="rgba(100,240,220,0.4)"  filter="url(#cg)" />
          <Circle cx={140} cy={145} r={18} fill="rgba(200,255,252,0.65)" filter="url(#cg)" />
          <Circle cx={140} cy={145} r={8}  fill="rgba(240,255,254,0.96)" />
          <Circle cx={140} cy={145} r={3}  fill="white" />

          {/* tips */}
          {([
            [54, 6], [226, 6], [228, 284], [56, 284]
          ] as [number, number][]).map(([x, y], i) => (
            <React.Fragment key={i}>
              <Circle cx={x} cy={y} r={5}  fill="rgba(255,255,255,0.98)" />
              <Circle cx={x} cy={y} r={12} fill="rgba(180,255,248,0.3)"  filter="url(#cg)" />
            </React.Fragment>
          ))}
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
});
