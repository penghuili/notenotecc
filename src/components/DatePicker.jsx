import { Button } from '@radix-ui/themes/dist/cjs/index.js';
import { RiArrowLeftSLine, RiArrowRightSLine } from '@remixicon/react';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

export const DatePicker = ({ value, onChange }) => {
  const [selectedDate, setSelectedDate] = useState(value || new Date());
  const [viewDate, setViewDate] = useState(value || new Date());
  const [viewMode, setViewMode] = useState('days'); // 'days', 'months', 'years'

  useEffect(() => {
    if (value) {
      setSelectedDate(new Date(value));
      setViewDate(new Date(value));
    }
  }, [value]);

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const startOfMonth = (year, month) => {
    const start = new Date(year, month, 1).getDay();
    return start === 0 ? 6 : start - 1; // Adjust to make Monday 0 and Sunday 6
  };

  const handleDateClick = day => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    setSelectedDate(newDate);
    onChange(newDate);
  };

  const handleMonthClick = month => {
    setViewDate(new Date(viewDate.getFullYear(), month, 1));
    setViewMode('days');
  };

  const handleYearClick = year => {
    setViewDate(new Date(year, viewDate.getMonth(), 1));
    setViewMode('months');
  };

  const renderWeekdays = () => {
    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return weekdays.map(day => <WeekdayLabel key={day}>{day}</WeekdayLabel>);
  };

  const renderDays = () => {
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
  };

  const renderMonths = () => {
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
  };

  const renderYears = () => {
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
  };

  const navigatePrev = () => {
    if (viewMode === 'days') {
      setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    } else if (viewMode === 'months') {
      setViewDate(new Date(viewDate.getFullYear() - 1, viewDate.getMonth(), 1));
    } else {
      setViewDate(new Date(viewDate.getFullYear() - 12, viewDate.getMonth(), 1));
    }
  };

  const navigateNext = () => {
    if (viewMode === 'days') {
      setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    } else if (viewMode === 'months') {
      setViewDate(new Date(viewDate.getFullYear() + 1, viewDate.getMonth(), 1));
    } else {
      setViewDate(new Date(viewDate.getFullYear() + 12, viewDate.getMonth(), 1));
    }
  };

  return (
    <Wrapper>
      <Header>
        <NavButton onClick={navigatePrev}>
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
          Today
        </HeaderTitle>
        <NavButton onClick={navigateNext}>
          <RiArrowRightSLine />
        </NavButton>
      </Header>
      <Content>
        {viewMode === 'days' && (
          <>
            {renderWeekdays()}
            {renderDays()}
          </>
        )}
        {viewMode === 'months' && renderMonths()}
        {viewMode === 'years' && renderYears()}
      </Content>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 330px;
  background-color: white;
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
