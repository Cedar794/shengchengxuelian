/**
 * 日历视图组件 - 支持周视图，显示预约和冲突
 */
import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';

const CalendarView = ({ reservations = [], onSlotClick, onReservationClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // 获取周日期范围
  const getWeekDates = (date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date);
    monday.setDate(diff);

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push(d);
    }
    return dates;
  };

  // 时间槽配置
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 8; hour <= 22; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  }, []);

  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate]);

  // 安全获取小时数
  const getHour = (timeStr) => {
    if (!timeStr) return 0;
    const parts = timeStr.split(':');
    return parseInt(parts[0], 10) || 0;
  };

  // 检查是否有预约
  const getReservationForSlot = (date, time) => {
    if (!reservations || reservations.length === 0) return null;

    const dateStr = date.toISOString().split('T')[0];
    const currentHour = getHour(time);

    return reservations.find(r => {
      if (!r || !r.reservation_date) return false;
      const startHour = getHour(r.start_time);
      const endHour = getHour(r.end_time);
      return r.reservation_date === dateStr &&
             startHour <= currentHour &&
             endHour > currentHour;
    });
  };

  // 检测冲突
  const detectConflicts = useMemo(() => {
    if (!reservations || reservations.length === 0) return [];

    const conflicts = [];
    const reservationsByDateTime = {};

    reservations.forEach(r => {
      if (!r || !r.reservation_date || !r.start_time) return;
      const key = `${r.reservation_date}-${r.start_time}`;
      if (!reservationsByDateTime[key]) {
        reservationsByDateTime[key] = [];
      }
      reservationsByDateTime[key].push(r);
    });

    Object.values(reservationsByDateTime).forEach(group => {
      if (group.length > 1) {
        conflicts.push(...group);
      }
    });

    return conflicts;
  }, [reservations]);

  // 导航
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // 格式化日期显示
  const formatDateHeader = (date) => {
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    const isToday = date.toDateString() === new Date().toDateString();

    return (
      <div className={`text-center py-2 ${isToday ? 'bg-blue-50' : ''}`}>
        <div className="text-xs text-gray-500">周{days[date.getDay()]}</div>
        <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
          {date.getDate()}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* 头部导航 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <button onClick={goToPrevious} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button onClick={goToNext} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
          <button onClick={goToToday} className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            今天
          </button>
        </div>

        <div className="text-lg font-medium text-gray-700">
          {weekDates[0].getMonth() + 1}月{weekDates[0].getDate()}日 - {weekDates[6].getMonth() + 1}月{weekDates[6].getDate()}日
        </div>

        <span className="px-3 py-1 text-sm rounded-full bg-blue-500 text-white">周视图</span>
      </div>

      {/* 冲突提示 */}
      {detectConflicts.length > 0 && (
        <div className="mx-4 mt-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <span className="text-sm text-red-700">检测到 {detectConflicts.length} 个时间冲突</span>
        </div>
      )}

      {/* 日历网格 */}
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {/* 日期头部 */}
          <div className="grid grid-cols-8 border-b border-gray-100">
            <div className="p-2 text-center text-xs text-gray-500">时间</div>
            {weekDates.map((date, idx) => (
              <div key={idx} className="border-l border-gray-100">
                {formatDateHeader(date)}
              </div>
            ))}
          </div>

          {/* 时间格子 */}
          <div className="max-h-[400px] overflow-y-auto">
            {timeSlots.map((time, timeIdx) => (
              <div key={time} className="grid grid-cols-8 border-b border-gray-50">
                <div className="p-2 text-center text-xs text-gray-500 bg-gray-50">{time}</div>
                {weekDates.map((date, dateIdx) => {
                  const reservation = getReservationForSlot(date, time);
                  const isConflict = reservation && detectConflicts.includes(reservation);

                  return (
                    <div
                      key={`${dateIdx}-${timeIdx}`}
                      className={`border-l border-gray-50 p-1 min-h-[40px] cursor-pointer hover:bg-blue-50 transition-colors ${
                        reservation ? (isConflict ? 'bg-red-50' : 'bg-green-50') : ''
                      }`}
                      onClick={() => reservation ? onReservationClick?.(reservation) : onSlotClick?.(date, time)}
                    >
                      {reservation && (
                        <div className={`text-xs p-1 rounded truncate ${
                          isConflict ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'
                        }`} title={reservation.purpose}>
                          {reservation.purpose}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 图例 */}
      <div className="flex items-center justify-center gap-6 px-4 py-3 border-t border-gray-100 bg-gray-50">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-200 rounded" />
          <span className="text-xs text-gray-600">已预约</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-200 rounded" />
          <span className="text-xs text-gray-600">冲突</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-white border border-gray-200 rounded" />
          <span className="text-xs text-gray-600">可预约</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
