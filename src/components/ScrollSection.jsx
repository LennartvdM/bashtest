import React, { useRef, useEffect, useState } from 'react';

export default function ScrollSection({ name, children, background }) {
  const ref = useRef();
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      id={name}
      style={{
        minHeight: '100vh',
        width: '100%',
        scrollSnapAlign: 'start',
        position: 'relative',
        backgroundColor: background || 'transparent',
      }}
    >
      {children({ inView, ref })}
    </section>
  );
} 