import React, { useRef, useEffect, useState } from 'react';

export default function ScrollSection({ name, children }) {
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
    <section ref={ref} id={name} style={{ height: '100vh', position: 'relative' }}>
      {children({ inView, ref })}
    </section>
  );
} 