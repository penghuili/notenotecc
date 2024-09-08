import { Button } from '@radix-ui/themes';
import { RiArrowLeftSLine, RiArrowRightSLine, RiCalendarLine } from '@remixicon/react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import fastMemo from 'react-fast-memo';
import styled from 'styled-components';

const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const startOfMonth = (year, month) => {
  const start = new Date(year, month, 1).getDay();
  return start === 0 ? 6 : start - 1; // Adjust to make Monday 0 and Sunday 6
};

export const DatePicker = fastMemo(({ value, onChange }) => {
  const [selectedDate, setSelectedDate] = useState(value || new Date());
  const [viewDate, setViewDate] = useState(value || new Date());
  const [viewMode, setViewMode] = useState('days'); // 'days', 'months', 'years'

  useEffect(() => {
    if (value) {
      setSelectedDate(new Date(value));
      setViewDate(new Date(value));
    }
  }, [value]);

  const handleDateClick = useCallback(
    day => {
      const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
      setSelectedDate(newDate);
      onChange(newDate);
    },
    [onChange, viewDate]
  );

  const handleMonthClick = useCallback(
    month => {
      setViewDate(new Date(viewDate.getFullYear(), month, 1));
      setViewMode('days');
    },
    [viewDate]
  );

  const handleYearClick = useCallback(
    year => {
      setViewDate(new Date(year, viewDate.getMonth(), 1));
      setViewMode('months');
    },
    [viewDate]
  );

  const handleNavigatePrev = useCallback(() => {
    if (viewMode === 'days') {
      setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    } else if (viewMode === 'months') {
      setViewDate(new Date(viewDate.getFullYear() - 1, viewDate.getMonth(), 1));
    } else {
      setViewDate(new Date(viewDate.getFullYear() - 12, viewDate.getMonth(), 1));
    }
  }, [viewDate, viewMode]);

  const handleNavigateNext = useCallback(() => {
    if (viewMode === 'days') {
      setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    } else if (viewMode === 'months') {
      setViewDate(new Date(viewDate.getFullYear() + 1, viewDate.getMonth(), 1));
    } else {
      setViewDate(new Date(viewDate.getFullYear() + 12, viewDate.getMonth(), 1));
    }
  }, [viewDate, viewMode]);

  const weekDays = useMemo(() => {
    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return weekdays.map(day => <WeekdayLabel key={day}>{day}</WeekdayLabel>);
  }, []);

  const daysElements = useMemo(() => {
    const days = [];
    const daysCount = daysInMonth(viewDate.getFullYear(), viewDate.getMonth());
    const startDay = startOfMonth(viewDate.getFullYear(), viewDate.getMonth());

    for (let i = 0; i < startDay; i++) {
      days.push(<Button key={`empty-${i}`} variant="ghost" style={{ width: '36px' }}></Button>);
    }

    for (let i = 1; i <= daysCount; i++) {
      const isSelected =
        selectedDate.getDate() === i &&
        selectedDate.getMonth() === viewDate.getMonth() &&
        selectedDate.getFullYear() === viewDate.getFullYear();
      days.push(
        <Button
          key={i}
          variant={isSelected ? 'solid' : 'soft'}
          onClick={() => handleDateClick(i)}
          style={{ width: '36px' }}
        >
          {i}
        </Button>
      );
    }

    return days;
  }, [handleDateClick, selectedDate, viewDate]);

  const monthsElements = useMemo(() => {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return months.map((month, index) => (
      <Button
        key={month}
        variant="soft"
        onClick={() => handleMonthClick(index)}
        style={{ width: '36px' }}
      >
        {month}
      </Button>
    ));
  }, [handleMonthClick]);

  const yearsElements = useMemo(() => {
    const currentYear = viewDate.getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 6; i++) {
      years.push(
        <Button key={i} variant="soft" onClick={() => handleYearClick(i)} style={{ width: '36px' }}>
          {i}
        </Button>
      );
    }
    return years;
  }, [handleYearClick, viewDate]);

  return (
    <Wrapper>
      <Header>
        <NavButton onClick={handleNavigatePrev}>
          <RiArrowLeftSLine />
        </NavButton>
        {viewMode === 'days' && (
          <HeaderTitle onClick={() => setViewMode('months')}>
            {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </HeaderTitle>
        )}
        {viewMode === 'months' && (
          <HeaderTitle onClick={() => setViewMode('years')}>{viewDate.getFullYear()}</HeaderTitle>
        )}
        {viewMode === 'years' && (
          <HeaderTitle>
            {viewDate.getFullYear() - 5} - {viewDate.getFullYear() + 6}
          </HeaderTitle>
        )}
        <HeaderTitle
          onClick={() => {
            onChange(new Date());
            setViewMode('days');
          }}
        >
          <RiCalendarLine />
        </HeaderTitle>
        <NavButton onClick={handleNavigateNext}>
          <RiArrowRightSLine />
        </NavButton>
      </Header>
      <Content>
        {viewMode === 'days' && (
          <>
            {weekDays}
            {daysElements}
          </>
        )}
        {viewMode === 'months' && monthsElements}
        {viewMode === 'years' && yearsElements}
      </Content>
    </Wrapper>
  );
});

const Wrapper = styled.div`
  width: 330px;
  background-color: var(--color-background);
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
`;

const HeaderTitle = styled.button`
  font-size: 14px;
  font-weight: 500;
  color: #4a4a4a;
  background: none;
  border: none;
  cursor: pointer;
  &:hover {
    color: #333;
  }
`;

const NavButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #4a4a4a;
  &:hover {
    color: #333;
  }
`;

const Content = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  padding: 12px;
`;

const WeekdayLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 500;
  color: #757575;
  padding: 4px 0;
`;
