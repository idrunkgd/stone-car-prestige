const Module = require("module"); const path = require("path");
const orig = Module._resolveFilename;
Module._resolveFilename = function (r, ...a) { return r === "server-only" ? path.join(__dirname,"noop.cjs") : orig.call(this, r, ...a); };
const store = require("./out/subscription-store.js");
const db = require("./out/db.js");
const { randomBytes, scryptSync } = require("crypto");

(async () => {
  const salt = randomBytes(16).toString("hex");
  const account = {
    id: "acc-gerald", email: "gerald@example.com", name: "Gérald Devestele",
    phone: "0470 12 34 56", passwordHash: scryptSync("Azerty12", salt, 64).toString("hex"),
    salt, token: "tok-demo", createdAt: new Date().toISOString(),
    vehicles: [{ id: "v1", make: "Porsche", model: "Macan", plate: "1-ABC-123", category: "suv" }],
  };
  await db.putDoc("accounts", account.id, account);

  const specs = [
    { name: "Carte Essential", credits: 5, price: 120, theme: "onyx", description: "5 lavages extérieurs." },
    { name: "Carte Premium", credits: 10, price: 250, theme: "or", description: "10 lavages, extérieur et intérieur.", conditions: "Valable 12 mois, non remboursable." },
    { name: "Carte Prestige", credits: 20, price: 450, theme: "platine", description: "20 lavages, toutes prestations." },
  ];
  const plans = [];
  for (const s of specs) plans.push(await store.addPlan(s));

  const c1 = await store.assignCard({ planId: plans[1].id, holder: { accountId: "acc-gerald", name: "Gérald Devestele", email: "gerald@example.com", phone: "0470 12 34 56", plates: ["1-ABC-123"] }, by: "stone@stone.be", paid: true });
  for (let i = 0; i < 4; i++)
    await store.consumeCredit({ cardId: c1.card.id, idempotencyKey: `seed-${i}`, operator: "stone@stone.be", operatorRole: "admin", source: i % 2 ? "qr" : "manuel", serviceLabel: "Lavage Premium" });

  const c2 = await store.assignCard({ planId: plans[0].id, holder: { name: "Marie Dupont", phone: "0495 88 77 66", plates: ["2-XYZ-789"] }, by: "stone@stone.be", paid: false });
  await store.consumeCredit({ cardId: c2.card.id, idempotencyKey: "seed-m", operator: "stone@stone.be", operatorRole: "admin", source: "manuel" });

  const c3 = await store.assignCard({ planId: plans[2].id, holder: { name: "Jean Lambert", phone: "0488 11 22 33", plates: ["3-JKL-456"] }, by: "stone@stone.be", paid: true, expiresAt: new Date(Date.now() + 12*86400000).toISOString() });

  console.log("carte principale:", c1.card.id, "| token:", c1.card.qrToken);
})();
