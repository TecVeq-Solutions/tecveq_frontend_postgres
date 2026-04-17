/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        'hero-pattern': `url('/src/assets/images/login-bg.png')`,
        'center-img': `url('/src/assets/images/login-boy.png')`,
      },
      colors: {
        maroon: "#A41D30",
        maroon_100: "rgba(164, 29, 48, 0.1)",
        maroon_10: "#F6E8EA",
        tea: "#E0ADB1",
        red: "#C53F3F",
        green: "#108206",
        green_dark: "#11AF03",
        green_light: "rgba(16, 130, 6, 0.1)",
        grey: "#919191",
        yellow_green_light: "#63AE18",
        white: "#fff",
        black: "#000",
        orange: "#D27508",
        orange_light: "#FCF4ED",
        grey_700: "#344054",
        grey_600: "#475467",
      },
    },
    fontFamily: {
      poppins: ["Poppins", "sans-serif"],
      inter: ["Inter", "Poppins"]
    },
  },

  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        ".scrollbar-hide": {
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        },
      });
    },
  ],
};
