import { useRef, useEffect, useState } from 'react';

function Timeline({ events }) {
  const timelineRef = useRef(null);
  const [visibleEvents, setVisibleEvents] = useState([]);

  useEffect(() => {
    setVisibleEvents(events);
  }, [events]);

  // Calculer la position des événements sur la timeline
  const getTimelinePosition = (year) => {
    const minYear = 1800;
    const maxYear = new Date().getFullYear();
    const range = maxYear - minYear;
    const position = ((year - minYear) / range) * 100;
    return Math.min(Math.max(position, 0), 100);
  };

  // Grouper les événements par année pour éviter les chevauchements
  const groupedEvents = visibleEvents.reduce((acc, event) => {
    const year = event.start;
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(event);
    return acc;
  }, {});

  // Trier les années
  const sortedYears = Object.keys(groupedEvents).sort((a, b) => parseInt(a) - parseInt(b));

  // Scroll vers un événement
  const scrollToEvent = (year) => {
    if (timelineRef.current) {
      const position = getTimelinePosition(year);
      const scrollPosition = (position / 100) * (timelineRef.current.scrollWidth - timelineRef.current.clientWidth);
      timelineRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="timeline-container">
      {/* Ligne centrale de la timeline */}
      <div className="timeline-line"></div>

      {/* Conteneur des événements */}
      <div 
        ref={timelineRef} 
        style={{
          display: 'flex',
          overflowX: 'auto',
          padding: '20px 0',
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}
      >
        {/* Échelle des années (toutes les décennies) */}
        <div style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          height: '40px',
          display: 'flex',
          justifyContent: 'space-between',
          pointerEvents: 'none',
        }}>
          {Array.from({ length: Math.floor((new Date().getFullYear() - 1800) / 10) + 1 }, (_, i) => {
            const year = 1800 + i * 10;
            return (
              <div 
                key={year} 
                style={{
                  position: 'absolute',
                  left: `${getTimelinePosition(year)}%`,
                  transform: 'translateX(-50%)',
                  textAlign: 'center',
                  fontSize: '0.8rem',
                  color: 'var(--text-light)',
                }}
              >
                {year}
              </div>
            );
          })}
        </div>

        {/* Événements */}
        <div style={{ display: 'flex', minWidth: '200%', position: 'relative' }}>
          {sortedYears.map((year) => (
            <div 
              key={year} 
              style={{
                position: 'absolute',
                left: `${getTimelinePosition(parseInt(year))}%`,
                transform: 'translateX(-50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: '40px',
              }}
            >
              {/* Point sur la ligne */}
              <div 
                style={{
                  width: '16px',
                  height: '16px',
                  backgroundColor: groupedEvents[year][0].color || 'var(--primary-color)',
                  borderRadius: '50%',
                  marginBottom: '10px',
                  zIndex: 10,
                  boxShadow: '0 0 0 3px white',
                }}
              ></div>

              {/* Conteneur des événements pour cette année */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '300px' }}>
                {groupedEvents[year].map((event, index) => (
                  <div 
                    key={`${event.id}-${index}`}
                    className="card"
                    style={{
                      padding: '12px',
                      backgroundColor: 'white',
                      borderLeft: `4px solid ${event.color || 'var(--primary-color)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      maxWidth: '300px',
                    }}
                    onClick={() => {
                      if (event.link) {
                        window.location.href = event.link;
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>{event.icon}</span>
                      <div>
                        <div className="timeline-title" style={{ fontSize: '1rem', fontWeight: '600' }}>
                          {event.title}
                        </div>
                        <div className="timeline-date" style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                          {event.start === event.end ? event.start : `${event.start}-${event.end}`}
                        </div>
                      </div>
                    </div>
                    <div className="timeline-description" style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                      {event.description}
                    </div>
                    {event.subtitle && (
                      <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '6px' }}>
                        {event.subtitle}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Boutons de navigation rapide */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
        {[1800, 1830, 1850, 1880, 1900, 1920, 1940, 1960, 1980, 2000].map((year) => (
          <button 
            key={year} 
            onClick={() => scrollToEvent(year)} 
            className="button"
            style={{ padding: '8px 16px', fontSize: '0.9rem' }}
          >
            {year}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Timeline;
