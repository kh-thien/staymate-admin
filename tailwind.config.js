export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        "slide-in": "slideIn 0.3s ease-out",
        "slide-out": "slideOut 0.3s ease-out",
      },
      keyframes: {
        slideIn: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
        slideOut: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-100%)" },
        },
      },
    },
  },
  plugins: [
    // Custom scrollbar plugin
    function ({ addUtilities }) {
      const newUtilities = {
        ".scrollbar-thin": {
          "scrollbar-width": "thin",
        },
        ".scrollbar-thumb-gray-300": {
          "&::-webkit-scrollbar-thumb": {
            "background-color": "#d1d5db",
            "border-radius": "0.25rem",
          },
        },
        ".scrollbar-thumb-gray-400": {
          "&::-webkit-scrollbar-thumb": {
            "background-color": "#9ca3af",
            "border-radius": "0.25rem",
          },
        },
        ".scrollbar-track-transparent": {
          "&::-webkit-scrollbar-track": {
            "background-color": "transparent",
          },
        },
        ".scrollbar-thin::-webkit-scrollbar": {
          width: "6px",
          height: "6px",
        },
      };
      addUtilities(newUtilities);
    },
  ],
};
