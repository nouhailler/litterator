import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

const EVENT_GROUPS = [
  { id: 'movement', label: 'Mouvements littéraires' },
  { id: 'author', label: 'Auteurs' },
  { id: 'work', label: 'Œuvres' },
  { id: 'event', label: 'Événements historiques' },
];

const ZOOM_LEVELS = [72, 96, 124, 156, 196, 244];
const SIDE_PADDING = 220;

function Timeline({ events, activeEventId }) {
  const timelineRef = useRef(null);
  const zoomFocusYearRef = useRef(null);
  const lastActiveEventIdRef = useRef(null);
  const dragStateRef = useRef({ isDragging: false, lastX: 0, moved: false });
  const [focusedYear, setFocusedYear] = useState(null);
  const [pinnedYear, setPinnedYear] = useState(null);
  const [zoomIndex, setZoomIndex] = useState(2);
  const [isDragging, setIsDragging] = useState(false);
  const yearGap = ZOOM_LEVELS[zoomIndex];

  const activeEvent = useMemo(
    () => events.find((event) => event.id === activeEventId),
    [activeEventId, events],
  );

  const groupedEvents = useMemo(
    () => events.reduce((acc, event) => {
      const year = event.start;
      acc[year] = [...(acc[year] || []), event];
      return acc;
    }, {}),
    [events],
  );

  const sortedYears = useMemo(
    () => Object.keys(groupedEvents).map(Number).sort((a, b) => a - b),
    [groupedEvents],
  );

  const yearPositions = useMemo(
    () => Object.fromEntries(sortedYears.map((year, index) => [year, SIDE_PADDING + index * yearGap])),
    [sortedYears, yearGap],
  );

  const trackWidth = Math.max((sortedYears.length - 1) * yearGap + SIDE_PADDING * 2, 720);

  const scaleYears = useMemo(() => {
    const maxTicks = 14;
    const step = Math.max(1, Math.ceil(sortedYears.length / maxTicks));
    return sortedYears.filter((year, index) => index % step === 0 || year === activeEvent?.start);
  }, [activeEvent, sortedYears]);

  const navigationYears = useMemo(() => {
    const maxButtons = 18;
    const movementStartYears = new Set(events.filter((event) => event.type === 'movement').map((event) => event.start));
    const step = Math.max(1, Math.ceil(sortedYears.length / maxButtons));

    return sortedYears.filter((year, index) =>
      index % step === 0 || movementStartYears.has(year) || year === activeEvent?.start,
    );
  }, [activeEvent, events, sortedYears]);

  const scrollToYear = useCallback((year, behavior = 'smooth') => {
    if (!timelineRef.current) {
      return;
    }

    const targetPosition = yearPositions[year] ?? SIDE_PADDING;
    const scrollPosition = targetPosition - (timelineRef.current.clientWidth / 2);

    timelineRef.current.scrollTo({
      left: Math.max(scrollPosition, 0),
      behavior,
    });
  }, [yearPositions]);

  const panTimeline = (direction) => {
    if (!timelineRef.current) {
      return;
    }

    timelineRef.current.scrollBy({
      left: direction * timelineRef.current.clientWidth * 0.72,
      behavior: 'smooth',
    });
  };

  const handlePointerDown = (event) => {
    if (!timelineRef.current || event.button > 0) {
      return;
    }

    if (event.target.closest('button, a, details, summary')) {
      return;
    }

    dragStateRef.current = {
      isDragging: true,
      lastX: event.clientX,
      moved: false,
    };
    setIsDragging(true);
    timelineRef.current.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!timelineRef.current || !dragStateRef.current.isDragging) {
      return;
    }

    const deltaX = event.clientX - dragStateRef.current.lastX;
    if (Math.abs(deltaX) > 2) {
      dragStateRef.current.moved = true;
    }

    timelineRef.current.scrollLeft -= deltaX;
    dragStateRef.current.lastX = event.clientX;
  };

  const stopDragging = (event) => {
    if (!dragStateRef.current.isDragging) {
      return;
    }

    if (timelineRef.current?.hasPointerCapture(event.pointerId)) {
      timelineRef.current.releasePointerCapture(event.pointerId);
    }

    dragStateRef.current.isDragging = false;
    setIsDragging(false);
  };

  const changeZoom = (direction) => {
    const currentYear = pinnedYear || focusedYear || activeEvent?.start || sortedYears[0];
    zoomFocusYearRef.current = currentYear;

    setZoomIndex((current) => Math.min(Math.max(current + direction, 0), ZOOM_LEVELS.length - 1));
  };

  useLayoutEffect(() => {
    if (!activeEvent || lastActiveEventIdRef.current === activeEvent.id) {
      return;
    }

    lastActiveEventIdRef.current = activeEvent.id;
    setFocusedYear(activeEvent.start);
    setPinnedYear(activeEvent.start);

    const frame = window.requestAnimationFrame(() => {
      scrollToYear(activeEvent.start, 'auto');

      window.requestAnimationFrame(() => {
        scrollToYear(activeEvent.start);
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [activeEvent, scrollToYear]);

  useEffect(() => {
    if (!focusedYear && sortedYears.length > 0) {
      setFocusedYear(sortedYears[0]);
    }
  }, [focusedYear, sortedYears]);

  useLayoutEffect(() => {
    if (!zoomFocusYearRef.current) {
      return;
    }

    scrollToYear(zoomFocusYearRef.current, 'auto');
    zoomFocusYearRef.current = null;
  }, [scrollToYear, yearGap]);

  const visibleYear = pinnedYear || focusedYear;

  return (
    <div className="timeline-container">
      <div className="timeline-toolbar" aria-label="Contrôles de la timeline">
        <button type="button" className="button button-secondary" onClick={() => panTimeline(-1)}>
          Gauche
        </button>
        <button type="button" className="button button-secondary" onClick={() => panTimeline(1)}>
          Droite
        </button>
        <button
          type="button"
          className="button button-secondary"
          onClick={() => changeZoom(-1)}
          disabled={zoomIndex === 0}
        >
          -
        </button>
        <button
          type="button"
          className="button button-secondary"
          onClick={() => changeZoom(1)}
          disabled={zoomIndex === ZOOM_LEVELS.length - 1}
        >
          +
        </button>
        <span>{sortedYears.length} repères · écart {yearGap}px</span>
      </div>

      <div
        ref={timelineRef}
        className={`timeline-scroll ${isDragging ? 'is-dragging' : ''}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        onPointerLeave={stopDragging}
      >
        <div className="timeline-track" style={{ width: `${trackWidth}px` }}>
          <div className="timeline-track-line" />

          <div className="timeline-scale" aria-hidden="true">
            {scaleYears.map((year) => (
              <div
                key={year}
                className="timeline-scale-year"
                style={{ left: `${yearPositions[year]}px` }}
              >
                {year}
              </div>
            ))}
          </div>

          {sortedYears.map((year) => {
            const yearEvents = groupedEvents[year];
            const isActiveYear = activeEvent?.start === year;
            const isFocusedYear = visibleYear === year;

            return (
              <div
                key={year}
                id={`timeline-year-${year}`}
                className="timeline-year"
                style={{ left: `${yearPositions[year]}px` }}
                onMouseEnter={() => setFocusedYear(year)}
                onMouseLeave={() => {
                  if (!pinnedYear) {
                    setFocusedYear(null);
                  }
                }}
              >
                <button
                  type="button"
                  className={`timeline-point ${isActiveYear ? 'is-active' : ''} ${isFocusedYear ? 'is-focused' : ''}`}
                  aria-label={`${year}, ${yearEvents.length} éléments`}
                  aria-expanded={isFocusedYear}
                  onClick={(clickEvent) => {
                    if (dragStateRef.current.moved) {
                      clickEvent.preventDefault();
                      dragStateRef.current.moved = false;
                      return;
                    }

                    const nextPinnedYear = pinnedYear === year ? null : year;
                    setPinnedYear(nextPinnedYear);
                    setFocusedYear(year);
                    scrollToYear(year);
                  }}
                >
                  <span>{yearEvents.length}</span>
                </button>
                <div className="timeline-year-label">{year}</div>

                {isFocusedYear && (
                  <TimelineYearPanel
                    year={year}
                    events={yearEvents}
                    activeEventId={activeEventId}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="timeline-quick-nav">
        {navigationYears.map((year) => (
          <button
            key={year}
            type="button"
            onClick={() => {
              setFocusedYear(year);
              setPinnedYear(year);
              scrollToYear(year);
            }}
            className={`button ${visibleYear === year ? 'is-active' : ''}`}
          >
            {year}
          </button>
        ))}
      </div>
    </div>
  );
}

function TimelineYearPanel({ year, events, activeEventId }) {
  const eventsByType = EVENT_GROUPS.map((group) => ({
    ...group,
    events: events.filter((event) => event.type === group.id),
  })).filter((group) => group.events.length > 0);

  return (
    <div className="timeline-year-panel">
      <div className="timeline-year-panel-header">
        <strong>{year}</strong>
        <span>{events.length} élément{events.length > 1 ? 's' : ''}</span>
      </div>

      <div className="timeline-type-summary">
        {eventsByType.map((group) => (
          <span key={group.id}>
            {group.label}: {group.events.length}
          </span>
        ))}
      </div>

      {eventsByType.map((group, index) => (
        <details key={group.id} className="timeline-detail-group" open={index === 0 || group.events.length <= 3}>
          <summary>
            <span>{group.label}</span>
            <strong>{group.events.length}</strong>
          </summary>
          <div className="timeline-detail-list">
            {group.events.map((event) => (
              <a
                key={event.id}
                id={event.id}
                href={event.link || '#'}
                className={`timeline-detail-item ${activeEventId === event.id ? 'is-highlighted' : ''}`}
                onClick={(clickEvent) => {
                  if (!event.link) {
                    clickEvent.preventDefault();
                  }
                }}
              >
                <span className="timeline-detail-title">{event.title}</span>
                <span className="timeline-detail-date">
                  {event.start === event.end ? event.start : `${event.start}-${event.end}`}
                </span>
                {event.subtitle && <span className="timeline-detail-subtitle">{event.subtitle}</span>}
              </a>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}

export default Timeline;
