const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const post = async (route: string, body: object) => {
  await fetch(`${BASE_URL}${route}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
};

let intervalId: NodeJS.Timeout | null = null;

const tick = async () => {
  try {
    await Promise.all([
      post("/api/temperature", {
        data: (20 + Math.random() * 10).toFixed(2),
      }),
      post("/api/gas", { data: randomInt(200, 800) }),
      post("/api/movement", { data: String(randomInt(0, 1)) }),
      post("/api/rfid", {
        data: {
          uid: ["A1B2C3", "D4E5F6"][randomInt(0, 1)],
          is_valid: String(randomInt(0, 1)),
        },
      }),
    ]);
  } catch (e) {
    console.error(e);
  }
};

export const startSimulation = () => {
  if (intervalId) return;

  tick();
  intervalId = setInterval(tick, 3000);
};

export const stopSimulation = () => {
  if (intervalId) clearInterval(intervalId);
  intervalId = null;
};