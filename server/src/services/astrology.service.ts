const signs = ["Capricorn", "Aquarius", "Pisces", "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius"];

export const astrologyService = {
  get(date?: string) {
    const value = date ? new Date(date) : new Date();
    const zodiac = signs[(value.getMonth() + (value.getDate() > 20 ? 1 : 0)) % 12];
    return {
      zodiac,
      daily: `${zodiac}: focus on one practical learning goal today.`,
      monthly: "This month rewards steady practice and reflective career choices.",
      personality: "A self-reflection prompt, not an astronomical assessment.",
      disclaimer: "Astrology is provided for entertainment and self-reflection."
    };
  }
};
