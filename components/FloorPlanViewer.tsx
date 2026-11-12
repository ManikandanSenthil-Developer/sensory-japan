import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Svg, { Rect, Text as SvgText, Line, G, Defs, Pattern, Path, Polygon } from 'react-native-svg';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { FloorPlanData } from '../constants/mockData';
import { Feather } from '@expo/vector-icons';

interface FloorPlanViewerProps {
  data: FloorPlanData;
}

const VIEWER_PADDING = 30;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PLAN_WIDTH = SCREEN_WIDTH - 40;
const PLAN_HEIGHT = 400;

export default function FloorPlanViewer({ data }: FloorPlanViewerProps) {
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'clean' | 'sketch'>('sketch');

  // Find bounding box of all rooms to center them perfectly
  const minX = Math.min(...data.rooms.map(r => r.x));
  const maxX = Math.max(...data.rooms.map(r => r.x + r.width));
  const minY = Math.min(...data.rooms.map(r => r.y));
  const maxY = Math.max(...data.rooms.map(r => r.y + r.height));

  const contentWidth = maxX - minX;
  const contentHeight = maxY - minY;

  const scaleX = (PLAN_WIDTH - VIEWER_PADDING * 2) / contentWidth;
  const scaleY = (PLAN_HEIGHT - VIEWER_PADDING * 2 - 40) / contentHeight; // Leave room for title block
  const scale = Math.min(scaleX, scaleY);

  const offsetX = (PLAN_WIDTH - contentWidth * scale) / 2;
  const offsetY = (PLAN_HEIGHT - 40 - contentHeight * scale) / 2;

  // Simple pseudo-random for sketchy offset
  const roughOffset = (seed: number) => {
    if (viewMode === 'clean') return 0;
    const x = Math.sin(seed * 9999) * 1.5;
    return x;
  };

  const isWetArea = (name: string) => 
    name.toLowerCase().includes('bath') || 
    name.toLowerCase().includes('kitchen') || 
    name.toLowerCase().includes('toilet');

  return (
    <View style={[styles.container, { backgroundColor: Colors.surface, borderColor: Colors.border }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, Typography.h2, { color: Colors.textPrimary }]}>
            <Feather name="grid" size={20} /> Floor Plan
          </Text>
          <Text style={[styles.subtitle, Typography.body, { color: Colors.textSecondary }]}>
            {data.totalArea.toLocaleString()} sqft total
          </Text>
        </View>
        
        {/* Toggle View */}
        <View style={styles.toggleGroup}>
          <TouchableOpacity 
            style={[styles.toggleBtn, viewMode === 'clean' && { backgroundColor: Colors.primaryLight }]}
            onPress={() => setViewMode('clean')}>
            <Text style={[Typography.caption, { color: viewMode === 'clean' ? Colors.primaryDark : Colors.textSecondary }]}>Clean</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleBtn, viewMode === 'sketch' && { backgroundColor: Colors.accentLight }]}
            onPress={() => setViewMode('sketch')}>
            <Text style={[Typography.caption, { color: viewMode === 'sketch' ? Colors.accentDark : Colors.textSecondary }]}>Sketch</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.planContainer, { backgroundColor: viewMode === 'sketch' ? Colors.sketchFill : Colors.surface }]}>
        <Svg width={PLAN_WIDTH} height={PLAN_HEIGHT}>
          <Defs>
            <Pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <Path d="M 20 0 L 0 0 0 20" fill="none" stroke={Colors.sketchGrid} strokeWidth={viewMode === 'sketch' ? "0.5" : "0"} opacity={0.5} />
            </Pattern>
            <Pattern id="hatch" patternUnits="userSpaceOnUse" width="6" height="6">
              <Line x1="0" y1="6" x2="6" y2="0" stroke={Colors.sketchGrid} strokeWidth="0.8" />
            </Pattern>
            <Pattern id="hatch-clean" patternUnits="userSpaceOnUse" width="6" height="6">
              <Line x1="0" y1="6" x2="6" y2="0" stroke={Colors.border} strokeWidth="0.5" />
            </Pattern>
          </Defs>

          {/* Background Grid */}
          <Rect width={PLAN_WIDTH} height={PLAN_HEIGHT} fill="url(#grid)" />

          {/* Paper Border (Sketch Mode) */}
          {viewMode === 'sketch' && (
            <G>
              <Rect x={4} y={4} width={PLAN_WIDTH - 8} height={PLAN_HEIGHT - 8} fill="none" stroke={Colors.sketchLine} strokeWidth={1} />
              <Rect x={8} y={8} width={PLAN_WIDTH - 16} height={PLAN_HEIGHT - 16} fill="none" stroke={Colors.sketchLine} strokeWidth={0.5} />
            </G>
          )}

          {/* Rooms */}
          {data.rooms.map((room, i) => {
            const rx = (room.x - minX) * scale + offsetX;
            const ry = (room.y - minY) * scale + offsetY;
            const rw = room.width * scale;
            const rh = room.height * scale;
            
            const isWet = isWetArea(room.name);
            const r1 = roughOffset(i);
            const r2 = roughOffset(i + 1);

            return (
              <G key={room.id} onPress={() => setActiveRoom(room.id === activeRoom ? null : room.id)}>
                {viewMode === 'sketch' ? (
                  // Sketch Mode Room
                  <G>
                    {/* Fill */}
                    <Rect x={rx} y={ry} width={rw} height={rh} fill={isWet ? "url(#hatch)" : "none"} />
                    {activeRoom === room.id && <Rect x={rx} y={ry} width={rw} height={rh} fill={Colors.accentLight} opacity={0.3} />}
                    
                    {/* Rough Lines */}
                    <Line x1={rx-r1} y1={ry+r2} x2={rx+rw+r1} y2={ry-r2} stroke={Colors.sketchLine} strokeWidth={1.8} strokeLinecap="round" />
                    <Line x1={rx+rw+r1} y1={ry-r2} x2={rx+rw-r2} y2={ry+rh+r1} stroke={Colors.sketchLine} strokeWidth={1.8} strokeLinecap="round" />
                    <Line x1={rx+rw-r2} y1={ry+rh+r1} x2={rx+r1} y2={ry+rh-r2} stroke={Colors.sketchLine} strokeWidth={1.8} strokeLinecap="round" />
                    <Line x1={rx+r1} y1={ry+rh-r2} x2={rx-r1} y2={ry+r2} stroke={Colors.sketchLine} strokeWidth={1.8} strokeLinecap="round" />
                  </G>
                ) : (
                  // Clean Mode Room
                  <Rect
                    x={rx} y={ry} width={rw} height={rh}
                    fill={isWet ? "url(#hatch-clean)" : Colors.primaryLight}
                    fillOpacity={activeRoom === room.id ? 0.4 : 0.1}
                    stroke={Colors.primary} strokeWidth={1} rx={2}
                  />
                )}

                {/* Text Label */}
                <G transform={viewMode === 'sketch' ? `rotate(-2, ${rx + rw/2}, ${ry + rh/2})` : ''}>
                  <SvgText
                    x={rx + rw / 2}
                    y={ry + rh / 2 - 4}
                    fill={viewMode === 'sketch' ? Colors.sketchAnnotation : Colors.textPrimary}
                    fontSize={rw > 60 ? (viewMode === 'sketch' ? 10 : 11) : 7}
                    fontFamily={viewMode === 'sketch' ? Typography.mono.fontFamily : Typography.label.fontFamily}
                    textAnchor="middle"
                  >
                    {room.name.toUpperCase()}
                  </SvgText>
                  <SvgText
                    x={rx + rw / 2}
                    y={ry + rh / 2 + 8}
                    fill={viewMode === 'sketch' ? Colors.sketchAnnotation : Colors.textSecondary}
                    fontSize={rw > 60 ? (viewMode === 'sketch' ? 9 : 10) : 6}
                    fontFamily={viewMode === 'sketch' ? Typography.mono.fontFamily : Typography.caption.fontFamily}
                    textAnchor="middle"
                  >
                    {room.areaSqft} sqft
                  </SvgText>
                </G>
              </G>
            );
          })}

          {/* Dimensions (Sketch Mode only for now, on edges) */}
          {viewMode === 'sketch' && (
            <G>
              {/* Top Dimension */}
              <Line x1={offsetX} y1={offsetY - 15} x2={offsetX + contentWidth * scale} y2={offsetY - 15} stroke={Colors.sketchAnnotation} strokeWidth={0.5} />
              <Line x1={offsetX} y1={offsetY - 18} x2={offsetX} y2={offsetY - 12} stroke={Colors.sketchAnnotation} strokeWidth={1} />
              <Line x1={offsetX + contentWidth * scale} y1={offsetY - 18} x2={offsetX + contentWidth * scale} y2={offsetY - 12} stroke={Colors.sketchAnnotation} strokeWidth={1} />
              <SvgText x={offsetX + (contentWidth * scale)/2} y={offsetY - 20} fill={Colors.sketchAnnotation} fontSize={8} fontFamily={Typography.mono.fontFamily} textAnchor="middle">WIDTH</SvgText>
            </G>
          )}

          {/* North Arrow */}
          {viewMode === 'sketch' && (
            <G transform={`translate(${PLAN_WIDTH - 30}, 25)`}>
              <Line x1={0} y1={10} x2={0} y2={-10} stroke={Colors.sketchLine} strokeWidth={1} />
              <Polygon points="0,-12 -4,-4 4,-4" fill={Colors.sketchLine} />
              <SvgText x={0} y={18} fill={Colors.sketchAnnotation} fontSize={8} fontFamily={Typography.mono.fontFamily} textAnchor="middle">N</SvgText>
            </G>
          )}

          {/* Title Block */}
          {viewMode === 'sketch' && (
            <G transform={`translate(15, ${PLAN_HEIGHT - 25})`}>
              <Line x1={0} y1={0} x2={PLAN_WIDTH - 30} y2={0} stroke={Colors.sketchLine} strokeWidth={1} />
              <SvgText x={0} y={12} fill={Colors.sketchAnnotation} fontSize={9} fontFamily={Typography.mono.fontFamily}>SITE PLAN — LANDSENSE AI</SvgText>
              <SvgText x={PLAN_WIDTH - 30} y={12} fill={Colors.sketchAnnotation} fontSize={9} fontFamily={Typography.mono.fontFamily} textAnchor="end">{new Date().toLocaleDateString()}</SvgText>
            </G>
          )}

        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {},
  subtitle: {},
  toggleGroup: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden'
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  planContainer: {
    alignItems: 'center',
    overflow: 'hidden',
  },
});
