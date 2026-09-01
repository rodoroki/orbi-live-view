import { ORBI_EVENTS } from "@/lib/orbi-events";
import { mockEventsToOrbiEvents } from "@/lib/data/adapters/mock-source";
import { toLegacyEvents } from "@/lib/data/adapters/legacy-view-adapter";
import { OrbiEventSchema } from "@/lib/schemas";

let failures = 0;

function check(label: string, cond: boolean, detail?: string) {
  if (!cond) {
    failures++;
    console.log(`FALHA: ${label}${detail ? " — " + detail : ""}`);
  }
}

const canonical = mockEventsToOrbiEvents();

check(
  "quantidade de eventos preservada",
  canonical.length === ORBI_EVENTS.length,
  `${canonical.length} vs ${ORBI_EVENTS.length}`,
);

// 1) Todo evento canônico deve validar contra o schema Zod.
for (const event of canonical) {
  const result = OrbiEventSchema.safeParse(event);
  check(`schema válido para ${event.id}`, result.success, result.success ? undefined : JSON.stringify(result.error.issues));
}

// 2) Round-trip completo: mock -> canônico -> legado, comparado ao mock original.
const roundTripped = toLegacyEvents(canonical);
const byId = new Map(roundTripped.map((e) => [e.id, e]));

for (const original of ORBI_EVENTS) {
  const back = byId.get(original.id);
  check(`evento ${original.id} presente após round-trip`, !!back);
  if (!back) continue;

  check(`${original.id}: title`, back.title === original.title);
  check(`${original.id}: place`, back.place === original.place);
  check(`${original.id}: lat`, back.lat === original.lat);
  check(`${original.id}: lng`, back.lng === original.lng);
  check(`${original.id}: category`, back.category === original.category, `${back.category} vs ${original.category}`);
  check(`${original.id}: magnitude`, back.magnitude === original.magnitude, `"${back.magnitude}" vs "${original.magnitude}"`);
  check(`${original.id}: severity`, back.severity === original.severity);
  check(`${original.id}: region`, back.region === original.region, `${back.region} vs ${original.region}`);
  check(`${original.id}: priority`, back.priority === original.priority, `${back.priority} vs ${original.priority}`);
  check(
    `${original.id}: detectedMinutesAgo (tolerância 1min)`,
    Math.abs(back.detectedMinutesAgo - original.detectedMinutesAgo) <= 1,
    `${back.detectedMinutesAgo} vs ${original.detectedMinutesAgo}`,
  );
}

console.log("");
if (failures === 0) {
  console.log(`OK — ${ORBI_EVENTS.length} eventos passaram no round-trip mock -> OrbiEvent -> legado.`);
} else {
  console.log(`${failures} falha(s) encontrada(s).`);
  process.exit(1);
}
