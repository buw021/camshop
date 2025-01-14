export const variants = {
    entrance: {
      opacity: 1,
      x: 0,
      transition: { ease: "linear", duration: 0.2 },
    },
    exit: {
      opacity: 0,
      x: -50,
      transition: { ease: "linear", duration: 0.2 },
    },
    "logo-entrance": {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.3 },
    },
    "logo-exit": {
      opacity: 0,
      scale: -1,
      transition: { duration: 0.3 },
    },
    "menu-entrance": {
      opacity: 1,
      y: 0,
      transition: { ease: "linear", duration: 0.2 },
    },
    "menu-exit": {
      opacity: 0,
      y: -10,
      transition: { ease: "linear", duration: 0.2 },
    },
    "fade-in": {
      opacity: 1,
      transition: { ease: "linear", duration: 0.2 },
      
    },"fade-out": {
        opacity: 0,
        transition: { ease: "linear", duration: 0.2 },
    }
  };