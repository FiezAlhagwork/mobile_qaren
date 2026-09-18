import { useState } from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Line, Path, Polyline } from 'react-native-svg';

import { dayMonth } from '@/lib/format';
import type { PriceHistoryPoint } from '@/types/api';
import { Num } from './Num';

const BRAND = '#F0434A';
const LINE = '#EDEDF2';

/**
 * الأقدم يمين والأحدث يسار — نفس اتجاه القراءة بباقي الواجهة.
 *
 * SVG ما بينقلب مع `I18nManager.forceRTL`، فالانعكاس لازم ينحسب بالإحداثيات.
 * حطّه `false` بيرجّع الرسم لاتجاه لاتيني (الأقدم يسار) بلا أي تعديل تاني.
 */
const OLDEST_ON_RIGHT = true;

const PAD_X = 8;
const PAD_Y = 14;

interface PriceChartProps {
  /** مرتبة تصاعديًا بـ `checkedAt` — هيك بيرجّعها السيرفر */
  points: PriceHistoryPoint[];
  height?: number;
}

/**
 * منحنى أسعار آخر 30 يوم.
 *
 * ما بيتعامل مع حالة «ما في قراءات» — الشاشة فوقه بتعرض حالة فاضية بدلها،
 * لأن مراقبة جديدة بلا قراءات وضع طبيعي مش خطأ.
 */
export function PriceChart({ points, height = 176 }: PriceChartProps) {
  const [width, setWidth] = useState(0);

  const prices = points.map((point) => point.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  const plotHeight = height - PAD_Y * 2;
  const plotWidth = width - PAD_X * 2;

  const xAt = (index: number): number => {
    // نقطة وحدة: ما في مدى نقسم عليه، فبتنحط بالنص
    if (points.length < 2) return width / 2;
    const ratio = index / (points.length - 1);
    return PAD_X + (OLDEST_ON_RIGHT ? 1 - ratio : ratio) * plotWidth;
  };

  const yAt = (price: number): number => {
    // كل الأسعار متساوية (وارد جدًا مع قراءتين أو تلاتة) — القسمة على صفر
    // بتعطي NaN وبتكسر مسار الـ SVG كامل، فمنرسم خط بالنص
    if (max === min) return PAD_Y + plotHeight / 2;
    return PAD_Y + ((max - price) / (max - min)) * plotHeight;
  };

  const coords = points.map((point, index) => ({
    x: xAt(index),
    y: yAt(point.price),
  }));

  const polyline = coords.map(({ x, y }) => `${x},${y}`).join(' ');

  // التظليل = نفس الخط، بس مقفول لتحت على قاعدة الرسم
  const area =
    coords.length > 1
      ? `M ${coords[0].x} ${coords[0].y} ` +
        coords
          .slice(1)
          .map(({ x, y }) => `L ${x} ${y}`)
          .join(' ') +
        ` L ${coords[coords.length - 1].x} ${height} L ${coords[0].x} ${height} Z`
      : '';

  // الأحدث هو آخر عنصر بالمصفوفة مهما كان اتجاه الرسم
  const latest = coords[coords.length - 1];
  const oldestLabel = dayMonth(points[0].checkedAt);
  const newestLabel = dayMonth(points[points.length - 1].checkedAt);

  return (
    <View>
      <View
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
        style={{ height }}
      >
        {width > 0 ? (
          <Svg width={width} height={height}>
            {/* خطّي الحد الأعلى والأدنى — بيعطوا المنحنى إطار يُقرأ عليه */}
            <Line x1={0} y1={PAD_Y} x2={width} y2={PAD_Y} stroke={LINE} strokeWidth={1} />
            <Line
              x1={0}
              y1={PAD_Y + plotHeight}
              x2={width}
              y2={PAD_Y + plotHeight}
              stroke={LINE}
              strokeWidth={1}
            />

            {area ? <Path d={area} fill={BRAND} fillOpacity={0.1} /> : null}

            {coords.length > 1 ? (
              <Polyline
                points={polyline}
                fill="none"
                stroke={BRAND}
                strokeWidth={2.5}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ) : null}

            <Circle cx={latest.x} cy={latest.y} r={5} fill={BRAND} stroke="#FFFFFF" strokeWidth={2} />
          </Svg>
        ) : null}
      </View>

      {/* صف عادي بواجهة RTL: أول عنصر بيطلع يمين — نفس ترتيب الرسم فوق */}
      <View className="mt-1.5 flex-row justify-between px-1">
        <Num className="font-sans text-[10.5px] text-faint">{oldestLabel}</Num>
        <Num className="font-sans text-[10.5px] text-faint">{newestLabel}</Num>
      </View>

      {points.length === 1 ? (
        <Text className="mt-2 text-center font-sans text-[11px] text-faint">
          قراءة وحدة لحد الآن — المنحنى بيبان بعد فحص تاني
        </Text>
      ) : null}
    </View>
  );
}
