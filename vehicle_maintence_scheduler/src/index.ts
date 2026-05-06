 import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Log } from "../../logging_middleware/dist/index";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const BASE_URL = "http://20.207.122.201/evaluation-service";
const AUTH_TOKEN = process.env.AUTH_TOKEN || "";

// Knapsack algorithm to maximize impact within mechanic hours
function knapsack(vehicles: any[], capacity: number) {
  const n = vehicles.length;
  const dp: number[][] = Array(n + 1)
    .fill(null)
    .map(() => Array(capacity + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    const duration = vehicles[i - 1].Duration;
    const impact = vehicles[i - 1].Impact;
    for (let w = 0; w <= capacity; w++) {
      if (duration <= w) {
        dp[i][w] = Math.max(dp[i - 1][w], dp[i - 1][w - duration] + impact);
      } else {
        dp[i][w] = dp[i - 1][w];
      }
    }
  }

  // Backtrack to find selected tasks
  const selected: any[] = [];
  let w = capacity;
  for (let i = n; i > 0; i--) {
    if (dp[i][w] !== dp[i - 1][w]) {
      selected.push(vehicles[i - 1]);
      w -= vehicles[i - 1].Duration;
    }
  }

  return { selected, totalImpact: dp[n][capacity] };
}

// Main scheduler endpoint
app.get("/schedule", async (req: express.Request, res: express.Response) => {
  try {
    Log("backend", "info", "handler", "Schedule request received");

    // Fetch depots
    Log("backend", "info", "service", "Fetching depots from test server");
    const depotsRes = await fetch(`${BASE_URL}/depots`, {
      headers: { Authorization: `Bearer ${AUTH_TOKEN}` }
    });
    const depotsData = await depotsRes.json() as { depots: any[] };
    Log("backend", "info", "service", `Fetched ${depotsData.depots.length} depots`);

    // Fetch vehicles
    Log("backend", "info", "service", "Fetching vehicles from test server");
    const vehiclesRes = await fetch(`${BASE_URL}/vehicles`, {
      headers: { Authorization: `Bearer ${AUTH_TOKEN}` }
    });
    const vehiclesData = await vehiclesRes.json() as { vehicles: any[] };
    Log("backend", "info", "service", `Fetched ${vehiclesData.vehicles.length} vehicles`);

    // Run knapsack for each depot
    const results = depotsData.depots.map((depot: any) => {
      Log("backend", "debug", "service", `Running scheduler for depot ${depot.ID} with ${depot.MechanicHours} hours`);
      const { selected, totalImpact } = knapsack(vehiclesData.vehicles, depot.MechanicHours);
      return {
        depotID: depot.ID,
        mechanicHours: depot.MechanicHours,
        totalImpact,
        totalDuration: selected.reduce((sum: number, v: any) => sum + v.Duration, 0),
        selectedTasks: selected.map((v: any) => v.TaskID)
      };
    });

    Log("backend", "info", "handler", "Scheduling completed successfully");
    res.status(200).json({ results });

  } catch (error) {
    Log("backend", "error", "handler", `Scheduling failed: ${error}`);
    res.status(500).json({ error: "Scheduling failed" });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  Log("backend", "info", "config", `Vehicle scheduler running on port ${PORT}`);
  console.log(`Vehicle scheduler running on port ${PORT}`);
});
