const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

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
        data: {
          value: (20 + Math.random() * 10).toFixed(2),
          state: null
        },
      }),
      post("/api/gas", {
        data: {
          value: randomInt(200, 800),
          state: null
        }
      }),
      post("/api/movement", {
        data: {
          value: null,
          state: String(randomInt(0, 1))
        }
      }),
      post("/api/rfid", {
        data: {
          value: ["A1B2C3", "D4E5F6"][randomInt(0, 1)],
          state: String(randomInt(0, 1)),
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