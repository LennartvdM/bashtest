// Visibility state reducer
export const visibilityReducer = (state, action) => {
  switch (action.type) {
    case 'SHOW_HEADER':
      return { ...state, header: true };
    case 'SHOW_VIDEO':
      return { ...state, video: true };
    case 'SHOW_CAPTIONS':
      return { ...state, captions: true };
    case 'RESET':
      return { header: false, video: false, captions: false };
    case 'SHOW_ALL':
      return { header: true, video: true, captions: true };
    default:
      return state;
  }
};

// Measurements state reducer
export const measurementsReducer = (state, action) => {
  switch (action.type) {
    case 'SET_RECT':
      return { ...state, rect: action.payload };
    case 'SET_RIGHT_RECT':
      return { ...state, rightRect: action.payload, rightReady: true };
    case 'SET_CAPTION_TOP':
      return { ...state, captionTop: action.payload };
    case 'SET_HEADER_HEIGHT':
      return { ...state, headerHeight: action.payload };
    case 'SET_VIDEO_TOP':
      return { ...state, videoTop: action.payload };
    case 'SET_COLLECTION_TOP':
      return { ...state, collectionTop: action.payload };
    case 'SET_VIDEO_AND_CAPTION_TOP':
      return { ...state, videoAndCaptionTop: action.payload };
    case 'SET_BITE_RECT':
      return { ...state, biteRect: action.payload };
    case 'SET_NAVBAR_HEIGHT':
      return { ...state, navbarHeight: action.payload };
    case 'SET_HIGHLIGHTER':
      return { ...state, highlighterLeftPx: action.payload.left, highlighterWidthPx: action.payload.width };
    default:
      return state;
  }
};

// Interaction state reducer
export const interactionReducer = (state, action) => {
  switch (action.type) {
    case 'SET_PAUSED':
      return { ...state, isPaused: action.payload };
    case 'SET_HOVERED_INDEX':
      return { ...state, hoveredIndex: action.payload };
    case 'SET_VIDEO_HOVER':
      return { ...state, videoHover: action.payload };
    case 'ENABLE_INTERACTIONS':
      return { ...state, interactionsEnabled: true };
    case 'DISABLE_INTERACTIONS':
      return { ...state, interactionsEnabled: false, videoHover: false, hoveredIndex: null };
    case 'RESET':
      return { isPaused: true, hoveredIndex: null, videoHover: false, interactionsEnabled: false };
    default:
      return state;
  }
};
