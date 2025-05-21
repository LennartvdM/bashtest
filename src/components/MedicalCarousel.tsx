  <div
    data-testid="medical-carousel-background"
    style={{
      position: 'fixed',
      top: '0',
      left: '0',
      width: `${videoRect.left}px`,
      height: '100vh',
      backgroundColor: 'rgba(255, 0, 0, 0.3)', // Bright red with transparency
      zIndex: 0,
      transition: 'transform 0.3s ease',
      transform: isHovered ? 'translateY(-20px)' : 'none',
    }}
  /> 